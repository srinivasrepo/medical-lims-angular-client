import { numberIDBO } from 'src/app/common/model/commonModel';
import { SingleIDBO } from 'src/app/common/services/utilities/commonModels';
import { OtherFieldsBOList } from 'src/app/mobilePhase/model/mobilePhaseModel';

export class SearchSampleAnalysis {
    catID: number;
    catName: any;
    catCode: string;
    subcatID: number;
    subCatCode: string;
    subCatName: string;
    matID: number;
    sampleID: number;
    productID: number;
    stageID: number;
    batchID: number;
    analysisTypeID: number;
    aRID: number;
    statusID: number;
    plantAreaID: number;
    projectID: number;
    dateFrom: any;
    dateTo: any;
    selectedMatText: string;
    selectedProdText: string;
    selectedSampleText: string;
    selectedBatchText: string;
    selectedArText: string;
    selectedProjectText: string;
    advanceSearch: string;

    moleclueType: number;
    pageSize: number;
    pageIndex: number;
}

export class AnalysisHeaderBO {
    productName: string;
    matCode: string;
    stage: string;
    invBatchNumber: string;
    sioCode: string;
    arNumber: string;
    analysisType: string;
    status: string;
    batchQty: any;
    specNumber: any;
    sampleNumber: string;
    specID: number;
    initTime: string;
    sampleMode: string;
    uom: string;
    analysisTypeCode: string;
    inwardType: string;
    canShowPack: boolean;
    matID: number;
    analsysMode: string;
    checkListCategory: string;
    isResetPending: boolean;
    analysis: string;
    samAnaID: number;
    encSamAnaID: string;
    headerType: string = 'ANA_TYPE';
    currentTab: string;
    inwardDate: any;
    retCode: string;
    statusCode: string;
    updRemarksStatus: string;
    screenCode: string;
    batchSource: string;
    mfgDate: any;
    supSamMfgDate: any;
    sampleUom: string;
    sampleQty: any;
    arID: number;
    reviewedBy: string;
    extraneousMatterApplicable: string;
    invID: number;
    canAccess: boolean;
    refSioCode: string;
    isMixedSolvent: string;
}

export class SupplierCOADetails {
    encSamAnalysisID: string;
    coaSpec: string;
    sampledBy: string;
    sampleResult: string;
    remarks: string;
    encSioID: string;
    sioID: number;
    supRetestExpiryTypeValue: string;
    storageCondition: string;
    supRetestExpiryDate: any;
    initTime: string;
}

// -- ARDS SELECTION PAGE BO'S --

export class GetARDSSelectionsBO {
    specifications: GetSpecificationsBOList = new GetSpecificationsBOList();
    specArdsApplicable: CategoryItemsBOList = new CategoryItemsBOList();
    printReq: GetARDSPrintReqBOList = new GetARDSPrintReqBOList();
    printHis: GetARDSPrintHisBOList = new GetARDSPrintHisBOList();
}

export class GetSpecificationsBO {
    specID: number;
    specNumber: string;
    specification: string;
    hasStp: boolean;
    displayName: string;
}
export class GetSpecificationsBOList extends Array<GetSpecificationsBO>{ }

export class CategoryItemsBO {
    catItemID: number;
    catItem: string;
    catItemCode: string;
    categoryID: number;
}
export class CategoryItemsBOList extends Array<CategoryItemsBO>  { }



// get ards print request

export class GetARDSPrintReqBO {
    ardsID: number;
    doctNum: string;
    doctName: string;
}
export class GetARDSPrintReqBOList extends Array<GetARDSPrintReqBO>{ }

// get ards print history

export class GetARDSPrintHisBO {
    docID: number;
    doctNum: string;
    doctName: string;
    status: string;
    statusCode: string;
    docPath: string;
}
export class GetARDSPrintHisBOList extends Array<GetARDSPrintHisBO>{ }


// Save ARDS 

export class ManageArdsBO {
    encEntityActID: string;
    specID: number;
    analysisMode: string;
    trackID: number;
    docPath: string;
    encArdsID: string;
    type: string;
    specNumber: string;
    analysis: string;
    initTime: string;
    entityCode: string;
    extraneousAnalysis: string;
    list: any;
    containerWiseAnalysisApp: string;
    role: string;
    sectionCode: string;
}

