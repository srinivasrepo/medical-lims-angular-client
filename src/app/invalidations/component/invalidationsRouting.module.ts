import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { SearchInvalidationsComponent } from './searchInvalidations.component';
import { manageInvalidationsRequestComponent } from './invalidationsRequest.component';
import { viewInvalidationsComponent } from './viewInvalidations.component';

export const invRoutes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: SearchInvalidationsComponent },
    { path: 'add', component: manageInvalidationsRequestComponent },
    { path: 'view', component: viewInvalidationsComponent },

]

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(invRoutes)]
})

export class InvalidationsRoutingModule { }