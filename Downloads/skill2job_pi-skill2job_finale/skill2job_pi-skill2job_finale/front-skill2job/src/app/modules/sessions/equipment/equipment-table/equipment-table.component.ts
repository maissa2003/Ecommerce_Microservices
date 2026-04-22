import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EquipmentService } from '../../../services/equipment.service';
import { Router } from '@angular/router';
import { Equipment } from '../../../models/equipment.model';
import { EquipmentReservation } from '../../../models/session-equipment.model';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-equipment-table',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './equipment-table.component.html',
  styleUrls: ['./equipment-table.component.scss']
})
export class EquipmentTableComponent implements OnInit {
  equipments: Equipment[] = [];

  // Form modal properties
  showEquipmentModal = false;
  equipmentModalTitle = '';
  currentEquipment: Equipment = this.initializeEquipment();
  isEditEquipmentMode = false;
  previewImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  error: string | null = null;

  // Delete modal
  equipmentToDelete: Equipment | null = null;
  showDeleteEquipmentModal = false;

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

  initializeEquipment(): Equipment {
    return {
      name: '',
      quantity: 0,
      photo: undefined
    };
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src =
      'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23e2e8f0"/><text x="50%" y="50%" font-size="14" fill="%23666" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>';
  }

  getPhotoUrl(filename: string): string {
    return this.equipmentService.getPhotoUrl(filename);
  }

  // ───────────────────────────────────────────────────────────── EQUIPMENT MODALS

  openAddEquipmentModal(): void {
    this.isEditEquipmentMode = false;
    this.equipmentModalTitle = 'Add New Equipment';
    this.currentEquipment = this.initializeEquipment();
    this.previewImage = null;
    this.selectedFile = null;
    this.error = null;
    this.showEquipmentModal = true;
  }

  openEditEquipmentModal(equipment: Equipment): void {
    this.isEditEquipmentMode = true;
    this.equipmentModalTitle = 'Edit Equipment';
    this.currentEquipment = { ...equipment };
    this.selectedFile = null;
    this.error = null;
    if (equipment.photo) {
      this.previewImage = this.getPhotoUrl(equipment.photo);
    } else {
      this.previewImage = null;
    }
    this.showEquipmentModal = true;
  }

  openDeleteEquipmentModal(equipment: Equipment): void {
    this.equipmentToDelete = equipment;
    this.showDeleteEquipmentModal = true;
  }

  closeEquipmentModal(): void {
    this.showEquipmentModal = false;
    this.currentEquipment = this.initializeEquipment();
    this.previewImage = null;
    this.selectedFile = null;
  }

  closeDeleteEquipmentModal(): void {
    this.showDeleteEquipmentModal = false;
    this.equipmentToDelete = null;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  saveEquipment(): void {
    if (
      !this.currentEquipment.name ||
      this.currentEquipment.quantity === undefined ||
      this.currentEquipment.quantity === null
    ) {
      this.error = 'Please fill all required fields';
      return;
    }

    if (this.isEditEquipmentMode && this.currentEquipment.id) {
      // Update equipment
      const formData = new FormData();
      formData.append('name', this.currentEquipment.name);
      formData.append('quantity', this.currentEquipment.quantity.toString());
      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      this.equipmentService
        .updateWithPhoto(this.currentEquipment.id, formData)
        .subscribe({
          next: (updatedEquipment: Equipment) => {
            const index = this.equipments.findIndex(
              e => e.id === updatedEquipment.id
            );
            if (index !== -1) {
              this.equipments[index] = updatedEquipment;
            }
            this.closeEquipmentModal();
            this.error = null;
            this.notify.success('Equipment updated successfully');
          },
          error: (err: any) => {
            console.error('Error updating equipment:', err);
            const errorMsg =
              err?.error?.message ||
              err?.message ||
              'Failed to update equipment';
            this.error = errorMsg;
            this.notify.error(errorMsg);
          }
        });
    } else {
      // Add new equipment
      if (!this.selectedFile) {
        this.error = 'Please select an image';
        this.notify.error('Please select an image');
        return;
      }

      const formData = new FormData();
      formData.append('name', this.currentEquipment.name);
      formData.append('quantity', this.currentEquipment.quantity.toString());
      formData.append('file', this.selectedFile);

      console.log('Adding equipment with FormData:', {
        name: this.currentEquipment.name,
        quantity: this.currentEquipment.quantity,
        photoName: this.selectedFile?.name
      });

      this.equipmentService.addWithPhoto(formData).subscribe({
        next: (newEquipment: Equipment) => {
          console.log('Equipment added successfully:', newEquipment);
          this.equipments.push(newEquipment);
          this.closeEquipmentModal();
          this.error = null;
          this.notify.success('Equipment added successfully');
        },
        error: (err: any) => {
          console.error('Error adding equipment:', err);
          const errorMsg =
            err?.error?.message || err?.message || 'Failed to add equipment';
          this.error = errorMsg;
          this.notify.error(errorMsg);
        }
      });
    }
  }

  deleteEquipment(): void {
    if (this.equipmentToDelete && this.equipmentToDelete.id) {
      this.equipmentService
        .deleteEquipment(this.equipmentToDelete.id)
        .subscribe({
          next: () => {
            this.equipments = this.equipments.filter(
              e => e.id !== this.equipmentToDelete?.id
            );
            this.closeDeleteEquipmentModal();
            this.error = null;
            this.notify.success('Equipment deleted successfully');
          },
          error: err => {
            console.error('Error deleting equipment:', err);
            this.error = err?.error?.message || 'Failed to delete equipment';
            this.closeDeleteEquipmentModal();
          }
        });
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