export class DiscardPrintRequestBO {
    encEntActID: string;
    reqDocID: number;
    initTime: string;
    entityCode: string;
    refNumber: string;
}

export class manageSamplingInfo {
    encSioID: string;
    sampleCollected: string;
    samplerID: string;
    samplerTitle: string;
    noofContainers: number;
    sampledBy: string;
    sampleReceviedOn: any;
    sampleStorageTemp: string;
    compositeSampleQty: number;
    uom: number;
    qtyAnalysis: number;
    reserveSampleQty: number;
    reserveSampleUom: number;
    workBookNumber: string;
    deviation: string;
    reviewedBy: string;
    reviewedOn: any;
    qtyFrom: string;
    initTime: string;
    encIoID: string;
    equipment: string;
    samplingPoint: number;
    otherList: OtherFieldsBOList = new OtherFieldsBOList();
    referenceNumber: string;
}

export class GetSamplePacks {
    purposeCode: string;
    encSioID: string;
    secUomID: number;
    reqQuantity: number;
    lst: any;
}

export class SamplePacks {
    isSelected: boolean;
    batchNumber: string;
    entInvID: number;
    grossWeight: number;
    invPackID: number;
    packNumber: string;
    remainQty: number;
    requestQty: number;
    reserveQty: number;
    sealNumber: string;
    tareWeight: number;
    packIssueQty: number;
    availableQty: string;
    reservedQty: string;
    uom: string;
    viewPackIssueQty: string;
}

export class managePack {
    entInvID: number;
    invPackID: number;
    issueQty: number;
    sealNo: string;
}

export class ManageAnalysisOccupancyBO {
    encSamAnalTestID: string;
    occupancyRequired: boolean;
    occupancyType: string;
    dateFrom: any;
    dateTo: any;
    remarks: string;
    instrumentTitleID: number;
    // columnID: number;
    // dataSeqFile: string;
    // mobilePhase: string;
    // noOfinjections: number;
    // cumulativenoofinjections: number;
    encSamAnaInstID: string; // primary key
    //column: string;
    occupancyReq: string;
    testInitTime: string;
    entityCode: string;
    //mobilePhaseID: number;
    encEnityActID: string;
    refNo: string;
    list: any;
    epqOccID: number;
    refEqpOccID: number;
    isRefOcc: boolean;
}

export class ColumnBO {
    columnID: number;
    dataSeqFile: string;
    noOfInjections: number;
    cumulativeInj: number;
    eqpCode: string;
    columnInjectionID: number;
    remarks: string;
    encEnityActID: string;
    entityCode: string;
    refNo: string;
    epqOccID: number;
}

export class SampleTest {
    category: string;
    subCategory: string;
    testTitle: string;
    result: string;
    resultTo: string;
    passOrFail: string;
    specDesc: string;
    methodType: string;
    resultID: string;
    testInitTime: string;
    isOOSRequred: Boolean;
    updTestStatus: string;
    resultType: string;
    specPassOrFail: string;
    templateID: number;
    type: string;
    typeCode: string;
    corrValue: string;
    testUom: string;
    phaseType: string;
    newSampleRefID: number;
    newSampleRefCode: string;
    typeID: number;
    ardsMode: string;
}

export class GetTestResult {
    encSampleAnaTestID: string;
    result: number;
    resultTo: number;
    sourceCode: string;
}

export class UpdTestResult {
    encSampleAnaTestID: string;
    result: string;
    passOrFail: string;
    resultTo: string;
    sendOss: boolean;
    initTime: string;
    testInitTime: string;
    resultType: string;
    entityCode: string;
    specPassOrFail: string;
    typeCode: string;
    corrValue: string;
    justification: string;
    newSampleRefID: number;
}

export class analysisRemarks {
    encSioID: string;
    remarks: string;
    initTime: string;
    specPrecautions: string;
    entityCode: string;
    containerAnaID: number;
    sourceCode: string;
    analysisStatus: string;
    referenceNumber: string;
}

export class deviation {
    dcActionCode: string;
    encEntityActID: string;
    entityCode: string;
    refCode: string;
    devType: string;
    remarks: string
    initTime: string;
    lst: Array<numberIDBO>;
}

