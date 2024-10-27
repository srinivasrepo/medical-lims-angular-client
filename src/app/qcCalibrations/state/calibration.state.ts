import { createFeatureSelector } from '@ngrx/store';
import { CalibrationState } from './calibrations/calibration.reducer';

export interface State {
    analyis: CalibrationState;
}

export const getCalibrationState = createFeatureSelector<CalibrationState>('calibration');