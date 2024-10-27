import { Action } from '@ngrx/store';
import { PageTypeSection } from 'src/app/common/services/utilities/constants';

export enum AnalysisActionTypes {
  GetAnalysisHeaderInfo = '[Analysis] Get Analysis Header Info',
  AnalysisHeaderInfoSuccess = '[Analysis] Get  Analysis Header Info Success',
  UpdateHeaderInfoSuccess = '[Analysis] Update Analysis Header Info Success',
  UpdateAppInfo = '[Analysis] Update Analysis Approval Info Success',
  GetArdsinputsInfo = '[ArdsInputs] Get Ards inputs Info',
  GetArdsInputsInfoSuccess = '[ArdsInputs] Get Ards inputs Info Success',
  DestroyAnalysisInfo = "[Analysis] Destroy Analyis Info",
  UpdateArdsSecInputInfo = '[ArdsInputs] Update Ards Section Input Info Success',
  UpdateArdsInputInfo = '[ArdsInputs] Update Ards Input Info Success',
  GetAnalysisTestInfo = '[Analysis Test] Get Analysis Test Details',
  UpdateAnalysisTestInfo = '[Analysis Test] Update Analysis Test Details',
  UpdateAnalysisPageTypeAction = "[Analysis] Update Page Type Actions",
  GetAnalysisPageTypeAction = "[Analysis] Get Page Type Actions",
  UpdateArdsInputsSectionDetailsListInfo = "[Analysis] Update ards section details",
  UpdateTabSelectionIndex = "[Analysis] Update Tab Selection Index",
  GetArdsTabIndexInfo = "[Analysis] Get Ards Tab index",
  ArdsInvalidationInfo = "[Analysis] Get Ards Invalidation",
  UpdateMappingCurrentAnalysisInfo = "[Analysis] Update Mapping Current Analysis Info",
  GetMappingCurrentAnalysisInfo = "[Analysis] Get Mapping Current Analysis Info",
}

export class GetAnalysisInfo implements Action {
  readonly type = AnalysisActionTypes.GetAnalysisHeaderInfo;
  constructor(public encSioID: string) { }
}

export class GetAnalysisInfoSuccess implements Action {
  readonly type = AnalysisActionTypes.AnalysisHeaderInfoSuccess;
  constructor(public payload: any) { }
}

export class UpdateAnalysisInfo implements Action {
  readonly type = AnalysisActionTypes.UpdateHeaderInfoSuccess;
  constructor(public anaData: any) { }
}

export class UpdateAnalysisAppInfo implements Action {
  readonly type = AnalysisActionTypes.UpdateAppInfo;
  constructor(public appInfo: any) { }
}

export class GetArdsInputsInfo implements Action {
  readonly type = AnalysisActionTypes.GetArdsinputsInfo;
  constructor(public encSamAnaTestID: string, public sourceCode: string) { }
}

export class GetArdsInputsInfoSuccess implements Action {
  readonly type = AnalysisActionTypes.GetArdsInputsInfoSuccess;
  constructor(public payload: any) { }
}

export class UpdateArdsSecInputInfo implements Action {
  readonly type = AnalysisActionTypes.UpdateArdsSecInputInfo;
  constructor(public sectionListInfo: any) { }
}

export class UpdateArdsInputInfo implements Action {
  readonly type = AnalysisActionTypes.UpdateArdsInputInfo;
  constructor(public ardsInput: any) { }
}

export class DestoryAnalysisInfo implements Action {
  readonly type = AnalysisActionTypes.DestroyAnalysisInfo;
  constructor() { }
}

export class GetAnalysisTestInfo implements Action {
  readonly type = AnalysisActionTypes.GetAnalysisTestInfo;
  constructor(public payload: any) { }
}

export class UpdateAnalysisTestInfo implements Action {
  readonly type = AnalysisActionTypes.UpdateAnalysisTestInfo;
  constructor(public analysisTestInfo: any) { }
}

export class UpdateAnalysisPageTypeAction implements Action {
  readonly type = AnalysisActionTypes.UpdateAnalysisPageTypeAction;
  constructor(public pageType: any) { }
}

export class GetAnalysisPageTypeAction implements Action {
  readonly type = AnalysisActionTypes.GetAnalysisPageTypeAction;
  constructor(public pageType: PageTypeSection) { }
}


export class UpdateArdsInputsSectionDetailsListInfo implements Action {
  readonly type = AnalysisActionTypes.UpdateArdsInputsSectionDetailsListInfo;
  constructor(public data: any) { }
}

export class UpdateSelectionIndex implements Action {
  readonly type = AnalysisActionTypes.UpdateTabSelectionIndex;
  constructor(public data: any) { }
}

export class GetArdsTabIndexInfo implements Action {
  readonly type = AnalysisActionTypes.GetArdsTabIndexInfo;
  constructor(public data: any) { }
}

export class GetArdsInvalidationInfo implements Action {
  readonly type = AnalysisActionTypes.ArdsInvalidationInfo;
  constructor(public data: any) { }
}

export class UpdateMappingCurrentAnalysisInfo implements Action {
  readonly type = AnalysisActionTypes.UpdateMappingCurrentAnalysisInfo;
  constructor(public data: any) { }
}

export class GetMappingCurrentAnalysisInfo implements Action {
  readonly type = AnalysisActionTypes.GetMappingCurrentAnalysisInfo;
  constructor(public data: any) { }
}

export type AnalysisActions =
  | GetAnalysisInfo
  | GetAnalysisInfoSuccess
  | UpdateAnalysisInfo
  | UpdateAnalysisAppInfo
  | GetArdsInputsInfo
  | GetArdsInputsInfoSuccess
  | DestoryAnalysisInfo
  | UpdateArdsSecInputInfo
  | UpdateArdsInputInfo
  | GetAnalysisTestInfo
  | UpdateAnalysisTestInfo
  | UpdateAnalysisPageTypeAction
  | GetAnalysisPageTypeAction
  | UpdateArdsInputsSectionDetailsListInfo
  | UpdateSelectionIndex
  | GetArdsTabIndexInfo
  | GetArdsInvalidationInfo
  | UpdateMappingCurrentAnalysisInfo
  | GetMappingCurrentAnalysisInfo