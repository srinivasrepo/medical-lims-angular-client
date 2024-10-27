export class SingleIDBO {
    id: any
}

export class SingleCodeBO {
    code: string;
}

export class IDCode {
    id: number;
    code: string;
    sioID: number;
    minutes: number;
    maintRptID: number;
}
export class IDCodeList extends Array<IDCode>{ }


export interface NavItem {
    displayName: string;
    disabled?: boolean;
    iconName: string;
    route?: string;
    children?: NavItem[];
}

export class AppBO {
    initTime: string;
    canApprove: boolean;
    detailID: number;
    encTranKey: string;
    transKey: number;
    encryptedKey: string;
    appLevel: number;
    component: string;
    operationType: string = "MANAGE";
    isFinalApp: boolean;
    componentCode: string;
    showConfirmBtn: boolean;
    status: string;
    referenceNumber: string;
    batchNumber: string;
}

export class PrepareOccupancyBO {
    occupancyCode: string;
    encEntityActID: string;
    invID: number;
    batchNumber: string;
    occSource: string;
    occSourceName: string;
    entityRefNumber: string;
    conditionCode:string;
}

export class ManageOccupancy extends PrepareOccupancyBO {
    occupancyRequired: string;
    fromTime: any;
    toTime: any;
    eqpID: number;
    encEqpOthOccID: string;
    type: string;
    remarks: string;
    comment: string;
    occupancyType: string;
    refEqpOccID: number;
}


export class ManageChecklist {
    list: any;
    encEntityActID: string;
    entitySourceCode: string;
    entityCode: string;
    remarks: string;
}

export class GetProdStageDetails {
    stageID: number;
    stage: string;
    product: string;
}


export class ExportColumns {
    columnName: string;
    friendlyColumnName: string;
    columnType: string;
    select: boolean = false;
}

export class ExportBO {
    columns: string;
    condition: string;
    entityCode: string;
    plantFilter: boolean;
    paramList: Array<ExportColumns>;
}

export class RS232IntegrationBO {
    conditionCode: string;
    encEntityActID: string;
    type: string;
    reqCode: string;
    sectionCode: string;
    isClicked: boolean;
}

export class CategoryItem {
    catItemID: number;
    catItem: string;
    catItemCode: string;
    category: string;
    id : number;
}

export class CategoryItemList extends Array<CategoryItem>{ }

export class GetCategoryBO {
    list: any;
    type: string;
}

export class FileUploadProgress{
    encEntActID: string;
    fileName: string;
    sectionCode: string;
}