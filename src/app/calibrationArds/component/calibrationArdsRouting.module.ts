import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { ManageCalibrationArdsComponent } from './manageCalibrationArds.component';
import { SearchEquMaintenanceComponent } from './searchEquMaintenance.component';


export const calibRoutes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: SearchEquMaintenanceComponent },
    { path: 'manage', component: ManageCalibrationArdsComponent },
]

@NgModule({
    imports: [RouterModule.forChild(calibRoutes)],
    exports: [RouterModule]
})

export class CalibrationArdsRoutingModule { }