export class ManageTestSampleRRTValuesBO {
    encSamTestID: string;
    type: string;
    testDesc: string;
    result: string;
    acceptenceCriteria: string;
    encRRtID: string;
    initTime: string;
}

export class GetArdsHeadersBO {
    testTitle: string;
    stpTitle: string;
    initTime: string;
    rawdataUpdatedBy: string;
    rawdataUpdOn: any;
    rawDataConfirmedBy: string;
    rawdataConfOn: any;
    updTestStatus: string;
    chemicalConsumeComments: string;
    chemicalConsumeRefArID: number;
    chemicalConsumeRefArdsExecID: number;
    chemialConsumeTestTitle: string;
    chemicalConsumeRefArNumber: string;
    sectionList: ArdsSectionBOList = new ArdsSectionBOList();
    sectionDataList: ArdsSectionDataList = new ArdsSectionDataList();
    dynamicValueLst: any;
    tableResultLst: TableResultSetsList = new TableResultSetsList();
    isUnknownMapping: boolean;
    isknownMapping: boolean;
}

export class ArdsSectionBO {
    sectionID: number;
    section: string;
    tabID: number;
    sectionSubject: string;
}
export class ArdsSectionBOList extends Array<ArdsSectionBO>{ }

export class ArdsSectionDataBO {
    inputType: string;
    inputCode: string;
    inputDescription: string;
    sectionID: number;
    itemOrder: number;
    value: string;
    detailID: number;
    prevValue: string;
    updateFlag: string;
    isDisable: boolean;
    keyName: string;
    invalidationID: number;
    passOrFail: string;
    formulaResultFlag: string;
    tabID: number;
    specTestID: number;
    sdmsID: number;
    createdBy: string;
    updatedBy: string;
    createdOn: any;
    updatedOn: any;
    displayToolTip: string;
    initialValue: string;
    skipType: string;
    isCommonData: boolean;
    resultID: number;
    isFormulaDependent: boolean;
    isAccCriteriaApp: boolean;
    formulaType: string;
}
export class ArdsSectionDataList extends Array<ArdsSectionDataBO>{ }

export class SaveInputValue {
    detailID: number;
    samAnaTestID: number;
    value: string;
    ardsSourceCode: string;
    initTime: string;
    isFormulaEval: boolean;
    actValue: string;
    ImpurityValues: any;
}


export class TabBO {
    tabID: number;
    tab: string;
    sectionSubject: string;
}

export class MngAdditionTest {
    encSamAnaID: string;
    testID: number;
    specLimit: string;
    result: string;
}

export class updFinalRemarks {
    encSamAnaID: string;
    initTime: string;
    Remarks: string;
    entityCode: string;
}

export class FormulaData {
    samAnaTestID: number;
    sourceCode: string;
    detailID: number;
    initTime: string;
    entityCode: string;
}

// export class ManageIncludeExcludeBO {
//     initTime: string;
//     list: IncludeExcludeTestBOList = new IncludeExcludeTestBOList();
// }

export class IncludeExcludeTestBO {
    id: number;
    testInitTime: string;
}
export class IncludeExcludeTestBOList extends Array<IncludeExcludeTestBO>{ }


export class IncludeExcludeTestBOItems {
    entityCode: string;
    sourceCode: string;
    list: IncludeExcludeTestBOList = new IncludeExcludeTestBOList();
}


export class InputDragValuesBO {
    keyName: string;
    value: string;
    detailID: number;
    operationType: string;
    field: string;
    sdmsID: number;
}
export class InputDragValuesBOList extends Array<InputDragValuesBO>{ }

export class ManageSDMSInputDetails {
    encSamAnaTestID: string;
    source: string = 'SAMANA';
    initTime: string;
    list: InputDragValuesBOList = new InputDragValuesBOList();
}


export class GetCurrentAnalysisBO {
    samAnaTestID: any;
    arID: number;
    arNumber: string;
    currentSamAnaTestID: string;
    testName: string;
    sdmsID: number;
    sdms: string;
}

