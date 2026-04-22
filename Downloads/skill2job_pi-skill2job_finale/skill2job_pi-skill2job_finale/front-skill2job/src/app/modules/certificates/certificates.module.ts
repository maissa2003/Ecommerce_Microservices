import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CertificateListComponent } from './certificate-list/certificate-list.component';
import { CertificateViewComponent } from './certificate-view/certificate-view.component';

const routes: Routes = [
  { path: '', component: CertificateListComponent },
  { path: ':id', component: CertificateViewComponent }
];

@NgModule({
  declarations: [CertificateListComponent, CertificateViewComponent],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class CertificatesModule {}
