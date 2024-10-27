import { Injectable } from "@angular/core";
import { QCCalibrationsService } from '../../services/qcCalibrations.service';
import { Actions } from '@ngrx/effects';

@Injectable()

export class CalibrationsEffects {

    constructor(private analysisService: QCCalibrationsService, private actions$: Actions) { }

}