import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SalleService } from '../../../services/salle.service';
import { Salle } from '../../../models/salle.model';

@Component({
  selector: 'app-salle-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './salle-table.component.html',
  styleUrls: ['./salle-table.component.scss']
})
export class SalleTableComponent implements OnInit {
  salles: Salle[] = [];

  constructor(private salleService: SalleService) {}

  ngOnInit(): void {
    this.loadSalles();
  }

  loadSalles() {
    this.salleService.getAll().subscribe(data => {
      this.salles = data;
    });
  }

  deleteSalle(id: number) {
    if (confirm('Delete this salle?')) {
      this.salleService.delete(id).subscribe(() => {
        this.salles = this.salles.filter(s => s.id !== id);
      });
    }
  }
  selectedSalle: any = null;

  openDetails(salle: any) {
    this.selectedSalle = salle;
  }

  closeDetails() {
    this.selectedSalle = null;
  }
}
