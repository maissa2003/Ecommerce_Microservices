import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CertificateListComponent } from './certificate-list/certificate-list.component';
import { CertificateViewComponent } from './certificate-view/certificate-view.component';

const routes: Routes = [
  { path: '', component: CertificateListComponent },
  { path: ':id', component: CertificateViewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CertificatesRoutingModule {}
