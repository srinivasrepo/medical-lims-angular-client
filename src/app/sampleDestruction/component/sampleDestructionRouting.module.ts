import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchSampleDestructionComponent } from './searchSampleDestruction.component';
import { ManageSampleDestructionComponent } from './manageSampleDestruction.component';
import { SampleDestructionComponent } from './sampleDestruction.component';
import { ViewSampleDestructionComponent } from './viewSampleDestruction.component';

export const sampleDestructionRoutes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: SearchSampleDestructionComponent },
    { path: 'manage', component: ManageSampleDestructionComponent },
    { path: 'sampleDestruction', component: SampleDestructionComponent },
    { path: 'view', component: ViewSampleDestructionComponent }
]

@NgModule({
    imports: [RouterModule.forChild(sampleDestructionRoutes)],
    exports: [RouterModule]
})

export class SampleDestructionRoutingModule { }