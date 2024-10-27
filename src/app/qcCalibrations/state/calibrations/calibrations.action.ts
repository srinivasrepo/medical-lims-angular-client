import { Action } from '@ngrx/store';

export enum CalibrationsActionTypes {
    GetCalibrationsHeaderInfo = '[Calibrations] Get Calibrations Header Info',
    UpdateAppInfo = '[Calibrations] Update Calibrations Approval Info Success',
}

export class UpdateCalibrationAppInfo implements Action {
    readonly type = CalibrationsActionTypes.UpdateAppInfo;
    constructor(public appInfo: any) { }
}

export type CalibrationsActions =
    | UpdateCalibrationAppInfo