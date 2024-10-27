export class SearchSampleDestruction{
    destructionID: number;
    dateFrom: Date;
    dateTo: Date;
    dtFrom:Date;
    dtTo:Date;
    status:number;
    destructionSource: number;
    statusID: number;
    pageIndex: number;
    totalRecords: number;
    selectedDestrNo:string;
    destructionSourceCode: string;
    wasteType: number;
    natureOfWaste: number;
    modeOfDestruction: number;
    advanceSearch : string;
    batchNumberID : number;
    batchName : string;
    matID : number;
    matName:string;
    createdUserRoleID : number;
    createdUserName : string;
    createdOn : Date;
  
}

export class GetCatItemsByCatCodeModel {
    catItemID: number;
    catItem: string;
    catItemCode: string;
    categoryID: number;
    status: string;
    category: string;
}

export class ManageDestructionSamplesModel {
    encDestructionID: string;
    destructionSource: number;
    destructionSourceCode: string;
    typeOfWaste: number;
    natureOfWaste: number;
    modeOfDestruction: number;
    quantity: string;
    list: Array<ContainerDataModel> = [];
    disposalRemarks: string;
    refNumber: string;
    destructionOfSource: string;
    initTime: string;
    destructionSourceName : string;
    typeOfWasteName : string;
    typeOfWasteCode : string;
    natureOfWasteName : string;
    natureOfWasteCode : string;
    modeOfDestructionName : string;
    modeOfDestructionCode : string;
}

export class ContainerDataModel {
    containerID: number;
}

export class GetSampleDestruction {
    invID: number;
    matID: number;
    statusID: number;
    batchUseBeforeDate: Date;
    useBeforeDate: Date;
}

export class SaveSampleDestruction {
    sourceCode: string = 'CHEM_INV';
    remarks: string;
    list: Array<SavePackBO> = [];
}

export class SavePackBO {
    sourceActualID: number;
    destructionQuantity: string;
    matID: number;
    sourceReferenceNumber: string;
    batchNumber: string;
}

export class ViewSampleDestructionModel {
    destructionSource: string;
    typeOfWaste: string;
    natureOfWaste: string;
    modeOfDestruction: string;
    quantity: string;
    disposalRemarks: string;
    requestCode:string;
    status:string;
    refNumber : string;
    destructionOfSource : string;
}