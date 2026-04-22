import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionsService } from '../../../services/sessions.service';
import { NotificationService } from '../../../services/notification.service';
import { SalleService } from '../../../services/salle.service';
import { EquipmentService } from '../../../services/equipment.service';
import { AuthService, JwtResponse } from '../../../services/auth.service';
import { TrainingCourseService } from '../../../training-courses/services/training-course.service';
import { Session } from '../../../models/session.model';
import { Equipment } from '../../../models/equipment.model';
import { SessionEquipment } from '../../../models/session-equipment.model';

@Component({
  selector: 'app-sessions-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './sessions-table.component.html',
  styleUrls: ['./sessions-table.component.css']
})
export class SessionsTableComponent implements OnInit {
  sessions: Session[] = [];
  salles: any[] = [];
  formations: any[] = [];
  equipments: Equipment[] = [];
  availableEquipments: Equipment[] = [];
  selectedSession: Session | null = null;
  showAddModal = false;
  loading = false;

  // Current user info
  currentUser: JwtResponse | null = null;
  currentUserId: number | null = null;

  // editing state
  isEditing = false;
  editingSessionId: number | null = null;

  // Step tracking
  currentStep: number = 1;

  // Validation errors
  errors: { [key: string]: string } = {};
  minDate: Date = new Date(); // Today's date - prevent past dates

  // Properties for date/time handling
  startDateObj: Date | null = null;
  startTimeStr: string = '09:00';
  endDateObj: Date | null = null;
  endTimeStr: string = '11:00';

  // NEW SESSION OBJECT
  newSession: any = {
    name: '',
    type: 'ONLINE',
    startAt: null,
    endAt: null,
    capacity: 0,
    salleId: null,
    formationId: null,
    trainerId: null,
    sessionEquipments: [] as SessionEquipment[]
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sessionsService: SessionsService,
    private notify: NotificationService,
    private salleService: SalleService,
    private equipmentService: EquipmentService,
    private trainingCourseService: TrainingCourseService,
    private authService: AuthService
  ) {}

  userRole: string | null = null;

  ngOnInit(): void {
    this.loadCurrentUser();
    this.userRole = this.authService.getUserRoleString();

    if (this.userRole === 'ROLE_LEARNER') {
      // learner users should use the dedicated learner session view
      this.router.navigate(['learner'], { relativeTo: this.route });
      return;
    }

    if (this.userRole === 'ROLE_TRAINER') {
      // trainers have a dedicated trainer dashboard
      this.router.navigate(['trainer'], { relativeTo: this.route });
      return;
    }

    // admin and other roles continue in this component
    this.loadSessions();
    this.loadSalles();
    this.loadFormations();
    this.loadEquipments();
    this.availableEquipments = [...this.equipments];
  }

  // Load current user information from AuthService
  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.currentUserId = this.authService.getCurrentUserId();

    console.log('Current user loaded:', this.currentUser);
    console.log('Current user ID:', this.currentUserId);

