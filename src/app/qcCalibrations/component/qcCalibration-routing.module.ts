import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { ManageQCCalibrationsComponent } from './manageQCCalibrations.component';
import { ViewQCCalibrationsComponent } from './viewQCCalibrations.component';
import { SearchQCCalibrationsComponent } from './searchQCCalibrations.component';

export const qcCalib: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: SearchQCCalibrationsComponent },
    { path: 'manage', component: ManageQCCalibrationsComponent },
    { path: 'view', component: ViewQCCalibrationsComponent }
]

@NgModule({
    declarations: [],
    imports: [RouterModule.forChild(qcCalib)],
    exports: [RouterModule]
})
export class QCCalibrationRoutingModule { }