import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { TrainingCourseService } from '../../services/training-course.service';
import { CategoryService } from '../../servicesCategory/category.service';
import { CurrencyConversionService } from '../../servicesCurrency/currency-conversion.service';
import { AuthService } from '../../../services/auth.service';
import { PaymentService } from '../../payment/services/payment.service';
import {
  CourseProgressService,
  CourseProgress
} from '../../course-progress/services/course-progress.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-user-courses',
  templateUrl: './user-courses.component.html',
  styleUrls: ['./user-courses.component.scss']
})
export class UserCoursesComponent implements OnInit {
  // ── Tab ──
  activeTab: 'courses' | 'history' | 'my-courses' = 'courses';

  // ── Courses ──
  courses: any[] = [];
  categories: any[] = [];
  filteredCourses: any[] = [];
  pagedCourses: any[] = [];

  // ── My Training Courses (paid & approved) ──
  myCourses: any[] = [];
  myCoursesLoading = false;

  selectedCategoryId: number | null = null;
  searchQuery = '';
  cardCurrencies: { [courseId: number]: string } = {};
  openDropdownId: number | null = null;
  isCatDropdownOpen = false;
  isPriceDropdownOpen = false;
  absoluteMin = 0;
  absoluteMax = 1000;
  priceMin = 0;
  priceMax = 1000;
  priceStep = 5;
  currentPage = 1;
  pageSize = 8;

  // ── Payments ──
  paidCourseIds: Set<number> = new Set();
  myPayments: any[] = [];
  paymentsLoading = false;

  // ── Course Progress ──
  courseProgressMap: Map<number, CourseProgress> = new Map();

  // ── Active Currency (for price filter display) ──
  activeCurrency: string = 'USD';

  currencies = [
    { code: 'USD', symbol: '$', name: 'Dollar', flag: '🇺🇸' },
    { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    { code: 'TND', symbol: 'DT', name: 'Dinar', flag: '🇹🇳' }
  ];

  constructor(
    private courseService: TrainingCourseService,
    private categoryService: CategoryService,
    private currencyConversion: CurrencyConversionService,
    private authService: AuthService,
    private paymentService: PaymentService,
    private progressService: CourseProgressService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadCategories();
    this.loadPaidCourses();
    this.loadAllProgress();
    this.loadUserCurrency();
  }

  // ─────────────────────────────────────────────
  // USER PREFERENCES
  // ─────────────────────────────────────────────

  loadUserCurrency(): void {
    // Try to get user's preferred currency from localStorage or user profile
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency && this.currencies.some(c => c.code === savedCurrency)) {
      this.activeCurrency = savedCurrency;
    }
  }

  setActiveCurrency(currencyCode: string): void {
    this.activeCurrency = currencyCode;
    localStorage.setItem('preferredCurrency', currencyCode);
  }

  // ─────────────────────────────────────────────
  // COURSE PROGRESS
  // ─────────────────────────────────────────────

  loadAllProgress(): void {
    if (!this.authService.isLoggedIn()) return;
    this.progressService.getMyProgress().subscribe({
      next: (progressList: CourseProgress[]) => {
        this.courseProgressMap.clear();
        progressList.forEach(p => this.courseProgressMap.set(p.courseId, p));
      },
      error: () => {
        this.courseProgressMap.clear();
      }
    });
  }

  getProgressForCourse(courseId: number): CourseProgress | undefined {
    return this.courseProgressMap.get(courseId);
  }

  hasStartedCourse(courseId: number): boolean {
    return this.courseProgressMap.has(courseId);
  }

  getProgressPercentage(courseId: number): number {
    const p = this.courseProgressMap.get(courseId);
    return p ? Math.round(p.progressPercentage) : 0;
  }

  isCourseCompleted(courseId: number): boolean {
    const p = this.courseProgressMap.get(courseId);
    return p ? p.isCompleted : false;
  }

  // ─────────────────────────────────────────────
  // MY TRAINING COURSES TAB
  // ─────────────────────────────────────────────

  switchToMyCourses(): void {
    this.activeTab = 'my-courses';
    this.loadMyCourses();
  }

  loadMyCourses(): void {
    if (!this.authService.isLoggedIn()) return;
    this.myCoursesLoading = true;

    this.paymentService.getMyPayments().subscribe({
      next: (payments: any[]) => {
        const approvedIds = payments
          .filter((p: any) => p.status === 'APPROVED')
          .map((p: any) => Number(p.courseId));

        if (this.courses.length > 0) {
          this.myCourses = this.courses.filter(c =>
            approvedIds.includes(Number(c.id))
          );
          this.myCoursesLoading = false;
        } else {
          this.courseService.getAll().subscribe({
            next: (data: any[]) => {
              this.myCourses = (data || []).filter(c =>
                approvedIds.includes(Number(c.id))
              );
              this.myCoursesLoading = false;
            },
            error: () => {
              this.myCourses = [];
              this.myCoursesLoading = false;
            }
          });
        }
      },
      error: () => {
        this.myCourses = [];
        this.myCoursesLoading = false;
      }
    });
  }

