import { SingleIDBO } from 'src/app/common/services/utilities/commonModels';
import { TableLayoutConfig } from 'src/app/limsHelpers/entity/limsGrid';

export class manageMobilePhase {
    materialID: number;
    specificationID: number;
    purpose: string;
    initTime: string;
    encMobilePhaseID: string;
    stageID: number;
    preparationType: string;
    specTest: number;
    manual: string;
    parameterType: number;
    calibrationReference: string;
    fileUploadedIDs: Array<SingleIDBO>;
    MaintenanceReportID: number;
    entityCode: string;
    role: string;
}

export class solventsPreparation {
    initTime: string;
    encEntityActID: string;
    preparationID: number;
    labChemicalTypeID: number;
    materialID: number;
    batchID: number;
    quantityPreparation: number;
    uomID: number;
    entityCode: string;
    sourceType: string;
    packInvID: number;
    requestFrom: string;
    isPrimaryPreparationBatch: boolean;
    refInvID: number;
}

export class MobilePhasePrep {
    // bufferPrep: string;
    // phaseA: string;
    // phaseB: string;
    // diluentPrep: string;
    encEntActID: string;
    initTime: string;
    otherInfo: string;
    // solPH: number;
    list: GetSelectedMobilePreparationList = new GetSelectedMobilePreparationList();
    // otherList: OtherFieldsBOList = new OtherFieldsBOList();
}

export class MobilePhaseOutput {
    finalVol: number;
    validityPeriod: number;
    validityDate: string;
    encEntActID: string;
    initTime: string;
    otherInfo: string;
    list: GetMobilePreparationList = new GetMobilePreparationList();
}
export class searchBo {
    pageIndex: number;
    pageSize: number;
    productID: number;
    stageID: number;
    statusID: number;
    purpose: number;
    productName: string;
    advanceSearch: string;
    preparationType: number;
    batchNumber: number;
    batchName: string;
    specificationID: number;
    specificationName: string;
    specTestID: number;
    testName: string;
    validFrom: Date;
    validTo: Date;
    mobilePhaseIDFrom: number;
    mobilePhaseFromCode: string;
    mobilePhaseIDTo: number;
    mobilePhaseToCode: string;
    initiatedBy: number;
    initiatedByName: string;
    initiatedOn: Date;
    mobilePhaseID : number;
    mobilePhaseName : string;
}

export class viewMobilePhase {
    productName: string;
    stage: string;
    specification: string;
    purpose: string;
    preparationType: string;
    bufferPrep: string;
    phaseA: string;
    phaseB: string;
    diluentPrep: string;
    finalVol: number;
    validityPeriodValue: string;
    validityDate: any;
    solPH: number;
    otherInfo: string;
    preparationTypeCode: string;
    specTestName: string;
    manual: string;
    calibrationReference: string;
    parameterName: string;
    comment: string;
    discardedOn: string;
    discardedBy: string;
    outputOtherInfo: string;
    specID: number;
    calibPramID: number;
    specificationName: string;
}

export class CommentsBO {
    encEntityActID: string;
    purposeCode: string;
    comment: string;
    entityCode: string;
}

export class GetMobilePreparation {
    preparationID: number;
    preparationName: string;
    preparation: string;
    preparationSolPH: any;
    prepartionVolum: any;
    validationPeriodID: number;
    useBeforeDate: any;
    preparationCode: string;
    phUsedCount: number = 0;
    isVisible: boolean;
    isCalculateVol: boolean;
    isPreparationMandatory: boolean;
    weight: string;
}
export class GetMobilePreparationList extends Array<GetMobilePreparation>{ }

export class GetSelectedMobilePreparation {
    preparationID: number;
    preparation: string;
    solutionPH: any;
    weight: string;
}
export class GetSelectedMobilePreparationList extends Array<GetSelectedMobilePreparation>{ }

export class PreparationData {
    preparationTextTypeID: number;
    preparationTextType: string;
    preparationText: string;
    preparationCode: string;
}

export class MasterData {
    type: string;
    preparationType: string;
    typeCode: string;
    materialID: number;
    testID: number;
    lst: Array<PreparationData>;
    encMobilePhaseID: string;
}

export class OtherFieldsBO {
    integrationOtherID: number;
    keyValue: string;
    keyActualValue: any;
    encIntegrationOtherID: string;
}

export class OtherFieldsBOList extends Array<OtherFieldsBO>{ }

export class MPSearchTableColumns {
    batchNumber: string;
    productName: string;
    userName: string;
    specTest: string;
    useBefore: string;
    status: string;
}

export function MPSearchTableColumnConfig(): TableLayoutConfig<MPSearchTableColumns>[] {
    return [
        { header: 'Batch Number', columnDef: 'batchNumber', order: 1, show: true, cell: (element: any) => `${element.batchNumber}`, width: 'maxWidth-15per' },
        { header: 'Product Name', columnDef: 'productName', order: 2, show: true, cell: (element: any) => `${element.productName}`, width: 'minWidth-30per' },
        { header: 'Initiated By', columnDef: 'userName', order: 3, show: true, cell: (element: any) => `${element.userName}`, width: 'maxWidth-15per' },
        { header: 'Test/Parameter Name', columnDef: 'specTest', order: 4, show: true, cell: (element: any) => `${element.specTest}`, width: 'minWidth-20per' },
        { header: 'Valid Up to', columnDef: 'useBefore', order: 5, show: true, cell: (element: any) => `${element.useBefore}`, width: 'maxWidth-11per' },
        { header: 'status', columnDef: 'status', order: 6, show: true, cell: (element: any) => `${element.status}`, width: 'maxWidth-10per' },
    ]
}