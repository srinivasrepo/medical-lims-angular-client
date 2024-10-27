import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { ManageDataReviewComponent } from './manageDataReview.component';
import { SearchDataReviewComponent } from './searchDataReview.component';

export const dataReviewRoutes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: SearchDataReviewComponent },
    { path: 'manage', component: ManageDataReviewComponent },
]

@NgModule({
    imports: [RouterModule.forChild(dataReviewRoutes)],
    exports: [RouterModule]
})

export class DataReviewRoutingModule { }