  goToCourseContent(courseId: number): void {
    this.router.navigate(['/user/courses', courseId]);
  }

  // ─────────────────────────────────────────────
  // PAYMENT HISTORY TAB
  // ─────────────────────────────────────────────

  switchToHistory(): void {
    this.activeTab = 'history';
    this.loadMyPayments();
  }

  loadMyPayments(): void {
    if (!this.authService.isLoggedIn()) return;
    this.paymentsLoading = true;
    this.paymentService.getMyPayments().subscribe({
      next: (data: any[]) => {
        this.myPayments = (data || []).sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.paymentsLoading = false;
      },
      error: () => {
        this.myPayments = [];
        this.paymentsLoading = false;
      }
    });
  }

  get pendingPaymentsCount(): number {
    return this.myPayments.filter(p => p.status === 'PENDING').length;
  }

  get enrolledCount(): number {
    return this.paidCourseIds.size;
  }

  getCourseName(courseId: number): string {
    return (
      this.courses.find(c => c.id === courseId)?.title || `Course #${courseId}`
    );
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
    const map: any = {
      CREDIT_CARD: '💳',
      WALLET: '👛',
      BANK_TRANSFER: '🏦'
    };
    return map[method] || '💰';
  }

  // ─────────────────────────────────────────────
  // PAYMENT ACCESS
  // ─────────────────────────────────────────────

  loadPaidCourses(): void {
    if (!this.authService.isLoggedIn()) return;
    this.paymentService.getMyPayments().subscribe({
      next: (payments: any[]) => {
        this.paidCourseIds = new Set(
          payments
            .filter((p: any) => p.status === 'APPROVED')
            .map((p: any) => p.courseId)
        );
      },
      error: () => {
        this.paidCourseIds = new Set();
      }
    });
  }

  hasPaidAccess(courseId: number): boolean {
    return this.paidCourseIds.has(courseId);
  }

  // ─────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────

