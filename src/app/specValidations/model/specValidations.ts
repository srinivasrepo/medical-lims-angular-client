import { SingleIDBO } from 'src/app/common/services/utilities/commonModels';

export class SpecValidRequestBO {
    specTestCatID: number;
    mode: number;
    entityCode: string;
    stpTemplateID: number;
}

export class SpecCyclesReq {
    encSpecValidationID: string;
    initTime: string;
    type: string;
    specValidCycleID: number;
    entityCode: string;
}

export class SearchSpecValidations {
    testID: number;
    mode: number;
    statusID: number;
    pageIndex: number;
    pageSize: number;
    entityCode: string;

    specID: number;
    specName: string;
    templateID: number;
    temlateName: string;
    specTypeID: number
    specTypeName: string;
    instrumentTypeID: number;
    instrumentTypeName: string;
    dateFrom: Date;
    dateTo: Date;
    advanceSearch: string;
    initiatedOn : Date;
    initiatedBy : number;
    initiatedByName : string;
}

export class viewSpecValidBO {
    specification: string;
    testName: string;
    mode: string;
    template: string;
    specificationName: string;
    matCode: string;
    documentID: string;
    documentName: string;
}

export class testValid {
    testCatID: number;
    entActID: number;
    entityCode: string;
}

export class GetSpecificationTestToAssignSTP{
    encSpecCatID : string;
    srNum : string;
    testName : string;
    resultStatus : string;
    templateCode : string;
    rowType : string;
    specDesc : string;
    specTestID : number;
    testCategoryID : number;
    testSubCatID : number;
    validationStatus: string;
    testCode : string;
    groupSpecCatID : number;
    isGroupTest : boolean;
}   

export class ManageSTP{
    specID : number;
    calibID : number;
    type : string;
    templateID : number;
    list : Array<SingleIDBO> = [];
}
