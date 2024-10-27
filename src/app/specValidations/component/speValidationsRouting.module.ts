import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ManageSpecValidationsCompnent } from './manageSpecValidations.component'
import { SearchSpecValidationsCompnent } from './searchSpecValidations.component'
import { ManageGroupTestComponent } from './manageGroupTest.component'
import { AssignSTPComponent } from './assignSTP.component'

export const specValidationRoutes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: SearchSpecValidationsCompnent },
    { path: 'manage', component: ManageSpecValidationsCompnent },
    { path: 'manageGroupTest', component: ManageGroupTestComponent },
    { path: 'assignSTP', component:AssignSTPComponent}
]

@NgModule({
    imports: [RouterModule.forChild(specValidationRoutes)],
    exports: [RouterModule]
})

export class SpecValidationsRoutingModule { }