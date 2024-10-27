export class SampleAnalysisServiceUrl {
    public static searchSampleAnalysis = "SearchSampleAnalysis";
    public static getAnalysisHeaderInfo = "GetAnalysisHeaderInfo?encSioID={0}";
    public static getAnalysisTypes = "GetAnalysisTypes";
    public static getBlocks = "GetBlocks?DeptCode={0}";
    public static getSupplierCOADetails = "GetSupplierCOADetails?encSioID={0}";
    public static manageSupplierCOADetails = "ManageSupplierCOADetails";

    public static getSpecifications = "GetAnalysisSpecifications?encEntityActID={0}&entityCode={1}";
    public static getAssignedDocsBySpecID = "GetAssignedDocsBySpecID";
    public static ardsGetAssignedDocs = "ARDSGetAssignedDocs?encEntActID={0}&sourceCode={1}";
    public static ardsManageRequest = "ARDSManageRequest";
    public static ardsDiscardPrintRequest = "ARDSDiscardPrintRequest";
    public static GetConvertableUOMBySioMatID = "GetConvertableUOMBySioMatID?materialID={0}&encSioID={1}";
    public static getTestByID = "GetTestByID";
    public static containerARDSSelectionPrint = "ContainerARDSSelectionPrint";


    //sampleing Information
    public static mangeSampleAnalysis = "MangeSampleAnalysis";
    public static getSamplingInfo = "GetSamplingInfo?encSioID={0}";
    public static getIssuedContainerDetails = "GetIssuedContainerDetails";
    public static manageSamplePacks = "ManageSamplePacks";


    // analysis

    public static getAnalysisTestBySioID = "GetAnalysisTestBySioID?encEntityActID={0}&entityCode={1}";
    public static saveAnalysis = "SaveAnalysis";
    public static getInstrumentsForTest = "GetInstrumentsForTest";
    public static getEQPUGetEqpTypeCode = "GetEQPUGetEqpTypeCode?eqpID={0}";
    public static getCumulativeCount = "GetCumulativeCount?columnID={0}";
    public static getTestInstruments = "GetTestInstruments";
    public static insertNUpdateInstruments = "InsertNUpdateInstruments";
    public static getInstrumnetDetailsByID = "GetInstrumnetDetailsByID"
    public static deleteInstrumnetDetailsByID = "DeleteInstrumnetDetailsByID"
    public static manageTestSampleRRTValues = "ManageTestSampleRRTValues";
    public static updateFinalRemarks = "UpdateFinalRemarks";
    public static manageIncludeExcludeTest = "ManageIncludeExcludeTest";
    public static switchARDSMode = "SwitchARDSMode";
    public static manageColumnInfo = "ManageColumnInfo";
    public static deleteColumnInfo = "DeleteColumnInfo";
    public static getRefEqpOthInfo= "GetRefEqpOthInfo?refEqpOccID={0}";
    public static getSDMSDataDetails = "GetSDMSDataDetails";
    public static invalidInstOccupancy = "InvalidInstOccupancy";
    //method results
    public static getSampleTestInfo = "GetSampleTestInfo";
    public static getResultStatus = "GetResultStatus";
    public static updateTestResults = "UpdateTestResults";

    //spec reset

    public static raiseDeviation = "RaiseDeviation";

    //RAW data
    public static getArdsInputsBySamAnaID = "GetARDSInputs?encSamAnaTestID={0}&sourceCode={1}";
    public static saveInputValues = "SaveInputValues";
    public static getFormulaDependentDetails = "GetFormulaDependentDetails";
    public static executeFormula = "ExecuteFormula";
    public static executeMultipleFormulas = "ExecuteMultipleFormulas";
    public static confirmEArds = "ConfirmEArds";
    public static addArdsReviewComment = "AddArdsReviewComment";
    public static skipInpurFieldFromExecution = "SkipInpurFieldFromExecution";
    public static manageMultipleFormulaValues = "ManageMultipleFormulaValues";
    //Additional tests

    public static getAdditionalTest = "GetAdditionalTest";
    public static manageAdditionalTest = "ManageAdditionalTest";
    public static deleteAdditionalTest = "DeleteAdditionalTest?addTestID={0}";


    public static getSDMSDataBySamAnaTestID = "GetSDMSDataBySamAnaTestID?encSamAnaTestID={0}";
    public static manageSDMSInputDetails = "ManageSDMSInputDetails";

    //sdms
    public static getMappingInfo = "GetMappingInfo";

    public static manageIsFinalFormula = "ManageIsFinalFormula";

    public static getMaterialDetailsByID = "GetMaterialDetailsByID?matID={0}";
    public static getAnalysisTypesByID = "GetAnalysisTypes?matCatID={0}";
    public static getSampleSources = "GetSampleSources";
    public static containerWiseMaterials = "ContainerWiseMaterials";
    public static getTestByCategory = "GetTestByCategory";

    //containerwise analysis
    public static getContainerWiseAnalysis = "GetContainerWiseAnalysis?encSioID={0}";
    public static saveContainerArdsDetails = "SaveContainerArdsDetails";
    public static skipPacksFromAnalysis = "SkipPacksFromAnalysis";

    //calibration report

    public static getCalibrationReportDetails = "GetCalibrationReportDetails";

    // send for review
    public static sendTestForReview = "SendTestForReview";

    public static getNewSampleRequests = "GetNewSampleRequests?encOOSTestID={0}";

    public static manageViewResetReport = "ManageViewResetReport";
    public static downloadReport = "fileDownload";
    public static getFileName = "GetFileName?ReportID={0}&Type={1}";
    public static updatePlaceholderValues = "UpdatePlaceholderValues";
    public static viewARDSMasterDocument = "ViewARDSMasterDocument?documentID={0}";
    public static viewARDSPrintDocument = "ViewARDSPrintDocument?dmsID={0}&plantOrgCode={1}";
    public static getPackTestsForSendToReview = "GetPackTestsForSendToReview?encSioID={0}&specCatID={1}";

    public static getSTPCommonDataforMapping = "GetSTPCommonDataforMapping?encEntActID={0}";
    public static manageSTPCommonData = "ManageSTPCommonData";


    //#region IMPURITY

    public static getUnknownImpurities = "GetUnknownImpurities?ardsExecID={0}";
    public static manageImpurityBasicInfo = "ManageImpurityBasicInfo";
    public static manageImpuritySDMSDetails = "ManageImpuritySDMSDetails";
    public static getDynamicFormulaInfo = "GetDynamicFormulaInfo";
    public static getDyncFormulaDependentData = "GetDyncFormulaDependentData";
    public static executeDynamicFormulaData = "ExecuteDynamicFormulaData";
    public static deleteImpurity = "DeleteImpurity?impurityID={0}";
    public static skipUnknownImpurities = "SkipUnknownImpurities";
    public static confirmImpMapping = "ConfirmImpMapping";
    public static getTableResultSetExecution = "GetTableResultSetExecution?ardsExecID={0}&resultSetID={1}";
    public static executeSystemFormulas = "ExecuteSystemFormulas";
    //#endregion

}