// ============================================================
// Custom type stubs for packages with incomplete installations
// (created because npm install cannot complete due to network issues)
// ============================================================

// ── jsPDF ────────────────────────────────────────────────────
declare module 'jspdf' {
  class jsPDF {
    constructor(
      orientation?: string,
      unit?: string,
      format?: string | number[]
    );
    internal: { pageSize: { getWidth(): number; getHeight(): number } };
    text(text: string, x: number, y: number, options?: any): this;
    addPage(): this;
    save(filename?: string): this;
    output(type?: string, options?: any): any;
    addImage(
      imageData: any,
      format: string,
      x: number,
      y: number,
      width: number,
      height: number
    ): this;
    setFontSize(size: number): this;
    setFont(fontName: string, fontStyle?: string): this;
    setTextColor(r: number, g?: number, b?: number): this;
    setDrawColor(r: number, g?: number, b?: number): this;
    setFillColor(r: number, g?: number, b?: number): this;
    setLineWidth(width: number): this;
    rect(x: number, y: number, w: number, h: number, style?: string): this;
    roundedRect(
      x: number,
      y: number,
      w: number,
      h: number,
      rx: number,
      ry: number,
      style?: string
    ): this;
    line(x1: number, y1: number, x2: number, y2: number): this;
  }
  export default jsPDF;
}

// ── chart.js/auto ─────────────────────────────────────────────
declare module 'chart.js/auto' {
  export {
    Chart,
    ChartConfiguration,
    ChartType,
    ChartData,
    ChartOptions
  } from 'chart.js';
  export * from 'chart.js';
}

// ── @angular/material sub-entries ────────────────────────────
// These stubs are needed because the @angular/material package was only
// partially downloaded — the type declaration files (.d.ts) are missing
// from the sub-directories (core/, datepicker/, etc.)

declare module '@angular/material/core' {
  import { ModuleWithProviders, NgModule } from '@angular/core';
  export class MatNativeDateModule {}
  export class MatCommonModule {}
  export class MatRippleModule {}
  export class DateAdapter<D> {}
  export class NativeDateAdapter extends DateAdapter<Date> {}
  export const MAT_DATE_LOCALE: any;
  export const MAT_DATE_FORMATS: any;
  export const MAT_NATIVE_DATE_FORMATS: any;
}

declare module '@angular/material/datepicker' {
  export class MatDatepickerModule {}
  export class MatDatepicker<D> {}
  export class MatDatepickerToggle<D> {}
  export class MatDatepickerInput<D> {}
  export class MatCalendar<D> {}
  export const MatDatepickerInputEvent: any;
}

declare module '@angular/material/form-field' {
  export class MatFormFieldModule {}
  export class MatFormField {}
  export class MatLabel {}
  export class MatHint {}
  export class MatError {}
  export class MatPrefix {}
  export class MatSuffix {}
}

declare module '@angular/material/input' {
  export class MatInputModule {}
  export class MatInput {}
}

declare module '@angular/material/icon' {
  export class MatIconModule {}
  export class MatIcon {}
}

declare module '@angular/material/button' {
  export class MatButtonModule {}
  export class MatButton {}
}

declare module '@angular/material/table' {
  export class MatTableModule {}
  export class MatTable<T> {}
  export class MatColumnDef {}
  export class MatHeaderCell {}
  export class MatCell {}
  export class MatHeaderRow {}
  export class MatRow {}
}

declare module '@angular/material/paginator' {
  export class MatPaginatorModule {}
  export class MatPaginator {}
}

declare module '@angular/material/sort' {
  export class MatSortModule {}
  export class MatSort {}
  export class MatSortHeader {}
}

declare module '@angular/material/select' {
  export class MatSelectModule {}
  export class MatSelect {}
  export class MatOption {}
}

