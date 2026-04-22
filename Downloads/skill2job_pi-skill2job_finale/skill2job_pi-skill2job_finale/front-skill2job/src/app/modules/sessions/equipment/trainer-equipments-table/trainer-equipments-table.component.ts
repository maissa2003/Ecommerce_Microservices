import { Component, OnInit } from '@angular/core';
import { EquipmentService } from '../../../services/equipment.service';
import { Router } from '@angular/router';
import { Equipment } from '../../../models/equipment.model';
import { EquipmentReservation } from '../../../models/session-equipment.model';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-equipment-table',
  templateUrl: './trainer-equipments-table.component.html',
  styleUrls: ['./trainer-equipments-table.component.scss']
})
export class TrainerEquipmentTableComponent implements OnInit {
  equipments: Equipment[] = [];

  constructor(
    private equipmentService: EquipmentService,
    private router: Router,
    private notify: NotificationService
  ) {}

  selectedEquipment: any = null;

  reservations: EquipmentReservation[] = [];

  showReservationsModal = false;

  ngOnInit(): void {
    this.loadEquipments();
  }

  loadEquipments() {
    this.equipmentService.getAllEquipments().subscribe({
      next: data => {
        this.equipments = data;
      },
      error: err => {
        console.error('Error loading equipments', err);
      }
    });
  }
  deleteEquipment(id: number) {
    if (confirm('Delete this equipment?')) {
      this.equipmentService.deleteEquipment(id).subscribe(() => {
        this.equipments = this.equipments.filter(e => e.id !== id);
      });
    }
  }

  editEquipment(e: Equipment) {
    // navigate to the edit form for the selected equipment
    if (e && e.id != null) {
      this.router.navigate(['/trainer-sessions/equipments/edit', e.id]);
    }
  }
  openDetails(e: Equipment) {
    this.selectedEquipment = e;
  }

  closeDetails() {
    this.selectedEquipment = null;
  }

  openReservations(equipmentId: number) {
    this.equipmentService.getReservations(equipmentId).subscribe({
      next: data => {
        this.reservations = data;

        this.showReservationsModal = true;
      },

      error: err => {
        console.error(err);

        this.notify.error('Failed to load reservations');
      }
    });
  }

  closeReservations() {
    this.showReservationsModal = false;
  }

  getDurationHours(start?: string, end?: string): number {
    if (!start || !end) return 0;

    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();

    return Math.round((endDate - startDate) / 3600000);
  }
}
