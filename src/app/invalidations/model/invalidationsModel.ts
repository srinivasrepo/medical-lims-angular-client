import { SingleIDBO } from 'src/app/common/services/utilities/commonModels';


export class PagerBO {
    pageIndex: number;
}

export class SearchInvalidationsBO extends PagerBO {
    invalidationID: number;
    statusID: number;
    instrumentTypeID: number;
    invTypeID: number;
    dateFrom: any;
    dateTo: any;
    status: number;
    selectedRefName: string;
    totalRecords: number;
    sourceTypeID: number;
    advanceSearch: string;
    arID: number;
    arName: string;
    matID: number;
    instrumentID: number;
    instrumentName: string;
    analysisDoneBy: number;
    analysisDoneByName: string;
    initiatedOn: Date;
    initiatedBy: number;
    initiatedByName: string;
    analysisType: number;
}

export class ManageInvalidationBO {
    encInvalidationID: string;
    type: string;
    impactTypeCode: string;
    sampleSetNo: string;
    dataFileNo: string;
    description: string;
    otherReasons: string;
    actionsRecommended: string;
    isReAnalysisValid: string;
    reviewActRecommended: string;
    implimantationSummary: string;
    initTime: string;
    instType: number;
    initSSTResult: string;
    initAnaResult: string;
    reSSTResult: string
    reAnaResult: string
    list: Array<SingleIDBO> = [];
    otherRootCause: string;
    qaRemarks: string;
    analysisDone: number;
}

export class RootCauseBo {
    catItemID: number;
    catItem: string;
    isSelect: boolean;
    catItemCode: string;
}

export class GenericIDBO {
    id: number;
    name: string;
}

export class GenericIDBOList extends Array<GenericIDBO>{ }

export class ManageInvalidationManualInfo {
    encInvalidationID: string;
    productName: string;
    stage: string;
    batchNumber: string;
    arNumber: string;
    instrumentTypeID: number;
    instrumentID: number;
    testName: string;
    specStpNumber: string;
    initTime: string;
}
