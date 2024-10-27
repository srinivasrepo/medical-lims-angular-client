import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { searchAnalystQualificationComponent } from './searchAnalystQualification.component'
import { manageAnalystQualification } from './manageAnalystQualification.component'
import { viewAnalystQualification } from './viewAnalystQualifcation.component'
import { AnalystQualifictionRequestComponent } from './analystQualifictionRequest.component'
import { viewAnalystQualificationRequestComponent } from './viewAnalystQualificationRequest.component'

export const analystQuaRoutes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: searchAnalystQualificationComponent },
    { path: 'view', component: viewAnalystQualificationRequestComponent },
    { path :'manage', component : AnalystQualifictionRequestComponent}
]

@NgModule({
    imports: [RouterModule.forChild(analystQuaRoutes)],
    exports: [RouterModule]
})

export class analystQualificationRoutingModule {
    
}   