import { createSelector } from '@ngrx/store';
import * as sharedState from '../calibrationArds.state';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { PageTypeSection } from 'src/app/common/services/utilities/constants';
import { CalibrationArdsActions, CalibrationArdsActionTypes } from './calibrationArds.action';

export interface CalibrationArdsState {
    CalibrationArdsState: any;
    AppBo: AppBO;
    PageTypeSection: PageTypeSection
}

const initialState: CalibrationArdsState = {
    CalibrationArdsState: {},
    AppBo: new AppBO(),
    PageTypeSection: PageTypeSection.CLIBRATION_ARDS
};

export const getCalibrationArdsInfo = createSelector(
    sharedState.getCalibrationArdsState,
    state => state.CalibrationArdsState
);

export const getCalibrationArdsAppInfo = createSelector(
    sharedState.getCalibrationArdsState,
    state => state.AppBo
);

export function calibrationArdsReducer(state = initialState, action: CalibrationArdsActions): CalibrationArdsState {

    switch (action.type) {
        case CalibrationArdsActionTypes.CalibrationArdsHeaderInfoSuccess: {
            const new_state = { ...state };
            new_state.CalibrationArdsState = action.payload;
            new_state.AppBo = action.payload.act;
            return new_state;
        }
        case CalibrationArdsActionTypes.UpdateHeaderInfoSuccess: {
            const new_state = { ...state };
            new_state.CalibrationArdsState = action.calbData;
            return new_state;
        }
        case CalibrationArdsActionTypes.UpdateAppInfo: {
            const new_state = { ...state };
            new_state.AppBo = action.appInfo;
            return new_state;
        }

        case CalibrationArdsActionTypes.DestoryCalibInfo: {
            const new_state = { ...state };
            new_state.CalibrationArdsState = {};
            new_state.AppBo = new AppBO();
            new_state.PageTypeSection = PageTypeSection.CLIBRATION_ARDS;
            return new_state;
        }

        default:
            return state;
    }

}