export class ManageFinalFormulaBO {
    samAnaTestID: any;
    detailID: number;
    aRDSSourceCode: string;
    initTime: string;
    formula: string;
    specTestID: number;
    type: string;
    comments: string;
    impurityValueID: number;
}

export class ManageContainerWiseChemicals {
    containerWiseMatID: number;
    materialCategoryID: number;
    materialID: number;
    analysisTypeID: number;
    sampleSourceCode: string;
    type: string;
    pageIndex: number;
}

export class GetContainerWiseMaterials {
    containerWiseMatID: number;
    matID: number;
    analysisTypeID: number;
    sampleSourceCode: string;
    statusID: number;
    status: string;
    effectiveFrom: string;
    effectiveTo: string;
}

export class GetGroupTest {
    catID: number;
    detailID: number;
    subCatID: number;
    aRDSSourceRefKey: number;
    aRDSSourceCode: string;
}

export class ContainerArdsBO {
    specID: number;
    ardsMode: string;
    type: string;
    testID: string;
    testName: string;
    specification: string;
    analysisType: string;
    list: Array<SingleIDBO> = [];
    encSioID: string;
    initTime: string;
    encArdsID: string
    reqType: string;
    entityCode: string;
    sectionCode: string;
    role: string;
    encEntityActID: string;
}

export class extraneousTests {
    testID: number;
    testTitle: string;
    templateID: number;
    template: string;
}

export class SendForReview {
    ardsExecID: number;
    entityCode: string;
    testInitTime: string;
    lst: Array<IncludeExcludeTestBO> = [];
}

export class ArdsReportBO {
    ardsExecID: number;
    entityCode: string;
    dmsReportID: number;
    refNumber: string;
    requestFrom: string;
}

export class ManageViewResetReportBO {
    dmsID: number;
    type: string;
    reportID: number;
    entityCode: string;
    ardsExecID: number;
    section: string;
    role: string;
}

export class GetArdsPrintDoc {
    encEntActID: string;
    specID: number;
    calibParamID: number;
    sourceCode: string;
    type: string;
}

export class AddArdsReview {
    ardsExecID: number;
    ardsSourceCode: string;
    tabID: number;
    commnet: number;
    initTime: string;
}

export class SkipPacks {
    list: Array<SingleIDBO>;
    initTime: string;
    encSioID: string;
}

export class SampleAnalysisLabDetails {
    chemicalConsumeComments: string;
    chemicalConsumeRefArID: number;
    chemicalConsumeRefArdsExecID: number;
    chemialConsumeTestTitle: string;
    chemicalConsumeRefArNumber: string;
}

export class CommonDataMapping {
    sourceInput: string;
    currentInput: string;
    value: string;
}

export class manageCommonDataMapping {
    sourceArdsExecID: number;
    ardsExecID: number;
    entityCode: string;
    initTime: string;
}

//#region 

export class ManageImpurityBasicInfoBO {
    impurityName: string;
    encImpurityID: string;
    ardsExecID: number;
}

export class ManageImpurityAssignSdmsBO {
    unknownImpurityID: number;
    impurityName: string;
    impurityType: string;
    ImpurityArea: string;
    impurityPArea: any;
    rtRatio: any;
}
export class ManageImpurityAssignSdmsBOList extends Array<ManageImpurityAssignSdmsBO>{ }
//#endregion

export class executeMultFormulaValue {
    samAnaTestID: number;
    ardsSourceCode: string;
    initTime: string;
    lst: any;
}

export class SwitchArds {
    ardsExecID: number;
    ardsMode: string;
    testInitTime: string;
    entityCode: string;
    sourceCode: string;
}

export class ConfirmImpMapping {
    mappingType: string;
    isConfirm: boolean;
    ardsExecID: number;
}

export class TableResultSets {
    resultSetID: number;
    title: string;
    resultSetType: string;
}

export class TableResultSetsList extends Array<TableResultSets>{ }

export class ManageSDMSDataBO {
    id: number;
}
export class ManageSDMSDataBOList extends Array<ManageSDMSDataBO>{ }

export class ManageSDMSDataDetailsBO {
    encSamAnaTestID: string;
    list: ManageSDMSDataBOList = new ManageSDMSDataBOList();
    type: string;
    entityCode: string;
    referenceNumber: string;
    remarks: string;
}