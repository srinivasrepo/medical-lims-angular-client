export class GridSettings {
    headers: any = [];
    dataSource: any = [];
    actions: any = [];
    valueBasedActions: any = [];
}

export class GridValueBasedAction {
    action: any;
    value: any;
    code: any;
}

export class LookupInfo {
    title: string;
    lookupCode: string;
    headerID?: string | number;
    headerName: string;
    headerCode?: string;
    displayField: LookUpDisplayField;
    condition?: string;
    extColumnName: string;
    placeholder: string;
    plantFilter: boolean;
    purposeCode: string;
    decrypt: boolean;
    name: string;
    hideFstCol: boolean;
}

export class materialCatInfo {
    category: string = "Select Material Category";
    subCategory: string = "Select Sub Category";
    material: string = "Material";
    categoryID: number;
    isCategoryShow: boolean = true;
    categoryCode: string;
    subCategoryID: number;
    materialID: number;
    materialName: string;
    condition: string = '1=2';
    categoryList: any;
    isSubCategoryShow: boolean = true;
    subCategories: any;
    lkpType: string = "OTH";
    IsActive: boolean = true;
}

export class stageInfoBO {
    productID: number;
    productName: string;
    stageID: number;
    bindKeyType: string = 'stagE_ID';
    entityCode: string;
}

export class stages {
    id: number;
    name: string;
}

export enum LookUpDisplayField {
    header,
    code,
    extColumn
}

export class SolventQntyPreparation {
    encEntityActID: string;
    entityCode: string;
    initTime: string;
    solList: Array<SolQntyPrep> = [];
    sourceType: string;
    chemicalConsumeComments: string;
    chemicalConsumeRefArID: number;
    chemicalConsumeRefArdsExecID: number;
}

export class SolQntyPrep {
    preparationID: number;
    paramAlies: string;
    quantityPreparation: any;
    preparationQuantityString: string;
    isPrimaryPreparationBatch: boolean;
}

export class FileDownload {
    encEntityActID: string;
    entityCode: string;
    section: string;
    fileUploadID: number;
    documentName: string;
    documentActualName: string;
    type: string;
    reportID: number;
}

export class UomDenominationObj {
    sourceUOM: string;
    targetUOM: string;
    materialID: number;
}

export class GridActionFilterBO {
    index: number;
    data: Array<any> = [];
}
export class GridActionFilterBOList extends Array<GridActionFilterBO>{ }

export class RS232IntegrationModelBO {
    id: string;
    encEntityActID: string;
    sourceCode: string = 'LAB_CHEM';
    instrumentID: number;
    occupancyCode = 'EQP_WEIGHING';
    reqCode: string;
    sourceName: string;
    chemicalName: string;
    batchNumber: string;
    isComingLabchamical: boolean = true;
    conditionCode: string;
    keyValue: any;
    keyActualValue: string;
    rs232Mode: string;
    occSource: string;
    sectionCode: string;
    parentID: string;
    isDOMAdded: boolean;
    refEqpOccID: number;
}

export class GetRs232IntegrationDetailsBO {
    fromDate: any;
    toDate: any;
    postFlag: string;
    equipment: string;
    sdmsList: any;
    eqpCode: string;
    encOccupancyID: string;
    occupancyID: number;
    rsIntegrationID: number;
    encRSIntegrationID: string;
    specTestID: string;
    rS232Mode: string;
}

export class ManageRS232IntegrationFieldsBO {
    encOtherID: string;
    entityActID: string;
    conditionCode: string;
    reqCode: string;
    keyTitle: string;
    actualKeyValue: string;
    keyValue: any;
    batchNumber: string;
    entityCode: string;
}

export interface TableLayoutConfig<T> {
    header: string;
    columnDef: keyof T;
    width?: string;
    order: number;
    show: boolean;
    cell: any;
}

export class SolventsItems {
    sno: string;
    materialCode: string;
    materialName: string;
    packBatchNumber: string;
    equipmentUserCodes: string;
    denomination: string;
    useBeforeDate: string;
}

export function GetSolventsItemsConfig(): TableLayoutConfig<SolventsItems>[] {
    return [
        { header: 'Sn', columnDef: 'sno', order: 0, show: true, cell: 'aa' }
    ]
}