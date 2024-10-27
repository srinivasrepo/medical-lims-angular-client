import { SingleIDBO } from 'src/app/common/services/utilities/commonModels';

export class analystBO {
    encAnalystID: string;
    userRoleID: number;
    reason: string;
    list: Array<SingleIDBO> = [];
    initTime: string;
}

export class qualificationBo {
    catItemID: number;
    catItem: string;
    isSelect: boolean;
    catItemCode: string;
}

export class searchAnalystBO {
    techniqueID: number;
    analystID: number;
    statusID: number;
    pageIndex: number;
    pageSize: number;
    analystName: string;
    techniqueName: string;
    arNumberID: number;
    arNumberName: string;
    matID: number;
    matName: string;
    advanceSearch: string;
    activityType: number;
    analysisType: number;
    dateFrom: Date;
    dateTo: Date;
    specTestID: number;
    specTestName: string;
    formulaType: string;
    conclusionID: number;
    sioID: number;
    inwardNumber: string;
    initiatedID: number;
    initiatedUser: string;
    initiatedDate: any;
    qualificationID :number;
    systemCode: string;
}

export class QualificationRequest {
    technique: string;
    analystName: string;
    qualificationType: string;
    chemicalName: string;
    arNumber: string;
    remarks: string;
    conclusion: string;
    analysisType: string;
    status: string;
    requestCode: string;
    type: string;
    justification: string;
    reQualificationPurpose: string;
    material: string;
    category: string;
    referenceNo: string;
    requestType: string;
    requestTypeCode: string;
    versionCode: string;
    volSolutionID: number;
    conculsionCode: string;
    disQualifyComments: string;
}

export class QualificationList {
    id: number;
    type: string;
}


export class SearchTestsByTechniqueAndArID {
    techniqueID: number;
    arID: number;
}

export class ManageQualificationRequest {
    encQualificationID: string;
    techniqueID: number;
    analystID: number;
    qualificationTypeID: number;
    matID: number;
    arID: number;
    initTime: string;
    typeCode: string;
    referenceNo: string;
    reQualificationPurposeID: number;
    list: Array<TestIDLIst> = [];
    fileUploadedIDs: Array<SingleIDBO> = [];
    entityCode: string;
    role: string;
    requestTypeID: number;
    volumetricIndexID: number;
}

export class TestIDLIst {
    qualificationTestID: number;
    specTestID: number;
}


export class ManageQualificationEvaluation {
    encQualificationID: string;
    conclusionID: number;
    remarks: string;
    initTime: string;
    justification: string;
    list: any;
    selectedAcceptanceCriteiaLst: Array<SelectedCriteiaBO>;
}

export class SelectedCriteiaBO {
    qualificationTestID: number;
    acceptanceCriteriaID: number;
    type: string;
}

