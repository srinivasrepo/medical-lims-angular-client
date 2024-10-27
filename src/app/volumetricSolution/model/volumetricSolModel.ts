import { PagerBO } from '../../invalidations/model/invalidationsModel';
import { SingleIDBO } from 'src/app/common/services/utilities/commonModels';

export class SearchVolumetricSolBO extends PagerBO {
    formulaType: string;
    materialID: number;
    material: string;
    statusID: number;
    advanceSearch: string;
    batchNumberID: number;
    batchName: string;
    validityFrom: Date;
    validityTo: Date;
    solutionIDFrom: number;
    solutionIDFromName: string;
    solutionIDToName: string;
    solutionIDTo: number;
    initiatedOn: Date;
    initiatedBy: number;
    initiatedByName : string;
    solutionID : number;
    solutionIDName : string;
}

export class GetVolumetricSolIndex {
    type: string;
    encIndexID: string;
    materialID: number;
    psMaterialID: number;
    molecularWeight: any;
    formulaType: string;
    comments: string;
    stpRefNumber: string;
    entityCode: string;
    status : string;
}

export class AddSolution {
    materialID: number;
    encSolutionID: string;
    initTime: string;
    brefDesc: string;
    preparationVolume: number;
    uom: number;
    formulaID: number;
    formulaTitle: number;
    type: string;
    validityPeriodID: number;
    restandardizationPeriodID: number;
    psDryingTem: string;
    dryingDuration: string;
    coolingDuration: string;
}

export class VolumetricStdDetails {
    initTime: string;
    psDrying: string;
    finalVol: string;
    encStandardID: string;
    stdList: Array<StdItems> = [];
    avg: any;
    remarks: string;
    stdProcedure: string;
    coolingDuration: string;
    dryingDuration: string;
    blankValue: any;
    previousMolarity: any;
    formulaList: Array<any> = [];
    formulaDef: string;
}

export class StdItems {
    detailID: number;
    psWeight: any;
    volConsumed: any;
    result: any;
}

export class ReStand {
    encSolutionID: string;
    stdType: string;
    initTime: string;
}

export class InvalidateBO extends ReStand {
    initTime: string;
}

export class StandardProcedure {
    encIndexID: string;
    preparationProcedure: string;
    standardizationProcedure: string;
    type: string;
}

export class GetAssignFormulae {
    formulaID: number;
    formulaTitle: string;
    isSelect: boolean;
    strengthRangeFrom: number;
    strengthRangeTo: number;
    indexFormulaID: number;
}

export class AssignFormulae {
    encIndexID: string;
    formulaID: number;
    strengthRangeFrom: number;
    strengthRangeTo: number;
    type: string;
    formulaIndexID: number;
}

export class VolFormulaBO {
    inputCode: string;
    value: string;
}
export class VolFormulaBOList extends Array<VolFormulaBO>{ }

export class VolSolutionIndex {
    createdBy: string;
    lastUpdatedBy: string;
    createdOn: Date;
    comment: string;
    preparationProcedure: string;
    standardizationProcedure: string;
}

export class SolMgmtFormulae {
    formulaTitle: string;
    strengthRangeFrom: any;
    strengthRangeTo: any;
}

export class InvReviewDetailsBO {
    invalidationNumber: string;
    reviewedBy: string;
    reviewedOn: string;
}