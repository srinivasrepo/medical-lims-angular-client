import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../../app.material.module';
import { LimsHelpersModule } from '../../limsHelpers/component/limsHelpers.module';
import { CalibrationArdsRoutingModule } from './calibrationArdsRouting.module';
import { CalibrationArdsService } from '../services/calibrationArds.service';
import { ManageCalibrationArdsComponent } from './manageCalibrationArds.component';
import { SampleAnalysisModule } from 'src/app/sampleAnalysis/component/sampleAnlaysis.module';
import { CalibArdsService } from '../state/calibrationArds/calibrationArds.service';
import { SearchEquMaintenanceComponent } from './searchEquMaintenance.component';
import { CreateNewCalibrationComponent } from './createNewCalibration.component';


@NgModule({
    declarations: [
        ManageCalibrationArdsComponent,
        SearchEquMaintenanceComponent,
        CreateNewCalibrationComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AppMaterialModule,
        LimsHelpersModule,
        CalibrationArdsRoutingModule,
        SampleAnalysisModule
    ],
    providers: [CalibrationArdsService, CalibArdsService],
    entryComponents:[CreateNewCalibrationComponent]
})

export class CalibrationArdsModule { }