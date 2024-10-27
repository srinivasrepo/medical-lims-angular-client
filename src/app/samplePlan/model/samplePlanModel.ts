export class SearchSamplePlanBO {
    samplePlanID: number;
    samplePlanName: string;
    statusID: number;
    dateFrom: any;
    dateTo: any;
    pageSize: number;
    pageIndex: number;
    arID: number;
    arName: string
    sampleID: number;
    sampleName: string;
    testID: number;
    testName: string;
    matID: number;
    matName: string
    analystID: number;
    analystName: string;
    samplePlanIDTo: number;
    samplePlanNameTo: string;
    samplePlanIDFrom: number;
    samplePlanNameFrom: string;
    advanceSearch: string;
    specificationID: number;
    specificationName: string;
    planCreatedUserRoleID: number;
    planCreatedUserRoleName: string;
    selectedSampleText: string;
    planCreatedOn : Date;
    shiftID : number;
}


export class ShiftEndTasks {
    encUserTestID: string;
    activity: string;
    arNumber: string;
    activityDesc: string;
    status: string;
    statusCode: string;
    testTitle: string;
    statusID: number;
    remarks: string;
    entityRefNumber: string;
    planID: number;
    activityStatus: string;
    activityStatusCode: string;
}
import { SingleIDBO, IDCodeList } from 'src/app/common/services/utilities/commonModels';

export class GetAnalytics {
    userName: string;
    roleName: string;
    employeeCode: string;
    userRoleID: number;
    isSelected: boolean;
    underAnalysis: number;
    toBeStart: number;
    qualifications: string;
    encUserRoleID: string;
    isAvailable: boolean;
}
export class GetAnalyticsList extends Array<GetAnalytics>{ }


export class ManageAnalystModel {
    encPlanID: string;
    list: Array<SingleIDBO> = [];
    initTime: string;
}

export class GetSamplesModel {
    sioID: number;
    sioCode: string;
    arNumber: string;
    productName: string;
    sampleNumber: string;
    batchNumber: string;
    analysisType: string;
    isSelected: boolean;
    isIncludeOtherPlan: boolean;
}
export class GetSamplesModelList extends Array<GetSamplesModel>{ }

export class SaveSampleModel {
    encPlanID: string;
    initTime: string;
    list: Array<SingleIDBO> = [];
}

export class GetSamplesWithMultSpecModel {
    sam: GetSampleDetailsModelList;
    samSpe: GetSampleSpecModelList;
}

export class GetSampleSpecModel {
    sampleID: number;
    specificationID: number;
    specNumber: string;
    isSelected: boolean;
    canDisable: boolean;
}
export class GetSampleSpecModelList extends Array<GetSampleSpecModel>{ }

export class GetSampleDetailsModel {
    sampleID: number;
    sioID: number;
    sioCode: string;
    arNumber: string;
    analysisType: string;
    productName: string;
    sampleNumber: string;
    batchNumber: string;
    inwardDate: any;
    count: number;
    hasSpec: boolean;
    sampleMode: string;
}
export class GetSampleDetailsModelList extends Array<GetSampleDetailsModel>{ }

export class SaveSampleSpecModel {
    encPlanID: string;
    initTime: string;
    list: SpecDetailsList;
}

export class SpecDetails {
    specificationID: number;
    sampleID: number;
}

export class SpecDetailsList extends Array<SpecDetails>{ }

export class AnalystsOccupancyModel {
    activity: string;
    testTitle: string;
    sioCode: string;
    arNum: string;
    invalidationCode: string;
    testStatus: string;
    activityDesc: string;
    specNumber: string;
    planCode: string;
    assignBy: string;
    assignOn: any;
    instNumber: string;
    mntReportCode: string;
    instType: string;
    schDate: any;
    materialName: string;
    matCode: string;
    inalidationDate: any;
    material: string;
    reviewDate: any;
}
export class AnalystsOccupancyModelList extends Array<AnalystsOccupancyModel>{ }

export class PageReqModel {
    status: string;
    requestCode: string;
}

// sample test

export class SamplingModel {
    sioID: number;
    arNumbr: string;
    sampleNumber: string;
    isSelected: boolean;
    minutes: number;
    isIncludeOtherPlan: boolean;
}
export class SamplingModelList extends Array<SamplingModel>{ }

export class WetinstrumentModel {
    specCatID: number;
    sioID: number;
    arNumber: string;
    testTitle: string;
    testType: string;
    isSelected: boolean;
    minutes: number;
    masterTestID: number;
    isIncludeOtherPlan: boolean;
    sampleNumber: string;
}
export class WetinstrumentModelList extends Array<WetinstrumentModel> { }

export class InvalidationModel {
    invalidationID: number;
    invalidationCode: string;
    status: string;
    isSelected: boolean;
    minutes: number;
    isIncludeOtherPlan: boolean;
}
export class InvalidationModelList extends Array<InvalidationModel> { }

export class MasterTestModel {
    masterTestID: number;
    testName: string;
}
export class MasterTestList extends Array<MasterTestModel>{ }

