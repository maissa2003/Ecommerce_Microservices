import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-trainer-profiles',
  templateUrl: './trainer-profiles.component.html',
  styleUrls: ['./trainer-profiles.component.scss']
})
export class TrainerProfilesComponent implements OnInit {
  profiles: any[] = [];
  loading = false;
  error: string | null = null;

  private baseUrl = 'http://localhost:8090/api/admin/trainer-profiles';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.loading = true;
    this.error = null;

    this.http.get<any[]>(this.baseUrl).subscribe({
      next: data => {
        this.profiles = data;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load trainer profiles';
        this.loading = false;
        console.error('Error loading profiles:', err);
      }
    });
  }

  deleteProfile(id: number): void {
    if (!confirm('Are you sure you want to delete this trainer profile?'))
      return;

    this.http.delete(`${this.baseUrl}/${id}`).subscribe({
      next: () => {
        this.profiles = this.profiles.filter(p => p.id !== id);
      },
      error: err => {
        alert('Failed to delete profile');
        console.error('Error deleting profile:', err);
      }
    });
  }

  viewProfile(profile: any): void {
    // Navigate to profile details or open modal
    console.log('View profile:', profile);
  }
}
