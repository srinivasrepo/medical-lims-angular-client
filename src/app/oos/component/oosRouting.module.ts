import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchOosComponent } from './searchOos.component';
import { manageOosComponent } from './manageOos.component';
;

export const oosRoutes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: SearchOosComponent },
    { path: 'manage', component: manageOosComponent }
]
@NgModule({
    imports: [RouterModule.forChild(oosRoutes)],
    exports: [RouterModule]
})

export class OosRoutingModule { }