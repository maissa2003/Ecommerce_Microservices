import { Component, OnInit } from '@angular/core';
import { HrService } from '../hr/services/hr.service';

@Component({
  selector: 'app-hr-dashboard',
  templateUrl: './hr-dashboard.component.html',
  styleUrls: ['./hr-dashboard.component.scss']
})
export class HrDashboardComponent implements OnInit {
  applications: any[] = [];
  loading = true;

  // ─── KPIs ─────────────────────────────────────────
  get total(): number {
    return this.applications.length;
  }
  get pending(): number {
    return this.applications.filter(a => a.status === 'PENDING').length;
  }
  get accepted(): number {
    return this.applications.filter(a => a.status === 'ACCEPTED').length;
  }
  get rejected(): number {
    return this.applications.filter(a => a.status === 'REJECTED').length;
  }
  get acceptanceRate(): number {
    if (this.total === 0) return 0;
    return Math.round((this.accepted / this.total) * 100);
  }

  constructor(private hrService: HrService) {}

  ngOnInit(): void {
    this.hrService.getAllApplications().subscribe({
      next: data => {
        this.applications = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ─── Donut chart data (statuts) ───────────────────
  get statusChartData(): { label: string; value: number; color: string }[] {
    return [
      { label: 'Pending', value: this.pending, color: '#f59e0b' },
      { label: 'Accepted', value: this.accepted, color: '#22c55e' },
      { label: 'Rejected', value: this.rejected, color: '#ef4444' }
    ].filter(d => d.value > 0);
  }

  // ─── Bar chart data (levels) ──────────────────────
  get levelData(): { label: string; value: number; color: string }[] {
    // récupère depuis TrainerDetails via applications — on approxime depuis motivations
    const junior = this.applications.filter(a => a.motivation?.length < 100)
      .length;
    const mid = this.applications.filter(
      a => a.motivation?.length >= 100 && a.motivation?.length < 200
    ).length;
    const senior = this.applications.filter(a => a.motivation?.length >= 200)
      .length;
    return [
      { label: 'Junior', value: junior, color: '#3b82f6' },
      { label: 'Mid', value: mid, color: '#f59e0b' },
      { label: 'Senior', value: senior, color: '#22c55e' }
    ];
  }

  // ─── SVG Donut helpers ────────────────────────────
  getDonutPath(index: number): string {
    const total = this.statusChartData.reduce((s, d) => s + d.value, 0);
    if (total === 0) return '';

    const r = 60,
      cx = 80,
      cy = 80;
    let startAngle = -90;

    for (let i = 0; i < index; i++) {
      startAngle += (this.statusChartData[i].value / total) * 360;
    }

    const slice = (this.statusChartData[index].value / total) * 360;
    const endAngle = startAngle + slice;

    const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
    const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
    const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
    const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);

    const largeArc = slice > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  getBarWidth(value: number): number {
    const max = Math.max(...this.levelData.map(d => d.value), 1);
    return Math.round((value / max) * 100);
  }
}