    if (this.authService.isLoggedIn() && !this.currentUserId) {
      console.warn('User is logged in but no ID found in JwtResponse');
    }
  }

  // Check if user can create/edit sessions
  canModifySession(): boolean {
    console.log('🔍 canModifySession called');

    if (!this.authService.isLoggedIn()) {
      console.log('❌ User not logged in');
      this.notify.error('Please log in to manage sessions');
      return false;
    }

    this.userRole = this.authService.getUserRoleString();
    console.log('🔍 User role:', this.userRole);

    if (this.userRole === 'ROLE_LEARNER') {
      console.log('❌ Learner role not allowed');
      this.notify.error('Learners are not allowed to modify sessions');
      return false;
    }

    if (this.userRole !== 'ROLE_ADMIN' && this.userRole !== 'ROLE_TRAINER') {
      console.log('❌ Insufficient permissions for role:', this.userRole);
      this.notify.error('Insufficient permissions to perform this action');
      return false;
    }

    // Reload user ID to ensure it's current
    console.log('🔍 Calling getCurrentUserId...');
    this.currentUserId = this.authService.getCurrentUserId();
    console.log('🔍 Result from getCurrentUserId:', this.currentUserId);

    if (!this.currentUserId) {
      console.log('❌ User ID is null/undefined');
      this.notify.error('User ID not found. Please try logging in again.');
      return false;
    }

    console.log(
      '✅ canModifySession returning true with user ID:',
      this.currentUserId
    );
    return true;
  }

  // LOAD SESSIONS
  loadSessions() {
    this.sessionsService.getAllSessions().subscribe({
      next: data => (this.sessions = data),
      error: err => console.error(err)
    });
  }

  // LOAD SALLES
  loadSalles() {
    this.salleService.getAll().subscribe({
      next: data => (this.salles = data)
    });
  }

  // LOAD ALL EQUIPMENTS
  loadEquipments() {
    this.equipmentService.getAllEquipments().subscribe({
      next: data => {
        this.equipments = data;
        this.availableEquipments = [...data];
      }
    });
  }

  // LOAD ALL TRAINING COURSES (FORMATIONS)
  loadFormations() {
    this.trainingCourseService.getAll().subscribe({
      next: (data: any[]) => (this.formations = data),
      error: (err: any) => console.error('Error loading formations:', err)
    });
  }

  // DYNAMICALLY LOAD AVAILABLE EQUIPMENT BASED ON TIME
  refreshEquipmentAvailability() {
    if (!this.newSession.startAt || !this.newSession.endAt) return;
    this.equipmentService
      .getAvailableEquipments(this.newSession.startAt, this.newSession.endAt)
      .subscribe({
        next: data => (this.availableEquipments = data),
        error: err => console.error(err)
      });
  }

  // Helper method to combine date and time into ISO string
  private combineDateAndTime(
    date: Date | null,
    timeStr: string
  ): string | null {
    if (!date || !timeStr) return null;

    const [hours, minutes] = timeStr.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);

    return combined.toISOString();
  }

  // Update start when date changes
  onStartDateChange() {
    this.updateStartDateTime();
    this.maybeRefreshAvailability();
  }

  // Update start when time changes
  onStartTimeChange() {
    this.updateStartDateTime();
    this.maybeRefreshAvailability();
  }

  private updateStartDateTime() {
    this.newSession.startAt = this.combineDateAndTime(
      this.startDateObj,
      this.startTimeStr
    );
    delete this.errors['startDate'];
    // Auto-set end to start + 2 hours
    if (this.newSession.startAt) {
      const start = new Date(this.newSession.startAt);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

      // Update end date/time fields
      this.endDateObj = end;
      this.endTimeStr = end.toTimeString().slice(0, 5); // "HH:MM"
      this.newSession.endAt = end.toISOString();
      delete this.errors['endDate'];
      delete this.errors['duration'];
    }
  }

  // Handle manual end date changes
  onEndDateChange() {
    this.updateEndDateTime();
    this.maybeRefreshAvailability();
  }

  // Handle manual end time changes
  onEndTimeChange() {
    this.updateEndDateTime();
    this.maybeRefreshAvailability();
  }

  private updateEndDateTime() {
    this.newSession.endAt = this.combineDateAndTime(
      this.endDateObj,
      this.endTimeStr
    );
    if (this.newSession.endAt && this.newSession.startAt) {
      const start = new Date(this.newSession.startAt).getTime();
      const end = new Date(this.newSession.endAt).getTime();
      if (end > start) {
        delete this.errors['endDate'];
        delete this.errors['duration'];
      } else {
        this.errors['endDate'] = 'End date must be after start date';
      }
    }
  }

  // EDIT SESSION
  editSession(session: Session) {
    if (!session.id) return;

    if (!this.canModifySession()) return;

    this.isEditing = true;
    this.editingSessionId = session.id;

    this.newSession = {
      name: session.name,
      type: session.type,
      startAt: session.startAt,
      endAt: session.endAt,
      capacity: session.capacity,
      salleId: session.salle?.id ?? null,
      formationId: (session as any).formationId ?? null,
      trainerId: session.user?.id ?? this.currentUserId,
      sessionEquipments: session.sessionEquipments
        ? session.sessionEquipments.map((se: SessionEquipment) => ({
            equipment: se.equipment,
            quantityUsed: se.quantityUsed
          }))
        : []
    };

    // populate date/time objects for picker inputs
    this.startDateObj = session.startAt ? new Date(session.startAt) : null;
    this.startTimeStr = session.startAt
      ? new Date(session.startAt).toTimeString().slice(0, 5)
      : '09:00';
    this.endDateObj = session.endAt ? new Date(session.endAt) : null;
    this.endTimeStr = session.endAt
      ? new Date(session.endAt).toTimeString().slice(0, 5)
      : '11:00';

    this.availableEquipments = [...this.equipments];
    this.maybeRefreshAvailability();
    this.currentStep = 1;
    this.errors = {};
    this.showAddModal = true;
  }

  deleteSession(id: number) {
    if (!this.canModifySession()) return;

    if (confirm('Delete this session?')) {
      this.sessionsService.deleteSession(id).subscribe({
        next: () => {
          this.sessions = this.sessions.filter(s => s.id !== id);
          this.notify.success('Session deleted successfully');
        },
        error: err => {
          console.error('Error deleting session:', err);
          this.notify.error('Failed to delete session');
        }
      });
    }
  }

  // OPEN MODAL - FIXED
  openAddModal() {
    if (!this.canModifySession()) return;

    this.isEditing = false;
    this.editingSessionId = null;

    // Ensure we have the latest user ID
    this.currentUserId = this.authService.getCurrentUserId();

    if (!this.currentUserId) {
      this.notify.error('Could not identify user. Please log in again.');
      return;
    }

    this.newSession = {
      name: '',
      type: 'ONLINE',
      startAt: null,
      endAt: null,
      capacity: 0,
      salleId: null,
      formationId: null,
      trainerId: this.currentUserId, // CRITICAL: Set from current user
      sessionEquipments: []
    };

    // Set default times
    const now = new Date();
    const start = new Date(now);
    start.setHours(9, 0, 0, 0);

    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    this.startDateObj = start;
    this.startTimeStr = '09:00';
    this.endDateObj = end;
    this.endTimeStr = '11:00';

    this.newSession.startAt = start.toISOString();
    this.newSession.endAt = end.toISOString();

    this.availableEquipments = [...this.equipments];
    this.maybeRefreshAvailability();
    this.currentStep = 1;
    this.errors = {};
    this.showAddModal = true;

    console.log('Modal opened with trainerId:', this.newSession.trainerId);
  }

  closeAddModal() {
    this.showAddModal = false;
    this.isEditing = false;
    this.editingSessionId = null;
    this.currentStep = 1;
    this.errors = {};
  }

  // STEP NAVIGATION
  nextStep() {
    this.errors = {};

    if (this.currentStep === 1) {
      if (!this.newSession.name?.trim()) {
        this.errors['name'] = 'Session name is required';
      }
      if (!this.newSession.type) {
        this.errors['type'] = 'Session type is required';
      }
      if (this.newSession.type === 'ONSITE' && !this.newSession.salleId) {
        this.errors['salleId'] = 'Salle is required for onsite sessions';
      }

      if (Object.keys(this.errors).length > 0) {
        return;
      }
    }

    if (this.currentStep === 2) {
      if (!this.newSession.startAt) {
        this.errors['startDate'] = 'Start date is required';
      }
      if (!this.newSession.endAt) {
        this.errors['endDate'] = 'End date is required';
      }
      if (!this.newSession.capacity) {
        this.errors['capacity'] = 'Capacity is required';
      }
      if (this.newSession.startAt && this.newSession.endAt) {
        const start = new Date(this.newSession.startAt).getTime();
        const end = new Date(this.newSession.endAt).getTime();
        if (start >= end) {
          this.errors['endDate'] = 'End date must be after start date';
        }
        if (!this.isSessionDurationValid()) {
          this.errors['duration'] =
            'Session must be between 0 and 2 hours maximum';
        }
      }

      if (Object.keys(this.errors).length > 0) {
        return;
      }
    }

    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    this.errors = {};
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // REAL-TIME VALIDATION HELPERS
  onNameChange() {
    if (this.newSession.name?.trim()) {
      delete this.errors['name'];
    }
  }

  onTypeChange() {
    delete this.errors['type'];
    if (this.newSession.type !== 'ONSITE') {
      delete this.errors['salleId'];
    }
    if (this.newSession.type === 'ONSITE') {
      this.maybeRefreshAvailability();
    }
  }

  onSalleChange() {
    if (this.newSession.salleId) {
      delete this.errors['salleId'];
    }
    this.maybeRefreshAvailability();
  }

  onCapacityChange() {
    if (this.newSession.capacity) {
      delete this.errors['capacity'];
    }
  }

  // ADD EQUIPMENT LINE
  addEquipmentLine() {
    this.newSession.sessionEquipments.push({
      equipment: null,
      quantityUsed: 1
    });
    this.maybeRefreshAvailability();
  }

  // REMOVE EQUIPMENT
  removeEquipmentLine(index: number) {
    this.newSession.sessionEquipments.splice(index, 1);
  }

  // VALIDATION - FIXED
  validateForm(): boolean {
    if (!this.newSession.name?.trim()) {
      this.notify.error('Name required');
      return false;
    }

    if (!this.newSession.startAt || !this.newSession.endAt) {
      this.notify.error('Start and end date/time required');
      return false;
    }

    const start = new Date(this.newSession.startAt).getTime();
    const end = new Date(this.newSession.endAt).getTime();

    if (start >= end) {
      this.notify.error('End must be after start');
      return false;
    }

    if (this.newSession.type === 'ONSITE' && !this.newSession.salleId) {
      this.notify.error('Salle required for onsite sessions');
      return false;
    }

    // CRITICAL: Check for trainer ID
    if (!this.newSession.trainerId) {
      // Try to get it one more time from auth service
      this.newSession.trainerId = this.authService.getCurrentUserId();

      if (!this.newSession.trainerId) {
        this.notify.error(
          'Trainer information missing. Please ensure you are logged in.'
        );
        return false;
      }
    }

    return true;
  }

  // CHECK SESSION DURATION (0-2 hours)
  isSessionDurationValid(): boolean {
    if (!this.newSession.startAt || !this.newSession.endAt) return false;
    const start = new Date(this.newSession.startAt).getTime();
    const end = new Date(this.newSession.endAt).getTime();
    const diffHours = (end - start) / 3600000;
    return diffHours > 0 && diffHours <= 2;
  }

  // UTILITIES
  getEquipmentsForRow(se: SessionEquipment): Equipment[] {
    const list = [...this.availableEquipments];
    if (se.equipment && !list.find(e => e.id === se.equipment.id)) {
      list.push(se.equipment);
    }
    return list;
  }

  maybeRefreshAvailability() {
    if (
      this.newSession.type === 'ONSITE' &&
      this.newSession.startAt &&
      this.newSession.endAt
    ) {
      this.refreshEquipmentAvailability();
    }
  }

  // SAVE SESSION - FIXED
  saveSession() {
    if (!this.isSessionDurationValid()) {
      this.notify.error('Session must be between 0 and 2 hours maximum');
      return;
    }

    // Ensure trainerId is set before validation
    if (!this.newSession.trainerId) {
      this.newSession.trainerId = this.authService.getCurrentUserId();
    }

    if (!this.validateForm()) return;

    this.loading = true;

    // Prepare payload - CRITICAL: Use 'user' not 'trainer' to match backend
    const payload: any = {
      name: this.newSession.name,
      type: this.newSession.type,
      startAt: this.newSession.startAt,
      endAt: this.newSession.endAt,
      capacity: this.newSession.capacity,
      // IMPORTANT: Send as 'user' to match the backend entity field name
      user: { id: this.newSession.trainerId },
      sessionEquipments:
        this.newSession.type === 'ONSITE'
          ? this.newSession.sessionEquipments
              .filter((se: SessionEquipment) => se.equipment != null)
              .map((se: SessionEquipment) => ({
                equipment: { id: se.equipment.id },
                quantityUsed: se.quantityUsed
              }))
          : []
    };

    // Add salle for onsite sessions
    if (this.newSession.type === 'ONSITE' && this.newSession.salleId) {
      payload.salle = { id: this.newSession.salleId };
    }

    // Add formation if selected
    if (this.newSession.formationId) {
      payload.formationId = this.newSession.formationId;
    }

    console.log('Saving session with payload:', payload);
    console.log('User ID being sent:', this.newSession.trainerId);

    if (this.isEditing && this.editingSessionId != null) {
      this.sessionsService
        .updateSession(this.editingSessionId, payload)
        .subscribe({
          next: res => {
            this.loading = false;
            this.loadSessions();
            this.closeAddModal();
            this.notify.success('Session updated successfully');
          },
          error: err => this.handleError(err)
        });
    } else {
      this.sessionsService.addSession(payload).subscribe({
        next: res => {
          this.loading = false;
          this.loadSessions();
          this.closeAddModal();
          this.notify.success('Session created successfully');
        },
        error: err => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    this.loading = false;
    console.error('Full error:', err);
    if (err.error) {
      const msg =
        typeof err.error === 'string'
          ? err.error
          : err.error.message
          ? err.error.message
          : JSON.stringify(err.error);
      this.notify.error(msg);
    } else {
      this.notify.error('Server not reachable');
    }
  }

  // DETAILS
  openDetails(session: Session) {
    this.selectedSession = session;
  }

  closeDetails() {
    this.selectedSession = null;
  }

  getSessionDuration(): string {
    if (!this.newSession.startAt || !this.newSession.endAt) return '';

    const start = new Date(this.newSession.startAt);
    const end = new Date(this.newSession.endAt);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`;
  }
}
