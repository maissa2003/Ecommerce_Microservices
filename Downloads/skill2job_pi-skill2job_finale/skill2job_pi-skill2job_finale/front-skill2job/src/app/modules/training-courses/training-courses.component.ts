import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TrainingCourseService } from './services/training-course.service';
import { CategoryService } from './servicesCategory/category.service';
import { CurrencyConversionService } from './servicesCurrency/currency-conversion.service';
import { PaymentService } from './payment/services/payment.service';
import { CouponService, Coupon } from './coupon/coupon.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// ✅ Interface pour les trainers
export interface TrainerUser {
  id: number;
  username: string;
  email: string;
}

@Component({
  selector: 'app-training-courses',
  templateUrl: './training-courses.component.html',
  styleUrls: ['./training-courses.component.css']
})
export class TrainingCoursesComponent implements OnInit {
  // ── Courses ──────────────────────────────────────────────────────
  courses: any[] = [];
  pagedCourses: any[] = [];

  newCourse: any = {
    title: '',
    description: '',
    category: { id: null, name: '' },
    price: null,
    currency: 'USD',
    pointsPrice: null,
    trainerId: null // ✅ NOUVEAU
  };

  editingCourseId: number | null = null;
  showCourseForm = false;
  courseFormMode: 'add' | 'edit' = 'add';

  selectedImage?: File | null = null;
  selectedPdfs: File[] = [];
  imagePreview: string | null = null;

  expandedCategories: Set<number> = new Set();

  originalPrice: number | null = null;
  originalCurrency: string | null = null;
  lastCurrency = 'USD';

