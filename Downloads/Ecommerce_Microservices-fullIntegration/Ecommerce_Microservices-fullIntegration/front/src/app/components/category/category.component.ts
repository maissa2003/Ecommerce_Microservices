import { Component, OnInit } from '@angular/core';
import { Category, CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  categories: Category[] = [];
  selectedCategory: Category = { name: '', description: '' };
  isEditing: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: data => (this.categories = data),
      error: err => (this.errorMessage = 'Failed to load categories')
    });
  }

  selectForEdit(category: Category): void {
    this.isEditing = true;
    this.selectedCategory = { ...category };
  }

  save(): void {
    if (this.isEditing && this.selectedCategory.id) {
      this.categoryService
        .update(this.selectedCategory.id, this.selectedCategory)
        .subscribe({
          next: () => {
            this.successMessage = 'Category updated successfully';
            this.reset();
            this.loadCategories();
          },
          error: () => (this.errorMessage = 'Failed to update category')
        });
    } else {
      this.categoryService.create(this.selectedCategory).subscribe({
        next: () => {
          this.successMessage = 'Category created successfully';
          this.reset();
          this.loadCategories();
        },
        error: () => (this.errorMessage = 'Failed to create category')
      });
    }
  }

  delete(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.delete(id).subscribe({
        next: () => {
          this.successMessage = 'Category deleted successfully';
          this.loadCategories();
        },
        error: () => (this.errorMessage = 'Failed to delete category')
      });
    }
  }

  reset(): void {
    this.selectedCategory = { name: '', description: '' };
    this.isEditing = false;
    this.errorMessage = '';
    setTimeout(() => (this.successMessage = ''), 3000);
  }
}
