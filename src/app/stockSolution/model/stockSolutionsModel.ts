import { SingleIDBO } from 'src/app/common/services/utilities/commonModels';
import { OtherFieldsBOList } from 'src/app/mobilePhase/model/mobilePhaseModel';

export class StockSolutionRequest {

    encStockSolutionID: string;
    solutionIndexID: number;
    testID: number;
    instID: number;
    dryingTemp: string;
    dryingDuration: string;
    coolingDuration: string;
    uploadedID: Array<SingleIDBO> = [];
    type: string;
    manual: string;
    calibrationReferenceID: number;

}

export class GetStockSolutionDetails {
    encStockSolutionID: string;
    description: string
    finalVolume: number;
    solutionIndexID: number;
    solutionName: string;
    instrument: string;
    instrumentType: string
    instrumentTypeCode: number;
    instrumentCode: string;
    instrumentTypeID: number;
    testID: number;
    testTitle: string;
    testCode: string;
    useBefore: string;
    validity: string;
    validityTitle: string;
    dryingTemp: string;
    dryingDuration: string;
    referenceNumber: string;
    status: string;
    briefDescription: string;
    uom: string;
    instID: number;
    otherInfo: string;
    coolingDuration: string;
    materialCode: string;
    materialName: string;
    batchNumber: string;
    manual: string;
    calibrationReferenceID: number;
    calibrationReference: string;
    calibPramID: number;
    weight: any;
    solPH: any;
}

export class StockDetailsPreparation {
    encStockSolutionID: string;
    briefDescription: string;
    otherInfo: string;
    initTime: string;
    description: string;
    uom: string;
    solPH: any;
    weight: any;
}

export class StockDetailsOutput {
    encStockSolutionID: string;
    finalVolume: number;
    validity: number;
    useBefore: string;
    initTime: string;
    uom: string;
    uploadedID: Array<SingleIDBO> = [];
    // otherList: OtherFieldsBOList = new OtherFieldsBOList();
}

export class SearchStockDetails {
    statusID: number;
    solutionID: number;
    pageIndex: number;
    solutionName: string;
    validityFrom: Date;
    validityTo: Date;
    advanceSearch: string;
    stockSolutionIDFrom: number;
    stockSolutionIDFromName: string;
    stockSolutionIDTo: number;
    stockSolutionIDToName: string;
    batchNumberID: number;
    batchName: string;
    instrumentType: number;
    instrumentID: number;
    instrumentName: string;
    parameterID: number;
    parameterName: string;
    initiatedBy : number;
    initiatedByName : string;
    initiatedOn : Date;
    stockSolutionCode : number;
    stockSolutionCodeName : string;
}

export class StatusDetails {
    statusID: number;
    status: string;
    statusCode: string;
}