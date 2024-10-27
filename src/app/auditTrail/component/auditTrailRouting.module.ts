import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { SearchAuditComponent } from './searchAuditTrail.component';
import { ManageTablesComponent } from './manageTables.component';

export const aduitRoutes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: SearchAuditComponent },
    { path: 'mngTable', component: ManageTablesComponent }
]

@NgModule({
    imports: [RouterModule.forChild(aduitRoutes)],
    exports: [RouterModule]
})

export class AuditTrailRoutingModule { }