import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageRinsingSolutionsComponent } from './manageRinsingSolutions.component';
import { SearchRinsingSolutionsComponent } from './searchRinsingSolutions.component';

export const rinsingSolutionsRoutes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'manage', component: ManageRinsingSolutionsComponent },
    { path: 'search', component: SearchRinsingSolutionsComponent },
]

@NgModule({
    imports: [RouterModule.forChild(rinsingSolutionsRoutes)],
    exports: [RouterModule]
})

export class RinsingSolutionsRoutingModule { }
