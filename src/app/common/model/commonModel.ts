export class ReportBO {
    encActID: string;
    enityRptCode: string;
    extRptCode: string;
}

export class ParamMasterObj {
    paramField: string;
    paramFType: string;
}

export class AddMaterial {
    categoryID: number;
    catItemID: number;
    material: string;
    materialAlies: string;
    materialType: number;
    materialUom: number;
    entityCode: string;
}

export class AddMaterialLables {
    material: string = "Solution Name";
    uom: string = "Solution UOM";
    materialType: boolean = true;
    isUomDisabled: boolean = false;
    refNumber: string = "STP Ref. Number";
    entityCode: string;
}

export class materialUomCon {
    materialID: number;
    targetUom: number;
    targetValue: number;
}

export class DeviationBO {
    CanRiceDeviation: boolean;
    DeviationType: string;
    comments: string;
    lst: Array<numberIDBO>
}

export class DeviationMessages {
    public static devTypeRequire = "Please select deviation type";
    public static devCommentsReqire = "Please provide comments";
    public static devCommentsmin30 = "Please enter minimum 30 characters";
    public static selectNumber = "Selected number already exists";
    public static selectAtleast = "Please select at least one number";
}

export class numberIDBO {
    dID: number;
}

export class SDMSDetails {
    specTestID: number;
    referenceNumber: string;
    batchNumber: string;
    instrumentID: number;
    analystName: string;
    dateAnalyzed: any;
    sampleName: string;
    preparation: string;
    methodName: string;
    templateCode: string;
    detailsList: DetailsList[] = [];
}

export class DetailsList {
    key: string;
    value: string;
}

export class GetSpecHeaderInfo {
    matCode: string;
    matName: string;
    specType: string;
    category: string;
    specNumber: string;
    supersedNumber: string;
    supersedDate: string;
    compositSampleQty: number;
    csUom: string;
    analysisSampleQty: number;
    asUom: string;
    specification: string;
    statusCode: string;
    status: string;
    stage: string;
    prodName: string;
    prodCode: string;
    targetReviewDate: string;
    effectiveFrom: string;
    effectiveTo: string;
    pharmReference: string;
    subCategory: string;
    sampleType: string;
    viewRemarks: string;
    viewResult: string;
    analysisSampleQtyUom: string;
    compositSampleQtyUom: string;
    title: string;
    instrUserCodes: string;
    instrumentType: string;
    requestCode: string;
}

export class GetCAPAActionsBySourceRefType {
    encSourceRefID: string;
    sourceRefCode: string;
    capaType: string;
    capaModuleCode: string;
}

export class CAPAInsertUpdateCAPA {
    capaID: number;
    capa: string;
    targetDate: Date;
    capaType: string;
    capaSourceID: number;
    capaSourceCode: string;
    capaSrcOthers: string;
    encSourceReferenceID: string;
    sourceReference: string;
    initTime: string;
    retVal: string;
    capaOwner: string;
    bulidID: number;
    capaNature: string;
    qualityIssDesc: string;
    doctString: string;
    type: number;
    areaOfImplementation: number;
    scopeOfCapa: number;
    capaOwnerID: number;
    isNewCapa: boolean;
    isFromUC: boolean;
    moduleCode: string;
}