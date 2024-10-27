import { createSelector } from '@ngrx/store';
import * as sharedState from '../analysis.state';
import { AnalysisActions, AnalysisActionTypes } from './analysis.action';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { PageTypeSection } from 'src/app/common/services/utilities/constants';

export interface AnalysisState {
    AnalysisState: any;
    AppBo: AppBO;
    ArdsHeaderData: any;
    ArdsInputsSectionList: any;
    ArdsInputsSectionDetailsList: any;
    ArdsInvalidationList: any;
    ArdsTabList: Array<any>;
    AnalysisTestDetailsInfo: any;
    PageTypeSection: PageTypeSection;
    TabSelectionInfo: any;
    MappingCurrentAnalysisInfo: any;
    ArdsReviewList: any;
    ArdsDynamicValueList: any;
}

const initialState: AnalysisState = {
    AnalysisState: {},
    AppBo: new AppBO(),
    ArdsHeaderData: {},
    ArdsTabList: [],
    ArdsInputsSectionList: {},
    ArdsInputsSectionDetailsList: {},
    ArdsInvalidationList: [],
    AnalysisTestDetailsInfo: {},
    PageTypeSection: PageTypeSection.ANALYSIS,
    TabSelectionInfo: { tabID: 0, selectedIndex: 0 },
    MappingCurrentAnalysisInfo: {},
    ArdsReviewList: [],
    ArdsDynamicValueList : []
};

export const getAnalysisInfo = createSelector(
    sharedState.getAnalysisState,
    state => state.AnalysisState
);

export const getAnalysisAppInfo = createSelector(
    sharedState.getAnalysisState,
    state => state.AppBo
);

export const getArdsHeaderDataInfo = createSelector(
    sharedState.getAnalysisState,
    state => state.ArdsHeaderData
);

export const getArdsInputsSectionListInfo = createSelector(
    sharedState.getAnalysisState,
    state => state.ArdsInputsSectionList
);

export const getArdsInputsSectionDetailsListInfo = createSelector(
    sharedState.getAnalysisState,
    state => state.ArdsInputsSectionDetailsList
);

export const getArdsTabList = createSelector(
    sharedState.getAnalysisState,
    state => state.ArdsTabList
);

export const GetAnalysisTestInfo = createSelector(
    sharedState.getAnalysisState,
    state => state.AnalysisTestDetailsInfo
);

export const GetAnalysisPageTypeAction = createSelector(
    sharedState.getAnalysisState,
    state => state.PageTypeSection
);

export const GetArdsTabInfo = createSelector(
    sharedState.getAnalysisState,
    state => state.TabSelectionInfo
);

export const getArdsInvalidationInfo = createSelector(
    sharedState.getAnalysisState,
    state => state.ArdsInvalidationList
);

export const getMappingCurrentAnalysis = createSelector(
    sharedState.getAnalysisState,
    state => state.MappingCurrentAnalysisInfo
);


export function analysisReducer(state = initialState, action: AnalysisActions): AnalysisState {

    switch (action.type) {
        case AnalysisActionTypes.AnalysisHeaderInfoSuccess: {
            const new_state = { ...state };
            new_state.AnalysisState = action.payload;
            new_state.AppBo = action.payload.act;
            new_state.AppBo.showConfirmBtn = false;
            return new_state;

        }
        case AnalysisActionTypes.UpdateHeaderInfoSuccess: {
            const new_state = { ...state };
            new_state.AnalysisState = action.anaData;
            return new_state;
        }

        case AnalysisActionTypes.GetArdsInputsInfoSuccess: {
            const new_state = { ...state };
            new_state.ArdsHeaderData = action.payload;
            new_state.ArdsTabList = action.payload.tabList;
            new_state.ArdsInputsSectionList = action.payload.sectionList;
            new_state.ArdsInputsSectionDetailsList = action.payload.sectionDetailsList;
            new_state.ArdsInvalidationList = action.payload.invList;
            new_state.ArdsReviewList = action.payload.reviewList;
            new_state.ArdsDynamicValueList = action.payload.dynamicValueLst;
            return new_state;
        }

        case AnalysisActionTypes.DestroyAnalysisInfo: {
            const new_state = { ...state };
            new_state.AnalysisState = {};
            new_state.AppBo = new AppBO();
            new_state.ArdsHeaderData = {};
            new_state.ArdsTabList = [];
            new_state.ArdsInputsSectionList = {};
            new_state.ArdsInputsSectionDetailsList = {};
            new_state.ArdsInvalidationList = [];
            new_state.ArdsReviewList = [];
            new_state.ArdsDynamicValueList = [];
            return new_state;
        }

        case AnalysisActionTypes.UpdateArdsSecInputInfo: {
            const new_state = { ...state };
            new_state.ArdsInputsSectionDetailsList = action.sectionListInfo;
            return new_state;
        }

        case AnalysisActionTypes.UpdateArdsInputInfo: {
            const new_state = { ...state }
            new_state.ArdsHeaderData = action.ardsInput;
            return new_state;
        }

        case AnalysisActionTypes.GetAnalysisTestInfo: {
            const new_state = { ...state }
            new_state.AnalysisTestDetailsInfo = action.payload;
            return new_state;
        }

        case AnalysisActionTypes.UpdateAnalysisTestInfo: {
            const new_state = { ...state }
            new_state.AnalysisTestDetailsInfo = action.analysisTestInfo;
            return new_state;
        }

        case AnalysisActionTypes.UpdateAnalysisPageTypeAction: {
            const new_state = { ...state }
            new_state.PageTypeSection = action.pageType;
            return new_state;
        }

        case AnalysisActionTypes.GetAnalysisPageTypeAction: {
            const new_state = { ...state }
            new_state.PageTypeSection = action.pageType;
            return new_state;
        }

        case AnalysisActionTypes.UpdateArdsInputsSectionDetailsListInfo: {
            const new_state = { ...state };
            new_state.ArdsInputsSectionDetailsList = action.data;
            return new_state;
        }

        case AnalysisActionTypes.UpdateTabSelectionIndex: {
            const new_state = { ...state };
            new_state.TabSelectionInfo = action.data;
            return new_state;
        }

        case AnalysisActionTypes.GetArdsTabIndexInfo: {
            const new_state = { ...state }
            new_state.TabSelectionInfo = action.data;
            return new_state;
        }

        case AnalysisActionTypes.ArdsInvalidationInfo: {
            const new_state = { ...state }
            new_state.ArdsInvalidationList = action.data;
            return new_state;
        }

        case AnalysisActionTypes.GetMappingCurrentAnalysisInfo: {
            const new_state = { ...state }
            new_state.MappingCurrentAnalysisInfo = action.data;
            return new_state;
        }

        case AnalysisActionTypes.UpdateMappingCurrentAnalysisInfo: {
            const new_state = { ...state }
            new_state.MappingCurrentAnalysisInfo = action.data;
            return new_state;
        }

        default:
            return state;
    }
}
