import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { createSelector } from '@ngrx/store';
import * as sharedState from '../calibration.state';
import { CalibrationsActions, CalibrationsActionTypes } from './calibrations.action';

export interface CalibrationState {
    CalibrationState: any;
    AppBo: AppBO;
}

const initialState: CalibrationState = {
    CalibrationState: {},
    AppBo: new AppBO()
}

export const getCalibrationAppInfo = createSelector(
    sharedState.getCalibrationState,
    state => state.AppBo
);

export function calibrationReducer(state = initialState, action: CalibrationsActions): CalibrationState {

    switch (action.type) {
        
        case CalibrationsActionTypes.UpdateAppInfo: {
            const new_state = { ...state };
            new_state.AppBo = action.appInfo;
            return new_state;
        }

        default:
            return state;

    }
}