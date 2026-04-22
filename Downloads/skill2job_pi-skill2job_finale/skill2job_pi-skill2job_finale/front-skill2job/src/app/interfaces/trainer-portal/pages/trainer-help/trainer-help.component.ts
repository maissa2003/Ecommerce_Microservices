import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../../../../modules/services/auth.service';

type AppStatus =
  | 'NOT_SUBMITTED'
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'UNKNOWN';

type FaqCategory =
  | 'Getting Started'
  | 'Application'
  | 'My Profile'
  | 'Courses'
  | 'Account'
  | 'Troubleshooting';

interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  tags: string[];
}

interface SupportTicket {
  id: string;
  createdAt: string;
  subject: string;
  category:
    | 'Application'
    | 'Profile'
    | 'Courses'
    | 'Payments'
    | 'Account'
    | 'Other';
  message: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED';
}

@Component({
  selector: 'app-trainer-help',
  templateUrl: './trainer-help.component.html',
  styleUrls: ['./trainer-help.component.scss']
})
export class TrainerHelpComponent implements OnInit {
  userId: number | null = null;
  appStatus: AppStatus = 'UNKNOWN';
  statusLoading = false;

  // ✅ Correct backend base route
  private appApiBase = 'http://localhost:8090/api/applications';

  // ---- FAQ ----
  q = '';
  selectedCategory: FaqCategory | 'All' = 'All';
  openId: string | null = null;

  categories: Array<FaqCategory | 'All'> = [
    'All',
    'Getting Started',
    'Application',
    'My Profile',
    'Courses',
    'Account',
    'Troubleshooting'
  ];

  faq: FaqItem[] = [
    {
      id: 'gs-1',
      category: 'Getting Started',
      question: 'How do I become an approved trainer?',
      answer:
        'Submit your application in the Apply page. HR will review it and you will receive a decision (Accepted/Rejected). Once accepted, your trainer profile becomes available.',
      tags: ['apply', 'approval', 'pending', 'accepted']
    },
    {
      id: 'app-1',
      category: 'Application',
      question: 'Can I edit my application after submitting?',
      answer:
        'You can edit your CV link and motivation only while your application is Pending. Once HR makes a decision, editing is disabled.',
      tags: ['edit', 'pending', 'motivation', 'cv']
    },
    {
      id: 'app-2',
      category: 'Application',
      question:
        'I submitted an application but I cannot see it. What should I do?',
      answer:
        'Go to My Application and click Refresh. If it still does not appear, sign out and sign back in to ensure your session is correct.',
      tags: ['not visible', 'refresh', 'session']
    },
    {
      id: 'pro-1',
      category: 'My Profile',
      question: 'Why is my AI score or skills not updating in My Profile?',
      answer:
        'AI analysis data may take a moment to sync. Use the "Refresh AI" button in My Profile. If you still do not see changes, check that you are logged in with the same account that submitted the application.',
      tags: ['ai', 'score', 'skills', 'refresh']
    },
    {
      id: 'pro-2',
      category: 'My Profile',
      question: 'When does my trainer profile become available?',
      answer:
        'Your trainer profile is generated automatically after your application is Accepted. Before acceptance, My Profile may show "Not available yet".',
      tags: ['profile', 'accepted']
    },
    {
      id: 'crs-1',
      category: 'Courses',
      question: 'Why is "Create Course" disabled?',
      answer:
        'Course creation is available only for approved trainers (Accepted). If your application is still Pending, you must wait for HR approval.',
      tags: ['create course', 'disabled', 'accepted']
    },
    {
      id: 'acc-1',
      category: 'Account',
      question: 'I was redirected to Sign In. Why?',
      answer:
        'This usually happens when your session token is missing/expired. Sign in again and ensure your user ID is stored correctly in localStorage.',
      tags: ['signin', 'token', 'session']
    },
    {
      id: 'trb-1',
      category: 'Troubleshooting',
      question: 'The page shows an error or stays blank. How can I fix it?',
      answer:
        'Try Refresh, then clear browser cache, then sign out/sign in. If the issue persists, send a support request below with a screenshot and your steps.',
      tags: ['error', 'blank', 'cache']
    }
  ];

  // ---- Support tickets ----
  ticketSubject = '';
  ticketCategory: SupportTicket['category'] = 'Application';
  ticketMessage = '';
  tickets: SupportTicket[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUserId();

    console.log('🔍 trainer-help ngOnInit - userId:', this.userId);
    console.log('🔍 getCurrentUser:', this.authService.getCurrentUser());
    console.log('🔍 getToken:', this.authService.getToken());

    this.loadTickets();
    this.loadApplicationStatus();
  }

  // -----------------------
  // Smart status loader
  // -----------------------
  loadApplicationStatus(): void {
    if (!this.userId) {
      this.appStatus = 'UNKNOWN';
      return;
    }

    this.statusLoading = true;

    const params = new HttpParams().set('userId', String(this.userId));

    this.http
      .get<any>(`${this.appApiBase}/me`, { params })
      .subscribe({
        next: app => {
          const s = String(app?.status || '').toUpperCase();

          if (!s) this.appStatus = 'PENDING';
          else if (s.includes('PEND')) this.appStatus = 'PENDING';
          else if (s.includes('ACCEPT')) this.appStatus = 'ACCEPTED';
          else if (s.includes('REJECT')) this.appStatus = 'REJECTED';
          else this.appStatus = 'UNKNOWN';

          this.statusLoading = false;
        },
        error: err => {
          if (err?.status === 404) {
            this.appStatus = 'NOT_SUBMITTED';
          } else {
            this.appStatus = 'UNKNOWN';
            console.error('Error loading application status', err);
          }
          this.statusLoading = false;
        }
      });
  }