export class OOSTestBO {
    oosTestID: number;
    oosNumber: string;
    status: string;
    arNumber: string;
    invBatchNumber: string;
    oosDate: any;
    prodNameCode: string;
    testTitle: string;
    isSelected: boolean;
    minutes: number;
    isIncludeOtherPlan: boolean;
}
export class OOSTestList extends Array<OOSTestBO>{ }

export class DataReview {
    reviewID: number;
    requestCode: string;
    status: string;
    reviewDate: any;
    isSelected: boolean;
    minutes: number;
    productName: string;
    testTitle: string;
    isIncludeOtherPlan: boolean;
}

export class DataReviewList extends Array<DataReview>{ }

export class CalibrationBO {
    specCatID: number;
    rptNumber: string;
    eqpCode: string;
    nextDueDate: any;
    category: string;
    testTitle: string;
    minutes: number;
    maintRptID: number;
    isSelected: boolean;
    isIncludeOtherPlan: boolean;
    conditionCode: string;
}

export class CalibrationList extends Array<CalibrationBO>{ }

export class SampleTestModel {
    sam: SamplingModelList = new SamplingModelList();
    wetIns: WetinstrumentModelList = new WetinstrumentModelList();
    inv: InvalidationModelList = new InvalidationModelList();
    masterList: MasterTestList = new MasterTestList();
    oosTestList: OOSTestList = new OOSTestList();
    drList: DataReviewList = new DataReviewList();
    calibList: CalibrationList = new CalibrationList();
}

// export class ManageWetInstrumentModel {
//     sioID: number;
//     specTestID: number;
// }
// export class ManageWetInstrumentModelList extends Array<ManageWetInstrumentModel>{ }

export class ManageSamplingTestModel {
    encPlanID: string;
    initTime: string;
    samplTestList: IDCodeList = new IDCodeList();
    // sam: Array<SingleIDBO> = [];
    // wetInstr: ManageWetInstrumentModelList = new ManageWetInstrumentModelList();
    // inv: Array<SingleIDBO> = [];
}

export class GetPreparePlaneModel {
    isSelected: boolean;
    userTestID: number;
    encUserTestID: string;
    arNumber: string;
    activity: string;
    sampleNumber: string;
    userRoleID: number;
    testID: number;
    activityStatusID: number;
    activityCode: string;
    activityStatus: string;
    activityStatusCode: string;
}
export class GetPreparePlaneModelList extends Array<GetPreparePlaneModel>{ }

export class GetUserDetailsModel {
    userRoleID: number;
    encUserRoleID: string;
    userName: string;
    planned: number;
    onging: number;
    currentPlan: number;
    total: number;
    openPlanOCC: number;
    currentPlanOCC: number;
    occHours: string;
    userID: number;
    overTime: boolean = false;
}
export class GetUserDetailsModelList extends Array<GetUserDetailsModel>{ }

export class GetSamplePlanningModel {
    userPlanDet: GetUserDetailsModelList = new GetUserDetailsModelList();
    plandet: GetPreparePlaneModelList = new GetPreparePlaneModelList();
    planningTypes: Array<string> = [];
}

export class ChangeAnalystsModel {
    encPlanID: string;
    testID: number;
    userRoleID: number;
    initTime: string;
}

export class UnAssignTestSampleModel {
    initTime: string;
    encPlanID: string;
    encUserTestID: number;
    testID: number;
    sampleLst: any;
}

export class GetAssignedTestSampleUserModel {
    encPlanID: string;
    userRoleID: number;
    encUserRoleID: string;
    encUserTestID: string;
    initTime: string;
    planID: number;
    userID: number;
}

export class ManageAssignTestModel {
    encPlanID: string;
    encUserRoleID: string;
    initTime: string;
    activityCode: string;
    activityActualID: number;
    activityDesc: string;
    occupancyMin: number;
    refNumber: string;
    materialName: string;
}


export class ManageShiftClose {
    encShiftID: string;
    initTime: string;
    lst: any;
    inchargeAssessment: string;
    observation: string;
}

export class ChangeUserPlanTest {
    userTestID: number;
    encPlanID: string;
    userRoleID: number;
    initTime: string;
    activityCode: string;
    testID: number;
    type: string;
}

export class testOccupancyBO {
    testID: number;
    occMinutes: number;
    testName: string;
    isAssined: boolean;
}
export class SearchCloseShiftBo {
    dateFrom: Date;
    dateTo: Date;
    createdUserRoleID: number;
    createdUserRole: string;
    statusID: number;
    shiftIDFrom: number;
    shiftIDFromCode: string;
    shiftIDToCode: string;
    shiftIDTo: number;
    advanceSearch: string;
    pageSize: number;
    pageIndex: number;
    isHODApp: boolean;
    userID: number;
}

export class ViewShiftClose {
    requestCode: string;
    status: string;
    userName: string;
    requestDate: Date;
    assessment: string;
    observations: string;
}

export class ManageActStatus {
    encPlanID: string;
    initTime: string;
    lst: any;
}