  currencies = [
    { code: 'USD', symbol: '$', name: 'Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'TND', symbol: 'DT', name: 'Dinar' }
  ];

  // ✅ NOUVEAU : liste des trainers pour le dropdown
  trainers: TrainerUser[] = [];

  // ── Categories ───────────────────────────────────────────────────
  categories: any[] = [];
  newCategory: any = { name: '', description: '' };
  editingCategoryId: number | null = null;
  showCategoryForm = false;
  categoryFormMode: 'add' | 'edit' = 'add';

  // ── Payments ─────────────────────────────────────────────────────
  payments: any[] = [];
  paymentsLoading = false;
  paymentActionLoading: { [id: number]: boolean } = {};
  adminNotes: { [id: number]: string } = {};
  rejectReason: { [id: number]: string } = {};
  showRejectModal: number | null = null;

  // ── Coupons ──────────────────────────────────────────────────────
  coupons: Coupon[] = [];
  couponsLoading = false;
  showCouponForm = false;
  couponFormMode: 'add' | 'edit' = 'add';
  editingCouponId: number | null = null;
  couponActionLoading: { [id: number]: boolean } = {};

  newCoupon: Coupon = this.blankCoupon();

  // ── Shared ───────────────────────────────────────────────────────
  activeView: 'courses' | 'categories' | 'payments' | 'coupons' = 'courses';

  // Pagination
  currentPage = 1;
  pageSize = 6;

  constructor(
    private service: TrainingCourseService,
    private categoryService: CategoryService,
    private currencyConversion: CurrencyConversionService,
    private paymentService: PaymentService,
    private couponService: CouponService,
    private http: HttpClient,
    private router: Router
  ) {}

  get environment() {
    return environment;
  }

  ngOnInit(): void {
    this.loadCourses();
    this.loadCategories();
    this.loadTrainers(); // ✅ NOUVEAU
  }

  // ════════════════════════════════════════════════════════════════
  // ✅ TRAINERS
  // ════════════════════════════════════════════════════════════════

  loadTrainers(): void {
    this.http
      .get<TrainerUser[]>(`${environment.apiUrl}/users/trainers`)
      .subscribe({
        next: data => (this.trainers = data || []),
        error: () => (this.trainers = [])
      });
  }

  getTrainerName(trainerId: number | null): string {
    if (!trainerId) return 'No trainer assigned';
    const t = this.trainers.find(t => t.id === trainerId);
    return t ? t.username : `Trainer #${trainerId}`;
  }

  // ════════════════════════════════════════════════════════════════
  // COUPONS
  // ════════════════════════════════════════════════════════════════

  private blankCoupon(): Coupon {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    return {
      code: '',
      discountPercentage: 10,
      expiryDate: tomorrow.toISOString().split('T')[0],
      active: true
    };
  }

  loadCoupons(): void {
    this.couponsLoading = true;
    this.couponService.getAll().subscribe({
      next: data => {
        this.coupons = data || [];
        this.couponsLoading = false;
      },
      error: () => {
        this.coupons = [];
        this.couponsLoading = false;
      }
    });
  }

  openAddCouponForm(): void {
    this.couponFormMode = 'add';
    this.editingCouponId = null;
    this.newCoupon = this.blankCoupon();
    this.showCouponForm = true;
  }

  editCoupon(c: Coupon): void {
    this.couponFormMode = 'edit';
    this.editingCouponId = c.id ?? null;
    this.newCoupon = { ...c };
    this.showCouponForm = true;
  }

  cancelCouponEdit(): void {
    this.showCouponForm = false;
    this.editingCouponId = null;
    this.newCoupon = this.blankCoupon();
  }

  saveCoupon(): void {
    const code = this.newCoupon.code?.trim().toUpperCase();
    if (!code) return alert('Code is required');
    if (
      !this.newCoupon.discountPercentage ||
      this.newCoupon.discountPercentage <= 0 ||
      this.newCoupon.discountPercentage > 100
    )
      return alert('Discount must be 1–100 %');
    if (!this.newCoupon.expiryDate) return alert('Expiry date is required');

    const payload: Coupon = { ...this.newCoupon, code };

    const req = this.editingCouponId
      ? this.couponService.update(this.editingCouponId, payload)
      : this.couponService.create(payload);

    req.subscribe({
      next: () => {
        this.loadCoupons();
        this.cancelCouponEdit();
      },
      error: err => alert(err?.error?.error || 'Save failed')
    });
  }

  deleteCoupon(id: number): void {
    if (!confirm('Delete this coupon?')) return;
    this.couponActionLoading[id] = true;
    this.couponService.delete(id).subscribe({
      next: () => {
        this.couponActionLoading[id] = false;
        this.loadCoupons();
      },
      error: () => {
        this.couponActionLoading[id] = false;
      }
    });
  }

  toggleCoupon(id: number): void {
    this.couponActionLoading[id] = true;
    this.couponService.toggle(id).subscribe({
      next: updated => {
        const idx = this.coupons.findIndex(c => c.id === id);
        if (idx !== -1) this.coupons[idx] = updated;
        this.couponActionLoading[id] = false;
      },
      error: () => {
        this.couponActionLoading[id] = false;
      }
    });
  }

  isCouponExpired(c: Coupon): boolean {
    return new Date(c.expiryDate) < new Date(new Date().toDateString());
  }

  getCouponStatus(c: Coupon): 'active' | 'expired' | 'inactive' {
    if (!c.active) return 'inactive';
    if (this.isCouponExpired(c)) return 'expired';
    return 'active';
  }

  get activeCouponsCount(): number {
    return this.coupons.filter(c => this.getCouponStatus(c) === 'active')
      .length;
  }

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  // ════════════════════════════════════════════════════════════════
  // PAYMENTS
  // ════════════════════════════════════════════════════════════════

  loadPayments(): void {
    this.paymentsLoading = true;
    this.paymentService.getAllPayments().subscribe({
      next: (data: any[]) => {
        this.payments = (data || []).sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.paymentsLoading = false;
      },
      error: () => {
        this.payments = [];
        this.paymentsLoading = false;
      }
    });
  }

  approvePayment(paymentId: number): void {
    this.paymentActionLoading[paymentId] = true;
    const notes = this.adminNotes[paymentId] || '';
    this.paymentService.approvePayment(paymentId, notes).subscribe({
      next: () => {
        this.paymentActionLoading[paymentId] = false;
        this.loadPayments();
      },
      error: err => {
        alert('APPROVE ERROR ' + err.status + ': ' + JSON.stringify(err.error));
        this.paymentActionLoading[paymentId] = false;
      }
    });
  }

  openRejectModal(paymentId: number): void {
    this.showRejectModal = paymentId;
    this.rejectReason[paymentId] = '';
  }

  closeRejectModal(): void {
    this.showRejectModal = null;
  }

  confirmReject(paymentId: number): void {
    const reason = this.rejectReason[paymentId] || 'Payment rejected by admin';
    this.paymentActionLoading[paymentId] = true;
    this.paymentService.rejectPayment(paymentId, reason).subscribe({
      next: () => {
        this.paymentActionLoading[paymentId] = false;
        this.showRejectModal = null;
        this.loadPayments();
      },
      error: () => {
        this.paymentActionLoading[paymentId] = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const map: any = {
      PENDING: 'status-pending',
      APPROVED: 'status-approved',
      REJECTED: 'status-rejected',
      REFUNDED: 'status-refunded'
    };
    return map[status] || '';
  }

  getMethodIcon(method: string): string {
    const map: any = { CREDIT_CARD: '💳', WALLET: '👛', BANK_TRANSFER: '🏦' };
    return map[method] || '💰';
  }

  getCourseName(courseId: number): string {
    return (
      this.courses.find(c => c.id === courseId)?.title || `Course #${courseId}`
    );
  }

  get pendingPaymentsCount(): number {
    return this.payments.filter(p => p.status === 'PENDING').length;
  }
  get approvedCount(): number {
    return this.payments.filter(p => p.status === 'APPROVED').length;
  }
  get totalRevenue(): number {
    return this.payments
      .filter(p => p.status === 'APPROVED')
      .reduce((sum, p) => sum + (p.finalPrice || 0), 0);
  }

  // ════════════════════════════════════════════════════════════════
  // VIEW SWITCHING
  // ════════════════════════════════════════════════════════════════

  switchView(view: 'courses' | 'categories' | 'payments' | 'coupons'): void {
    this.activeView = view;
    if (view === 'payments') this.loadPayments();
    if (view === 'coupons') this.loadCoupons();
  }

  // ════════════════════════════════════════════════════════════════
  // CURRENCY
  // ════════════════════════════════════════════════════════════════

  onPriceInput(): void {
    if (!this.newCourse.price || this.newCourse.price <= 0) return;
    this.originalPrice = this.newCourse.price;
    this.originalCurrency = this.newCourse.currency;
    this.lastCurrency = this.newCourse.currency;
  }

  onCurrencyChange(event: Event): void {
    const newCurrency = (event.target as HTMLSelectElement).value;
    if (!this.newCourse.price || this.newCourse.price <= 0) {
      this.newCourse.currency = newCurrency;
      this.lastCurrency = newCurrency;
      return;
    }
    this.newCourse.price = this.currencyConversion.convert(
      this.newCourse.price,
      this.lastCurrency,
      newCurrency
    );
    this.newCourse.currency = newCurrency;
    this.lastCurrency = newCurrency;
  }

  onCategoryChange(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    const found = this.categories.find(c => c.id === id);
    this.newCourse.category = found
      ? { id: found.id, name: found.name }
      : { id: null, name: '' };
  }

  // ════════════════════════════════════════════════════════════════
  // COURSES CRUD
  // ════════════════════════════════════════════════════════════════

  goToCourse(id: number): void {
    this.router.navigate(['/admin/training-courses', id]);
  }

  loadCourses(): void {
    this.service.getAll().subscribe(data => {
      this.courses = data || [];
      this.currentPage = 1;
      this.updatePage();
    });
  }

  get totalPages(): number {
    return Math.ceil(this.courses.length / this.pageSize);
  }

  updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedCourses = this.courses.slice(start, start + this.pageSize);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePage();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePage();
    }
  }

  openAddCourseForm(): void {
    this.courseFormMode = 'add';
    this.showCourseForm = true;
    this.editingCourseId = null;
    this.newCourse = {
      title: '',
      description: '',
      category: { id: null, name: '' },
      price: null,
      currency: 'USD',
      pointsPrice: null,
      trainerId: null // ✅ NOUVEAU
    };
    this.resetCurrencyState();
    this.clearFiles();
  }

  editCourse(course: any): void {
    this.editingCourseId = course.id;
    this.newCourse = {
      ...course,
      category: course.category
        ? { id: course.category.id, name: course.category.name }
        : { id: null, name: '' },
      pdfUrls: course.pdfUrls ? [...course.pdfUrls] : [],
      trainerId: course.trainerId ?? null // ✅ NOUVEAU
    };
    this.originalPrice = course.price;
    this.originalCurrency = course.currency;
    this.lastCurrency = course.currency;
    this.courseFormMode = 'edit';
    this.showCourseForm = true;
    this.imagePreview = course.imageUrl ?? null;
    this.selectedPdfs = [];
  }

  cancelCourseEdit(): void {
    this.editingCourseId = null;
    this.showCourseForm = false;
    this.newCourse = {
      title: '',
      description: '',
      category: { id: null, name: '' },
      price: null,
      currency: 'USD',
      pointsPrice: null,
      trainerId: null // ✅ NOUVEAU
    };
    this.resetCurrencyState();
    this.clearFiles();
  }

  resetCurrencyState(): void {
    this.originalPrice = null;
    this.originalCurrency = null;
    this.lastCurrency = 'USD';
  }

  addCourse(): void {
    if (!this.newCourse.title?.trim()) return alert('Title required');
    if (!this.newCourse.category?.id) return alert('Select category');
    if (!this.newCourse.price || this.newCourse.price <= 0)
      return alert('Invalid price');

    const fd = new FormData();
    fd.append('title', this.newCourse.title.trim());
    fd.append('description', this.newCourse.description || '');
    fd.append('price', this.newCourse.price.toString());
    fd.append('currency', this.newCourse.currency);
    fd.append('categoryId', this.newCourse.category.id.toString());

    if (this.newCourse.pointsPrice && this.newCourse.pointsPrice > 0) {
      fd.append('pointsPrice', this.newCourse.pointsPrice.toString());
    }

    // ✅ NOUVEAU : envoyer trainerId si sélectionné
    if (this.newCourse.trainerId) {
      fd.append('trainerId', this.newCourse.trainerId.toString());
    }

    if (this.selectedImage) {
      fd.append('image', this.selectedImage);
    }

    if (this.selectedPdfs.length > 0) {
      this.selectedPdfs.forEach(pdf => {
        fd.append('pdfs', pdf, pdf.name);
      });
    }

    if (
      this.editingCourseId &&
      this.newCourse.pdfUrls &&
      this.newCourse.pdfUrls.length > 0
    ) {
      fd.append('existingPdfs', JSON.stringify(this.newCourse.pdfUrls));
    }

    const req = this.editingCourseId
      ? this.service.update(this.editingCourseId, fd)
      : this.service.create(fd);

    req.subscribe({
      next: () => this.afterSaveCourse(),
      error: err => alert(err.message || 'Save failed')
    });
  }

  afterSaveCourse(): void {
    this.loadCourses();
    this.cancelCourseEdit();
  }

  deleteCourse(id: number): void {
    if (!confirm('Delete course?')) return;
    this.service.delete(id).subscribe(() => this.loadCourses());
  }

  // ════════════════════════════════════════════════════════════════
  // FILES HANDLING
  // ════════════════════════════════════════════════════════════════

  onImageSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedImage = input.files[0];
    const reader = new FileReader();
    reader.onload = () => (this.imagePreview = reader.result as string);
    reader.readAsDataURL(this.selectedImage);
  }

  onPdfsSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedPdfs = [...this.selectedPdfs, ...Array.from(input.files)];
    input.value = '';
  }

