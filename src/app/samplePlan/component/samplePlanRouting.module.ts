import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchSamplePlanComponent } from './searchSamplePlan.component';
import { ShiftClosedComponent } from './shiftClosed.component';
import { CreateSamplePlanComponent } from './createSamplePlan.component';
import { ViewSamplePlanComponent } from './viewSamplePlan.component';
import { SearchCloseShiftActivitiesComponent } from './searchShiftClosed.component';
import { ViewShiftClosedComponent } from './viewShiftClosed.component';

export const samplePlanRoutes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: SearchSamplePlanComponent },
    { path: 'shiftClose', component: ShiftClosedComponent },
    { path: 'manage', component: CreateSamplePlanComponent },
    { path: 'view', component: ViewSamplePlanComponent },
    { path: 'searchCloseShift', component: SearchCloseShiftActivitiesComponent },
    { path: "viewCloseShift", component: ViewShiftClosedComponent },

]

@NgModule({
    imports: [RouterModule.forChild(samplePlanRoutes)],
    exports: [RouterModule]
})

export class SamplePlanRoutingModule { }