import { NgModule } from "@angular/core";
import { QCCalibrationRoutingModule } from './qcCalibration-routing.module';
import { ManageQCCalibrationsComponent } from './manageQCCalibrations.component';
import { QCCalibrationHeadersComponent } from './qcCalibrationHeader.component';
import { QCCalibrationsService } from '../services/qcCalibrations.service';
import { LimsHelpersModule } from 'src/app/limsHelpers/component/limsHelpers.module';
import { AppMaterialModule } from 'src/app/app.material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { CalibrationsEffects } from '../state/calibrations/calibrations.effects';
import { calibrationReducer } from '../state/calibrations/calibration.reducer';
import { LimsCommonModule } from 'src/app/common/component/common.module';
import { QCCalibTestResultComponent } from './testResult.component';
import { CalibrationGridComponent } from './calibrationsGrid.component';
import { ViewQCCalibrationsComponent } from './viewQCCalibrations.component';
import { SearchQCCalibrationsComponent } from './searchQCCalibrations.component';
import { AssignInstrumentComponent } from './assignInstruments.component';
import { ChangePlantComponent } from './changePlant.component';
import { ManageArdsDocumentsComponent } from './manageArdsDocuments.component';

@NgModule({
  declarations: [
    ManageQCCalibrationsComponent,
    QCCalibrationHeadersComponent,
    QCCalibTestResultComponent,
    CalibrationGridComponent,
    ViewQCCalibrationsComponent,
    SearchQCCalibrationsComponent,
    AssignInstrumentComponent,
    ChangePlantComponent,
    ManageArdsDocumentsComponent,
  ],
  imports: [
    QCCalibrationRoutingModule,
    AppMaterialModule,
    CommonModule,
    FormsModule,
    LimsHelpersModule,
  ],
  exports:[CalibrationGridComponent],
  entryComponents: [QCCalibTestResultComponent,ChangePlantComponent, AssignInstrumentComponent,ManageArdsDocumentsComponent],
  providers: [QCCalibrationsService]
})
export class QCCalibrationModule { }