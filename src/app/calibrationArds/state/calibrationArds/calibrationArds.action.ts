import { Action } from '@ngrx/store';
import { PageTypeSection } from 'src/app/common/services/utilities/constants';

export enum CalibrationArdsActionTypes {
    GetCalibrationArdsHeaderInfo = '[Calibration] Get Calibration Ards Header Info',
    CalibrationArdsHeaderInfoSuccess = '[Calibration] Get  Calibration Ards Header Info Success',
    UpdateHeaderInfoSuccess = "[Calibration] Update Header Info Success",
    UpdateAppInfo = "[Calibration] Update App Info",
    DestoryCalibInfo = "[Calibration] Destroy Calibration Info",
}

export class GetCalibrationArdsHeaderInfo implements Action {
    readonly type = CalibrationArdsActionTypes.GetCalibrationArdsHeaderInfo;
    constructor(public encID: string) { }
}

export class GetCalibrationArdsInfoSuccess implements Action {
    readonly type = CalibrationArdsActionTypes.CalibrationArdsHeaderInfoSuccess;
    constructor(public payload: any) { }
}

export class UpdateCalibrationArdsInfo implements Action {
    readonly type = CalibrationArdsActionTypes.UpdateHeaderInfoSuccess;
    constructor(public calbData: any) { }
}

export class UpdateCalibrationArdsAppInfo implements Action {
    readonly type = CalibrationArdsActionTypes.UpdateAppInfo;
    constructor(public appInfo: any) { }
}

export class DestoryCalibInfo implements Action {
    readonly type = CalibrationArdsActionTypes.DestoryCalibInfo;
    constructor() { }
}

export type CalibrationArdsActions =
    | GetCalibrationArdsHeaderInfo
    | GetCalibrationArdsInfoSuccess
    | UpdateCalibrationArdsInfo
    | UpdateCalibrationArdsAppInfo
    | DestoryCalibInfo