  removePdf(index: number): void {
    this.selectedPdfs.splice(index, 1);
  }

  removeExistingPdf(index: number): void {
    if (this.newCourse.pdfUrls && this.newCourse.pdfUrls.length > index) {
      this.newCourse.pdfUrls.splice(index, 1);
    }
  }

  getFileNameFromUrl(url: string): string {
    return url.split('/').pop() || 'document.pdf';
  }

  clearFiles(): void {
    this.selectedImage = null;
    this.selectedPdfs = [];
    this.imagePreview = null;
  }

  getCurrencySymbol(code: string): string {
    return this.currencies.find(c => c.code === code)?.symbol || '$';
  }

  // ════════════════════════════════════════════════════════════════
  // CATEGORIES CRUD
  // ════════════════════════════════════════════════════════════════

  loadCategories(): void {
    this.categoryService.getAll().subscribe(d => (this.categories = d || []));
  }

  openAddCategoryForm(): void {
    this.categoryFormMode = 'add';
    this.showCategoryForm = true;
    this.newCategory = { name: '', description: '' };
    this.editingCategoryId = null;
  }

  addCategory(): void {
    if (!this.newCategory.name?.trim()) return alert('Name required');
    const req = this.editingCategoryId
      ? this.categoryService.update(this.editingCategoryId, this.newCategory)
      : this.categoryService.create(this.newCategory);
    req.subscribe(() => this.afterSaveCategory());
  }

  afterSaveCategory(): void {
    this.loadCategories();
    this.cancelCategoryEdit();
  }

  editCategory(cat: any): void {
    this.editingCategoryId = cat.id;
    this.newCategory = { ...cat };
    this.categoryFormMode = 'edit';
    this.showCategoryForm = true;
  }

  cancelCategoryEdit(): void {
    this.editingCategoryId = null;
    this.showCategoryForm = false;
    this.newCategory = { name: '', description: '' };
  }

  deleteCategory(id: number): void {
    if (!confirm('Delete category?')) return;
    this.categoryService.delete(id).subscribe(() => {
      this.loadCategories();
      this.loadCourses();
    });
  }

  toggleCategory(id: number): void {
    this.expandedCategories.has(id)
      ? this.expandedCategories.delete(id)
      : this.expandedCategories.add(id);
  }

  isCategoryExpanded(id: number): boolean {
    return this.expandedCategories.has(id);
  }

  getCategoryCourses(id: number): any[] {
    return this.courses.filter(c => c.category?.id === id);
  }

  getCategoryCoursesCount(id: number): number {
    return this.getCategoryCourses(id).length;
  }
}
