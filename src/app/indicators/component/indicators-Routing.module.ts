import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { SearchIndicatorComponent } from './searchIndicator.component';
import { ManageIndicatorComponent } from './manageIndicators.component';
import { ViewIndicatorComponent } from './viewIndicator.component';
import { ManageTestSolutionIndexComponent } from './manageIndex.component';

export const indicatorsRoutes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: SearchIndicatorComponent },
    { path: 'add', component: ManageIndicatorComponent },
    { path: 'view', component: ViewIndicatorComponent },
    { path: 'manageSolIndex', component: ManageTestSolutionIndexComponent },

]

@NgModule({
    imports: [RouterModule.forChild(indicatorsRoutes)],
    exports: [RouterModule]
})

export class IndicatorsRoutingModule { }