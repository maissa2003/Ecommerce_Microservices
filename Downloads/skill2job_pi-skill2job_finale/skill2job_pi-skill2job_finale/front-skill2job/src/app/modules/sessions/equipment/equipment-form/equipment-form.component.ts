import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { EquipmentService } from '../../../services/equipment.service';

@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './equipment-form.component.html',
  styleUrls: ['./equipment-form.component.scss']
})
export class EquipmentFormComponent implements OnInit {
  name = '';
  quantity = 0;
  selectedFile!: File;
  preview: string | ArrayBuffer | null = null;

  id!: number;
  isEdit = false;

  constructor(
    private equipmentService: EquipmentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // check if edit mode
    this.id = this.route.snapshot.params['id'];

    if (this.id) {
      this.isEdit = true;

      this.equipmentService.getById(this.id).subscribe(res => {
        this.name = res.name;
        this.quantity = res.quantity;

        if (res.photo) {
          this.preview = this.equipmentService.getPhotoUrl(res.photo);
        }
      });
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result;
    };
    reader.readAsDataURL(this.selectedFile);
  }

  private validateForm(): boolean {
    if (!this.name || this.name.trim().length === 0) {
      alert('Name is required');
      return false;
    }

    if (this.quantity <= 0) {
      alert('Quantity must be greater than 0');
      return false;
    }

    return true;
  }

  submit() {
    if (!this.validateForm()) {
      return;
    }

    // Case: no photo selected -> use simple add endpoint instead of add-with-photo
    if (!this.selectedFile) {
      const equipment = {
        name: this.name,
        quantity: this.quantity,
        photo: null
      };

      this.equipmentService.add(equipment as any).subscribe({
        next: () => {
          console.log('Equipment created without photo');
          this.router.navigate(['/trainer-sessions/equipments']);
        },
        error: err => {
          console.error(err);
          alert('Failed to create equipment');
        }
      });
      return;
    }

    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('quantity', this.quantity.toString());

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    // ADD
    if (!this.isEdit) {
      this.equipmentService.addWithPhoto(formData).subscribe({
        next: () => {
          console.log('Equipment created');

          // ✅ correct redirect
          this.router.navigate(['/trainer-sessions/equipments']);
        },

        error: err => console.error(err)
      });
    }

    // EDIT
    else {
      this.equipmentService.updateWithPhoto(this.id, formData).subscribe({
        next: () => {
          console.log('Equipment updated');

          // ✅ correct redirect
          this.router.navigate(['/trainer-sessions/equipments']);
        },

        error: err => console.error(err)
      });
    }
  }
}