  refreshStatus(): void {
    this.loadApplicationStatus();
  }

  // -----------------------
  // FAQ helpers
  // -----------------------
  setCategory(cat: any): void {
    this.selectedCategory = cat;
    this.openId = null;
  }

  toggle(id: string): void {
    this.openId = this.openId === id ? null : id;
  }

  get filteredFaq(): FaqItem[] {
    const query = this.q.trim().toLowerCase();

    return this.faq.filter(item => {
      const inCategory =
        this.selectedCategory === 'All' ||
        item.category === this.selectedCategory;
      if (!inCategory) return false;
      if (!query) return true;

      const hay = `${item.question} ${item.answer} ${(item.tags || []).join(
        ' '
      )}`.toLowerCase();
      return hay.includes(query);
    });
  }

  clearSearch(): void {
    this.q = '';
    this.selectedCategory = 'All';
    this.openId = null;
  }

  copy(text: string): void {
    try {
      navigator.clipboard.writeText(text);
    } catch {}
  }

  // -----------------------
  // Support tickets (localStorage)
  // -----------------------
  private ticketKey(): string {
    return `trainer_support_tickets_${this.userId || 'guest'}`;
  }

  loadTickets(): void {
    const raw = localStorage.getItem(this.ticketKey());

    if (!raw) {
      this.tickets = [];
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      this.tickets = Array.isArray(parsed) ? parsed : [];
    } catch {
      this.tickets = [];
    }
  }

  saveTickets(): void {
    localStorage.setItem(this.ticketKey(), JSON.stringify(this.tickets));
  }

  submitTicket(): void {
    const subject = this.ticketSubject.trim();
    const message = this.ticketMessage.trim();

    if (!subject || message.length < 10) return;

    const ticket: SupportTicket = {
      id: `TCK-${Math.random()
        .toString(16)
        .slice(2, 8)
        .toUpperCase()}`,
      createdAt: new Date().toISOString(),
      subject,
      category: this.ticketCategory,
      message,
      status: 'OPEN'
    };

    this.tickets = [ticket, ...this.tickets];
    this.saveTickets();

    this.ticketSubject = '';
    this.ticketCategory = 'Application';
    this.ticketMessage = '';
  }

  markResolved(id: string): void {
    this.tickets = this.tickets.map(t =>
      t.id === id ? { ...t, status: 'RESOLVED' } : t
    );
    this.saveTickets();
  }

  // -----------------------
  // Recommended actions
  // -----------------------
  get recommendations(): {
    title: string;
    desc: string;
    link?: string;
    icon: string;
  }[] {
    if (this.appStatus === 'NOT_SUBMITTED') {
      return [
        {
          icon: '📝',
          title: 'Submit your application',
          desc: 'Start your trainer journey by applying now.',
          link: '/trainer-portal/apply'
        },
        {
          icon: '📌',
          title: 'Track your progress',
          desc: 'After submission, follow the status in My Application.',
          link: '/trainer-portal/my-application'
        }
      ];
    }

    if (this.appStatus === 'PENDING') {
      return [
        {
          icon: '⏳',
          title: 'Wait for HR review',
          desc:
            'Your application is being reviewed. You will be notified once a decision is made.'
        },
        {
          icon: '✏️',
          title: 'Update while pending',
          desc:
            'You can update CV link and motivation while status is Pending.',
          link: '/trainer-portal/my-application'
        }
      ];
    }

    if (this.appStatus === 'REJECTED') {
      return [
        {
          icon: '🔁',
          title: 'Review rejection feedback',
          desc: 'Open My Application and read the reason/message from HR.',
          link: '/trainer-portal/my-application'
        },
        {
          icon: '🛠️',
          title: 'Improve your application',
          desc: 'Enhance your CV link and motivation, then reapply if allowed.',
          link: '/trainer-portal/apply'
        }
      ];
    }

    if (this.appStatus === 'ACCEPTED') {
      return [
        {
          icon: '👤',
          title: 'Open My Profile',
          desc:
            'Your trainer profile is available. Check your AI score and detected skills.',
          link: '/trainer-portal/my-profile'
        },
        {
          icon: '🤖',
          title: 'Refresh AI insights',
          desc:
            'If AI fields look empty, use Refresh AI in My Profile to sync changes.',
          link: '/trainer-portal/my-profile'
        }
      ];
    }

    return [
      {
        icon: '🔍',
        title: 'Check My Application',
        desc:
          'We could not detect your status. Open My Application to confirm.',
        link: '/trainer-portal/my-application'
      }
    ];
  }

  get statusBadge(): { label: string; cls: string } {
    switch (this.appStatus) {
      case 'NOT_SUBMITTED':
        return { label: 'Not submitted', cls: 'neutral' };
      case 'PENDING':
        return { label: 'Pending', cls: 'wait' };
      case 'ACCEPTED':
        return { label: 'Accepted', cls: 'ok' };
      case 'REJECTED':
        return { label: 'Rejected', cls: 'bad' };
      default:
        return { label: 'Unknown', cls: 'neutral' };
    }
  }
}
