import { SingleIDBO } from 'src/app/common/services/utilities/commonModels';

export class SearchOos {
    categoryID: number;
    subCatID: number;
    materialID: number;
    batchNumber: number;
    oosNumberFrom: number;
    oosNumberTo: number;
    dateFrom: Date;
    dateTo: Date;
    testID: number;
    specificationID: number;
    projectID: number;
    statusID: number;
    productID: number;
    stageID: number;
    moleculaType: number;
    pageIndex: number;
    pageSize: number;
    buildID: number;
    testName : string;
    specificationName : string;
    productName : string;
    batchNoName : string;
    advanceSearch : string;
    categoryName : string;
    subCatName : string;
    selectedMaterial: string;
}

export class ManageOOSProcess {
    encOOSTestID: string;
    encOOSTestDetailID: string;
    count: number;
    status: string;
    validity: string;
    remarks: string;
    obviousRootCause: string
    rootCauserelatedTo: string;
    lst: any;
    isMisc: boolean;
    justificationToSkip: string;
    correctError: string;
    correctiveAction: string;
    phaseID: number;
    proposeCapa: string;
}

export class ManageHypoTesting {
    encOOSTestID: string;
    encOOSTestDetailID: string;
    hypoTestPhaseID: number;
    phaseID: number;
    action: string;
}

export class manageDeptReview {
    encOOSTestDetailID: string;
    remarks: string;
    othDeptName: string;
    validity: string;
    status: string;
    list: Array<SingleIDBO> = [];
}

export class manageDeptCommetns {
    encOOSTestDetailID: string;
    initTime: string;
    list: any;
}

export class ManageQASummaryInfo{
    encOOSTestID : string;
    initTime : string;
    customerID : number;
    isQualityAgreement : string;
    isOOSNotify : string;
    qARemarks :string;
    customerName : string;
    descNotification : string;
    reasonForDelay : string;
    devCode : string;
}

export class ManageOOSSummaryInfo {
    encOOSTestID: string;
    initTime: string;
    isLabInvestReviewed: string;
    otherCause: string;
    mfgInvstDone: string;
    rootCauseMfgInvestigation: string;
    mfgChkAttached: string;
    refDevInvestigation: string;
    devID: number;
    summaryOOS: string;
    commentsIfAny: string;
    praposePrevAction: string;
    procViolationJustification: string;
    checkListObservation: string;
    checkListJustification: string;
    reAnaObservation: string;
    reAnaJustification: string;
    confirmAnaObservation: string;
    confirmAnaJustification: string;
    oosInvestObservation: string;
    oosInvestJustification: string;
    rootCauseOOS: number;
    rootCauseDesc: string;
    rootCauseCode: string;
    catCode: string;
    devNumber: string;
    justificationForDelay: string;
    showJustificationDelay: boolean;
}