import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SalleService } from '../../../services/salle.service';
import { BlocService } from '../../../services/blocs.service';
import { Salle } from '../../../models/salle.model';
import { Bloc } from '../../../models/blocs.model';

@Component({
  selector: 'app-salle-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './salle-form.component.html',
  styleUrls: ['./salle-form.component.scss']
})
export class SalleFormComponent implements OnInit {
  salle: Salle = {
    name: '',
    capacity: 0,
    status: 'available',
    bloc: undefined
  };

  blocs: Bloc[] = [];
  selectedBlocId?: number;

  isEdit = false;
  loading = false;
  error: string | null = null;

  constructor(
    private salleService: SalleService,
    private blocService: BlocService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBlocs();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.loadSalle(id);
    }
  }

  loadBlocs(): void {
    this.blocService.getAll().subscribe({
      next: data => {
        this.blocs = data || [];
      },
      error: () => {
        this.error = 'Failed to load blocs';
      }
    });
  }

  loadSalle(id: number): void {
    this.loading = true;
    this.salleService.getById(id).subscribe({
      next: data => {
        this.salle = data;
        this.selectedBlocId = data.bloc?.id; // auto-select bloc in edit mode
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load salle details';
        this.loading = false;
      }
    });
  }

  onBlocChange(): void {
    if (this.selectedBlocId) {
      this.salle.bloc = { id: this.selectedBlocId } as Bloc;
    } else {
      this.salle.bloc = undefined;
    }
  }

  save(): void {
    if (!this.isFormValid()) {
      this.error = 'Please fill all required fields';
      return;
    }

    if (this.isEdit && this.salle.id) {
      this.salleService.update(this.salle.id, this.salle).subscribe({
        next: () => this.router.navigate(['/trainer-sessions/rooms']),
        error: () => (this.error = 'Failed to update salle')
      });
    } else {
      this.salleService.add(this.salle).subscribe({
        next: () => this.router.navigate(['/trainer-sessions/rooms']),
        error: () => (this.error = 'Failed to add salle')
      });
    }
  }

  isFormValid(): boolean {
    return !!(
      this.salle.name &&
      this.salle.name.length >= 3 &&
      this.salle.capacity &&
      this.salle.capacity > 0 &&
      this.salle.bloc &&
      this.salle.bloc.id
    );
  }
}
