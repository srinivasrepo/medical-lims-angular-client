import { createFeatureSelector } from '@ngrx/store';
import { CalibrationArdsState } from './calibrationArds/calibrationArds.reducer';


export interface State{
    calibration: CalibrationArdsState;
}

export const getCalibrationArdsState = createFeatureSelector<CalibrationArdsState>('calibrationArds');