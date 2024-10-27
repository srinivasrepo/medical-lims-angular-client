import { SingleIDBO } from 'src/app/common/services/utilities/commonModels';

export class ManageRinsingSolution {
    encSolutionID: string;
    solutionID: number;
    solutionName: string;
    stpNumber: string;
    materialID: number;
    usageTypeID: number;
    briefDescription: string;
    preparationRemarks: string;
    uploadedID: Array<SingleIDBO> = [];
    type: string;
    usageType : string;
    usageTypeCode : string;
}

export class GetRinsingSolution {
    solutionID: number;
    encSolutionID: string;
    solutionName: string;
    stpNumber: string;
    briefDescription: string;
    preparationRemarks: string;
    finalVolume: number;
    usebeforeDate: Date;
    outputRemarks: string;
    usageTypeID: number;
    usageType: string;
    validityPeriodID: number;
    validityPeriod: string;
    status: string;
    requestCode: string;
    materialID: number;
    material: string;
    matCategoryID: number;
}

export class ManageOutputRinsingSol {
    encSolutionID: string;
    finalVolume: number;
    validityPeriodID: number;
    useBeforeDate: string;
    initTime: string;
    outputRemarks: string;
    uom: string;
    validityPeriod: string;
    uploadedID: Array<SingleIDBO> = [];
}

export class SearchRinsingSolutions {
    statusID: number;
    usageType: number;
    pageIndex: number;
    nameOfTheSolution: string;
    stpNumber: string;
    batchNumberID: number;
    batchNumberName: string;
    validityFrom: Date;
    validityTo: Date;
    solutionIDFrom: number;
    solutionIDFromName: string;
    solutionIDToName: string;
    solutionIDTo: number;
    advanceSearch: string;
    initiatedOn : Date;
    initiatedBy : number;
    initiatedByName : string;
    solutionID : number;
    solutionName : string;
}