  goToPayment(course: any, event: Event): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/signin']);
      return;
    }
    const currency = this.getCurrentCurrency(course);
    const amount = this.getDisplayPrice(course);
    this.router.navigate(['/user/payment'], {
      queryParams: { courseId: course.id, amount, currency }
    });
  }

  goToDetail(id: number): void {
    if (this.hasPaidAccess(id)) {
      this.router.navigate(['/user/courses', id]);
    } else {
      const course = this.courses.find(c => c.id === id);
      if (course) this.goToPayment(course, new Event('click'));
    }
  }

  goToWallet(): void {
    this.router.navigate(['/user/wallet']);
  }

  // ─────────────────────────────────────────────
  // UI DROPDOWNS
  // ─────────────────────────────────────────────

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openDropdownId = null;
    this.isCatDropdownOpen = false;
    this.isPriceDropdownOpen = false;
  }

  onPageClick(): void {
    this.isCatDropdownOpen = false;
    this.isPriceDropdownOpen = false;
    this.openDropdownId = null;
  }

  toggleCatDropdown(): void {
    this.isCatDropdownOpen = !this.isCatDropdownOpen;
    this.isPriceDropdownOpen = false;
    this.openDropdownId = null;
  }

  closeCatDropdown(): void {
    this.isCatDropdownOpen = false;
  }

  getSelectedCategoryName(): string {
    if (this.selectedCategoryId === null) return 'Categories';
    return (
      this.categories.find((c: any) => c.id === this.selectedCategoryId)
        ?.name || 'Categories'
    );
  }

  getSelectedCategoryCount(): number {
    if (this.selectedCategoryId === null) return 0;
    return this.getCoursesByCategory(this.selectedCategoryId).length;
  }

  togglePriceDropdown(): void {
    this.isPriceDropdownOpen = !this.isPriceDropdownOpen;
    this.isCatDropdownOpen = false;
    this.openDropdownId = null;
  }

  closePriceDropdown(): void {
    this.isPriceDropdownOpen = false;
  }

  // ─────────────────────────────────────────────
  // PRICE FILTER
  // ─────────────────────────────────────────────

  onMinChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.priceMin = Math.min(val, this.priceMax - this.priceStep);
    this.applyFilters();
  }

  onMaxChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.priceMax = Math.max(val, this.priceMin + this.priceStep);
    this.applyFilters();
  }

  getMinPercent(): number {
    const denom = this.absoluteMax - this.absoluteMin || 1;
    return ((this.priceMin - this.absoluteMin) / denom) * 100;
  }

  getMaxPercent(): number {
    const denom = this.absoluteMax - this.absoluteMin || 1;
    return ((this.priceMax - this.absoluteMin) / denom) * 100;
  }

  get priceFiltered(): boolean {
    return this.priceMin > this.absoluteMin || this.priceMax < this.absoluteMax;
  }

  resetPriceFilter(): void {
    this.priceMin = this.absoluteMin;
    this.priceMax = this.absoluteMax;
    this.applyFilters();
  }

  // ─────────────────────────────────────────────
  // FILTERS
  // ─────────────────────────────────────────────

  resetAllFilters(): void {
    this.selectedCategoryId = null;
    this.searchQuery = '';
    this.priceMin = this.absoluteMin;
    this.priceMax = this.absoluteMax;
    this.currentPage = 1;
    this.filteredCourses = [...this.courses];
    this.updatePage();
  }

  filterByCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.currentPage = 1;
    this.applyFilters();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredCourses = this.courses.filter((course: any) => {
      const matchesCategory =
        this.selectedCategoryId === null ||
        course.category?.id === this.selectedCategoryId;
      const matchesSearch =
        !q ||
        (course.title || '').toLowerCase().includes(q) ||
        (course.description || '').toLowerCase().includes(q);
      const price = this.parsePrice(course.price);
      const matchesPrice = price >= this.priceMin && price <= this.priceMax;
      return matchesCategory && matchesSearch && matchesPrice;
    });
    this.currentPage = 1;
    this.updatePage();
  }

  // ─────────────────────────────────────────────
  // PAGINATION
  // ─────────────────────────────────────────────

  get totalPages(): number {
    return Math.ceil(this.filteredCourses.length / this.pageSize);
  }

  updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedCourses = this.filteredCourses.slice(
      start,
      start + this.pageSize
    );
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

  // ─────────────────────────────────────────────
  // CURRENCY
  // ─────────────────────────────────────────────

  getCurrentCurrency(course: any): string {
    return this.cardCurrencies[course.id] || course.currency || 'USD';
  }

  getSymbolForCard(course: any): string {
    const code = this.getCurrentCurrency(course);
    return this.currencies.find(c => c.code === code)?.symbol || '$';
  }

  getDisplayPrice(course: any): number {
    const targetCurrency = this.getCurrentCurrency(course);
    const rawPrice = this.parsePrice(course.price);
    const fromCurrency = course.currency || 'USD';
    if (!rawPrice) return 0;
    if (targetCurrency === fromCurrency) return rawPrice;
    return this.currencyConversion.convert(
      rawPrice,
      fromCurrency,
      targetCurrency
    );
  }

  convertPrice(course: any, toCurrency: string): number {
    const rawPrice = this.parsePrice(course.price);
    const fromCurrency = course.currency || 'USD';
    if (!rawPrice) return 0;
    return this.currencyConversion.convert(rawPrice, fromCurrency, toCurrency);
  }

  parsePrice(price: any): number {
    if (price === null || price === undefined || price === '') return 0;
    const parsed = parseFloat(String(price));
    return isNaN(parsed) ? 0 : parsed;
  }

  toggleDropdown(courseId: number): void {
    this.openDropdownId = this.openDropdownId === courseId ? null : courseId;
    this.isCatDropdownOpen = false;
    this.isPriceDropdownOpen = false;
  }

  getOtherCurrencies(course: any): any[] {
    return this.currencies.filter(c => c.code !== (course.currency || 'USD'));
  }

  selectCurrency(courseId: number, currencyCode: string): void {
    this.cardCurrencies[courseId] = currencyCode;
    this.openDropdownId = null;
  }

  resetCurrency(courseId: number): void {
    delete this.cardCurrencies[courseId];
    this.openDropdownId = null;
  }

  // ─────────────────────────────────────────────
  // DATA LOAD
  // ─────────────────────────────────────────────

  loadCourses(): void {
    this.courseService.getAll().subscribe({
      next: (data: any[]) => {
        this.courses = data || [];
        const prices = this.courses
          .map(c => this.parsePrice(c.price))
          .filter(p => p > 0);
        if (prices.length > 0) {
          this.absoluteMin = Math.floor(Math.min(...prices));
          this.absoluteMax = Math.ceil(Math.max(...prices));
          this.priceMin = this.absoluteMin;
          this.priceMax = this.absoluteMax;
        } else {
          this.absoluteMin = 0;
          this.absoluteMax = 1000;
          this.priceMin = 0;
          this.priceMax = 1000;
        }
        this.filteredCourses = [...this.courses];
        this.currentPage = 1;
        this.updatePage();
      },
      error: () => {
        this.courses = [];
        this.filteredCourses = [];
        this.pagedCourses = [];
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data: any[]) => {
        this.categories = data || [];
      },
      error: () => {
        this.categories = [];
      }
    });
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  getImageUrl(course: any): string {
    if (!course?.imageUrl) return '/assets/placeholder.png';
    return course.imageUrl.startsWith('http')
      ? course.imageUrl
      : environment.apiUrl.replace('/api', '') + course.imageUrl;
  }

  getCoursesByCategory(categoryId: number): any[] {
    return this.courses.filter((c: any) => c.category?.id === categoryId);
  }
}
