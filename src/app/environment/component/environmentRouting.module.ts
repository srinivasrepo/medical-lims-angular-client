import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnvironmentComponent } from './environment.component';
import { ValidateNavigationService } from './validatenavigation';
import { HomeComponent } from '../../login/component/home.component';
import { ManageMasterComponent } from '../../manageMaster/component/manageMaster.component';
import { ReportsListComponent } from '../../reports/component/reportsList.component';
import { ViewSDMSDetailsComponent } from 'src/app/common/component/viewSDMSDetails.component';
import { LoginComponent } from 'src/app/login/component/login.component';
import { SysConfigurationComponent } from 'src/app/manageMaster/component/sysConfiguration.component';

const routes: Routes = [
    { path: '', redirectTo: '/lims', pathMatch: "full" },
    {
        path: 'lims', component: EnvironmentComponent,
        children: [
            { path: 'home', component: HomeComponent, canActivate: [ValidateNavigationService] },

            { path: 'rPermission', loadChildren: 'src/app/rolePermissions/component/rolePermission.module#RolePermissionModule', canActivate: [ValidateNavigationService] },

            { path: 'mngMaster', component: ManageMasterComponent, canActivate: [ValidateNavigationService] },
            { path: 'sysConfig', component: SysConfigurationComponent, canActivate: [ValidateNavigationService] },

            { path: 'audit', loadChildren: 'src/app/auditTrail/component/auditTrail.module#AuditTrailModule', canActivate: [ValidateNavigationService] },

            { path: 'mobilePhase', loadChildren: 'src/app/mobilePhase/component/mobilePhase.module#MobilePhaseModule', canActivate: [ValidateNavigationService] },

            { path: 'invalidations', loadChildren: 'src/app/invalidations/component/invalidations.module#InvalidationsModule', canActivate: [ValidateNavigationService] },

            { path: 'report', component: ReportsListComponent, canActivate: [ValidateNavigationService] },

            { path: 'indicator', loadChildren: 'src/app/indicators/component/indicators.module#IndicatorsModule', canActivate: [ValidateNavigationService] },

            { path: 'volmetricSol', loadChildren: 'src/app/volumetricSolution/component/volmetricSolution.module#VolumetricSolutionModule', canActivate: [ValidateNavigationService] },

            { path: 'analystQualify', loadChildren : 'src/app/analystQualification/component/analystQualification.module#analystQualificationModule', canActivate: [ValidateNavigationService] },

            { path: 'samplePlan', loadChildren: 'src/app/samplePlan/component/samplePlan.module#SamplePlanModule', canActivate: [ValidateNavigationService] },

            { path: 'sampleAnalysis', loadChildren: 'src/app/sampleAnalysis/component/sampleAnlaysis.module#SampleAnalysisModule', canActivate: [ValidateNavigationService] },

            { path: 'qcInventory', loadChildren: 'src/app/QCInventory/component/QCInventory.module#QCInventoryModule', canActivate: [ValidateNavigationService] },

            { path: 'sampleDestruction', loadChildren: 'src/app/sampleDestruction/component/sampeDestruction.module#SampleDestructionModule', canActivate: [ValidateNavigationService] },

            { path: 'sdmsDetails', component: ViewSDMSDetailsComponent, canActivate: [ValidateNavigationService] },

            { path: 'qcCalib', loadChildren: 'src/app/qcCalibrations/component/qcCalibration.module#QCCalibrationModule', canActivate: [ValidateNavigationService] },

            { path: 'stockSolutions', loadChildren: 'src/app/stockSolution/component/stockSolutions.module#StockSolutionsModule', canActivate: [ValidateNavigationService] },

            { path: 'calibArds', loadChildren: 'src/app/calibrationArds/component/calibrationArds.module#CalibrationArdsModule', canActivate: [ValidateNavigationService] },

            { path: 'specValid', loadChildren: 'src/app/specValidations/component/specValidations.module#SpecValidationModule', canActivate: [ValidateNavigationService] },

            { path: 'rinsingSol', loadChildren: 'src/app/rinsingSolutions/component/rinsingSolutions.module#RinsingSolutionsModule', canActivate: [ValidateNavigationService] },

            { path: 'oos', loadChildren: 'src/app/oos/component/oos.module#OOSModule', canActivate: [ValidateNavigationService] },

            { path: 'dataReview', loadChildren: 'src/app/dataReview/component/dataReview.module#DataReviewModule', canActivate: [ValidateNavigationService] },
        ]

    },
    { path: '**', component: LoginComponent, pathMatch: 'full' }
];

@NgModule({
    exports: [
        RouterModule
    ],
    imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})]

})

export class EnvironmentRoutingModule { }
