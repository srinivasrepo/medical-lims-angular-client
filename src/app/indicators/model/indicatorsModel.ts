import { PagerBO } from '../../invalidations/model/invalidationsModel';

export class SearchIndicatorsBO extends PagerBO {
    statusID: number;
    indicatorType: number;
    indicatorID: number;
    solutionID: number;
    indicatorName: string;
    solutionName: string;
    advanceSearch: string;
    batchNumberID: number;
    validityFrom: Date;
    validityTo: Date;
    indicatorIDTo: number;
    indicatorIDToName: string;
    batchNumberName: string;
    initiatedOn : Date;
    initiatedBy : number;
    initiatedByName : string;
    indicatorCodeID : number;
    indicatorSystemCodeName : string;

}

export class ManageIndicatorBO {
    encIndicatorID: string;
    indicatorType: number;
    indicatorSol: number;
    briefDescription: string;
    volumePrepared: any;
    type: string;
    useBefore: any;
    initTime: string;
    uploadedID: any;
    otherInfo: string;
    validatePeriodID: number;
    entityCode: string;
    role: string;
    solutionPH : number;
    weight : string;
    dryingTemp: string;
    dryingDuration: string;
    coolingDuration: string;
}

export class ManageMasterData {
    type: string;
    preparationTypeID: number;
    solutionID: number;
    description: string;
    preparationMasterID: number;
    entityCode: string;
    encEntActID : string;
}

// export class ManageTestSolutionObj {
//     stpRefNumber: string;
//     initTime: string;
//     encTestSolID: string;
//     subCatID: number;
// }