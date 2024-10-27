import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app.material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LimsHelpersModule } from 'src/app/limsHelpers/component/limsHelpers.module';
import { SpecValidationsService } from '../service/specValidations.service';
import { ManageSpecValidationsCompnent } from './manageSpecValidations.component';
import { SearchSpecValidationsCompnent } from './searchSpecValidations.component';
import { SpecValidationsRoutingModule } from './speValidationsRouting.module';
import { SampleAnalysisModule } from 'src/app/sampleAnalysis/component/sampleAnlaysis.module';
import { ManageGroupTestComponent } from './manageGroupTest.component';
import { QCCalibrationModule } from 'src/app/qcCalibrations/component/qcCalibration.module';
import { AssignSTPComponent } from './assignSTP.component';
import { TestSTPHistoryComponent } from './testSTPHistory.component';

@NgModule({
    declarations: [
        SearchSpecValidationsCompnent,
        ManageSpecValidationsCompnent,
        ManageGroupTestComponent,
        AssignSTPComponent,
        TestSTPHistoryComponent
    ],
    imports: [
        CommonModule, 
        AppMaterialModule, 
        FormsModule, 
        LimsHelpersModule, 
        ReactiveFormsModule,
        SpecValidationsRoutingModule,
        SampleAnalysisModule,
        QCCalibrationModule
    ],
    entryComponents:[TestSTPHistoryComponent],
    providers: [SpecValidationsService]
})

export class SpecValidationModule { }