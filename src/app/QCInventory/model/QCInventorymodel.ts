export class QCInventSearch {

}

export class ManagePack {
    invID: number;
    natureTypeID: number;
    lst: any;
}

export class ManageBatches {
    encInvSourceID: string;
    list: any;
    initTime : string;
}
export class ManageQcInvtDetails {
    matID: number;
    mfgID : number;
    batchNumber: string;
    qty: number;
    // userBeforeDate: any;
    entityCode: string;
}

export class ViewQCInvtDetails {
    subCategory: string;
    chemicalName: string;
    chemicalCode: string;
    batchNumber: string;
    batchQty: number;
    balanceQty: number;
    status: string;
    mfgDate: any;
    expiryDate: any;
    refNumber: string;
    chemicalSource: string;
    grade: string;
    block: string;
    invDate: any;
    uom: string;
    natureofChemical: string;
    manufacturerName : string;
    inHouse : boolean;
    purity : string;
    density : string;
}
export class SearchQCInvetory {
    invID: number;
    matID: number;
    statusID: number;
    status: number;
    entityID: number;
    entity: number;
    batchUseBeforeDate: Date;
    useBeforeDate: Date;
    btBefDate: Date;
    useBefDate: Date;
    pageIndex: number;
    totalRecords: number;
    selectedMatText: string;
    selectedBatchText: string;
    chemicalType : number;
    inwardDateFrom :Date;
    inwardDateTo :Date;
    advanceSearch : string;
    blockID : number;
    manufactureID : number;
    manufacturerName : string;
    // batchExpDateTo : Date;
    chemicalGrade : number;
    categoryID : number;
    subCategoryID : number;
    batchNumberName : string;
    showZeroQtyRecords :boolean;
    categoryName:string;
    subcategoryName:string;
    matName : string;
    categoryCode :string;
}

export class StatusDetails {
    statusID: number;
    status: string;
    statusCode: string;
}

export class OpenPackDetails {
    packInvID: number;
    packNo: string;
    validityPeriodID: number;
    statusCode: string;
    remarks: string;
}

export class Validity {
    ID: number;
    code: string;
    name: string;
    value: number;
}

export class MiscConsumption {
    packInvID: number;
    qty: number;
    uom: string;
    Remarks: string;
}

export class GetPackDetailsBO {
    encInvPackID: string;
    encInvID: string;
    refPackID : string;
}

export class GetQCInventorySources {
    entityID: number;
    entity: string;
}

export class BatchSplitBO {
    refNumber: string;
    batchQnty: any;
    actualQnty: any;
    initTime: string;
    encInvID: string;
    encInvSourceID: string;
}

export class GetBlockList{
    type : string;
    deptCode : string;
}