import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { SearchQCInventoryComponent } from './searchQCInventory.component';
import { manageChemicalPacksComponent } from './manageChemicalPacks.component';
import { ManageQcInventoryComponent } from './manageQCInventory.component';
import { ViewQCInventoryComponent } from './ViewQCInventory.component';
// import { SampleDestructionComponent } from './sampleDestruction.component';


export const qcInvtRoutes: Routes = [
    { path: '', redirectTo: 'qcInvtSearch', pathMatch: 'full' },
    { path: 'qcInvtSearch', component: SearchQCInventoryComponent },
    { path: 'manageQcInvt', component: ManageQcInventoryComponent },
    { path: 'viewInvtDetails', component: ViewQCInventoryComponent },
    { path: 'managepack', component: manageChemicalPacksComponent },
    // {path: 'sampleDestruction', component:SampleDestructionComponent},
    // {path:'search'}
]

@NgModule({
    imports: [RouterModule.forChild(qcInvtRoutes)],
    exports: [RouterModule]
})

export class QCInventoryRoutingModule { }
