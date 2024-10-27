import { NgModule } from "@angular/core";
import { SearchVolumetricSolutionComponent } from './searchVolumetricSolution.component';
import { ManageVolumetricSolutionComponent } from './manageVolumetricSol.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VolumetricSolutionRoutingModule } from './volmetricSolutionRouting.module';
import { VolumetricSolService } from '../service/volumetricSol.service';
import { LimsHelpersModule } from '../../limsHelpers/component/limsHelpers.module';
import { AppMaterialModule } from '../../app.material.module';
import { ManageVolSolIndexComponent } from './manageVolSolIndex.component';
import { ManageStandardComponent } from './manageStandardization.component';
import { ViewVolumetricSolutionComponent } from './viewVolumetricSol.component';
import { ManageStandardProcedure } from './standardizationProcedure.component';
import { ManageAssignFormulaeComponent } from './manageAssignFormulae.component';
import { ViewManageVolSolIndexComponent } from './viewManageVolSolIndex.component';

@NgModule({
    declarations: [
        SearchVolumetricSolutionComponent,
        ManageVolumetricSolutionComponent,
        ManageVolSolIndexComponent,
        ManageStandardComponent,
        ViewVolumetricSolutionComponent,
        ManageStandardProcedure,
        ManageAssignFormulaeComponent,
        ViewManageVolSolIndexComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        VolumetricSolutionRoutingModule,
        LimsHelpersModule,
        AppMaterialModule,
    ],
    providers: [VolumetricSolService],
    entryComponents: [ManageStandardProcedure,ManageAssignFormulaeComponent]
})

export class VolumetricSolutionModule { }