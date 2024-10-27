import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MobilePhaseRequestComponent } from './mobilePhaseRequest.component';
import { searchMobilePhaseComponent } from './searchMobilePhase.component';
import { viewMobilePhaseComponent } from './viewMobilePhase.component';

export const mobilePhaseRoutes: Routes = [
    { path: '', redirectTo: 'searchMobilePhase', pathMatch: 'full' },
    { path: 'searchMobilePhase', component: searchMobilePhaseComponent },
    { path: 'add', component: MobilePhaseRequestComponent },
    { path: 'view', component: viewMobilePhaseComponent },
]
@NgModule({
    imports: [RouterModule.forChild(mobilePhaseRoutes)],
    exports: [RouterModule]
})

export class MobilePhaseRoutingModule { }