declare module '@angular/material/dialog' {
  import { InjectionToken } from '@angular/core';
  export class MatDialogModule {}
  export class MatDialog {}
  export class MatDialogRef<T, R = any> {
    close(dialogResult?: R): void;
  }
  export class MatDialogConfig<D = any> {}
  export const MAT_DIALOG_DATA: InjectionToken<any>;
  export class MatDialogContent {}
  export class MatDialogActions {}
  export class MatDialogTitle {}
}

declare module '@angular/material/snack-bar' {
  export class MatSnackBarModule {}
  export class MatSnackBar {
    open(message: string, action?: string, config?: any): any;
  }
}

declare module '@angular/material/tooltip' {
  export class MatTooltipModule {}
}

declare module '@angular/material/card' {
  export class MatCardModule {}
  export class MatCard {}
  export class MatCardHeader {}
  export class MatCardContent {}
  export class MatCardActions {}
  export class MatCardTitle {}
}

declare module '@angular/material/checkbox' {
  export class MatCheckboxModule {}
  export class MatCheckbox {}
}

declare module '@angular/material/slide-toggle' {
  export class MatSlideToggleModule {}
  export class MatSlideToggle {}
}

declare module '@angular/material/list' {
  export class MatListModule {}
  export class MatList {}
  export class MatListItem {}
  export class MatNavList {}
}

declare module '@angular/material/sidenav' {
  export class MatSidenavModule {}
  export class MatSidenav {}
  export class MatSidenavContainer {}
  export class MatSidenavContent {}
}

declare module '@angular/material/toolbar' {
  export class MatToolbarModule {}
  export class MatToolbar {}
  export class MatToolbarRow {}
}

declare module '@angular/material/menu' {
  export class MatMenuModule {}
  export class MatMenu {}
  export class MatMenuItem {}
  export class MatMenuTrigger {}
}

declare module '@angular/material/tabs' {
  export class MatTabsModule {}
  export class MatTab {}
  export class MatTabGroup {}
  export class MatTabLabel {}
}

declare module '@angular/material/progress-bar' {
  export class MatProgressBarModule {}
  export class MatProgressBar {}
}

declare module '@angular/material/progress-spinner' {
  export class MatProgressSpinnerModule {}
  export class MatProgressSpinner {}
  export class MatSpinner {}
}

declare module '@angular/material/radio' {
  export class MatRadioModule {}
  export class MatRadioGroup {}
  export class MatRadioButton {}
}

declare module '@angular/material/chips' {
  export class MatChipsModule {}
  export class MatChip {}
  export class MatChipList {}
  export class MatChipInput {}
}

declare module '@angular/material/autocomplete' {
  export class MatAutocompleteModule {}
  export class MatAutocomplete {}
  export class MatAutocompleteTrigger {}
}

declare module '@angular/material/stepper' {
  export class MatStepperModule {}
  export class MatStepper {}
  export class MatStep {}
  export class MatStepLabel {}
  export class MatStepperNext {}
  export class MatStepperPrevious {}
}

declare module '@angular/material/expansion' {
  export class MatExpansionModule {}
  export class MatExpansionPanel {}
  export class MatExpansionPanelHeader {}
  export class MatExpansionPanelTitle {}
}

declare module '@angular/material/divider' {
  export class MatDividerModule {}
  export class MatDivider {}
}

declare module '@angular/material/badge' {
  export class MatBadgeModule {}
}

declare module '@angular/material/bottom-sheet' {
  export class MatBottomSheetModule {}
  export class MatBottomSheet {}
  export class MatBottomSheetRef<T, R = any> {}
}

declare module '@angular/material/grid-list' {
  export class MatGridListModule {}
  export class MatGridList {}
  export class MatGridTile {}
}

declare module '@angular/material/tree' {
  export class MatTreeModule {}
  export class MatTree<T> {}
  export class MatTreeNode<T> {}
}

declare module '@angular/material/slider' {
  export class MatSliderModule {}
  export class MatSlider {}
}

declare module '@angular/material/button-toggle' {
  export class MatButtonToggleModule {}
  export class MatButtonToggle {}
  export class MatButtonToggleGroup {}
}
