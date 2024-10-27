import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchSampleAnalysisComponent } from './searchSampleAnalysis.component';
import { ManageSampleAnalysisComponent } from './manageSampleAnalysis.component';
import { ViewSampleAnalysisComponent } from './viewSampleAnalysis.component';
import { ManageContainerWiseMaterialsComponent } from './manageContainerWiseMaterials.component';

export const sampleAnalysisRoutes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: SearchSampleAnalysisComponent },
    { path: 'manage', component: ManageSampleAnalysisComponent },
    { path: 'view', component: ViewSampleAnalysisComponent },
    {path : 'containerWiseMaterials',component:ManageContainerWiseMaterialsComponent}
]

@NgModule({
    imports: [RouterModule.forChild(sampleAnalysisRoutes)],
    exports: [RouterModule]
})

export class SampleAnalysisRoutingModule { }