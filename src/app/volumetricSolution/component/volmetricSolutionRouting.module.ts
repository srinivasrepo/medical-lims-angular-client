import { NgModule } from "@angular/core";
import { SearchVolumetricSolutionComponent } from './searchVolumetricSolution.component';
import { ManageVolumetricSolutionComponent } from './manageVolumetricSol.component';
import { Routes, RouterModule } from '@angular/router';
import { ManageVolSolIndexComponent } from './manageVolSolIndex.component';
import { ViewVolumetricSolutionComponent } from './viewVolumetricSol.component';
import { ViewManageVolSolIndexComponent } from './viewManageVolSolIndex.component';

export const volmetricRoutes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: SearchVolumetricSolutionComponent },
    { path: 'add', component: ManageVolSolIndexComponent },
    { path: 'addSol', component: ManageVolumetricSolutionComponent },
    { path: 'view', component: ViewVolumetricSolutionComponent },
    { path: 'viewVolSolIdx', component: ViewManageVolSolIndexComponent}
]

@NgModule({
    imports: [
        RouterModule.forChild(volmetricRoutes)
    ],
    exports: [
        RouterModule
    ]
})

export class VolumetricSolutionRoutingModule { }