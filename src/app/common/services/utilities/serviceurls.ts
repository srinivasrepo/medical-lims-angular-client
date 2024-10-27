export class ServiceUrls {

    // Common
    public static getCatItems = "getCatItemByCategoryCode?categoryCode={0}";
    public static getTopicsByHeaderID = "GetTopicsByHeaderID?headerID={0}"
    public static GetCatItemsByCatCode = "GetCatItemsByCatCode?catCode={0}&type={1}";
    public static getPendingActivities = "GetPendingActivities";
    public static addCommentForCompletedTask = "AddCommentForCompletedTask";
    public static getCatItemsByCatCodeList = "GetCatItemsByCatCodeList";
    public static getAllSamplePlanAssignedAnalysts = "GetAllSamplePlanAssignedAnalysts";
    public static getAllMaterialCategories = "GetAllMaterialCategories";

    public static manageRS232RequestMode = "ManageRS232RequestMode";
    public static getReportsInfoForSyncToDMS = "GetReportsInfoForSyncToDMS?entityType={0}";
    public static manageRS232OtherFieldsValues = "ManageRS232OtherFieldsValues";

    //Login 
    public static validateLogin = 'ValidateLogin';
    public static auditUnderProcessRecords = "AuditUnderProcessRecords";
    public static validateMedicalLimsToken = 'validateMedicalLimsToken';
    public static getEventCalendarData = "GetEventCalendarData";
    public static switchPlant = "SwitchPlant";

    // UploadDocuments
    public static uploadDocument = "UploadFiles?entCode={0}&entActID={1}&section={2}&docType={3}&dmsID={4}&referenceNumber={5}&role={6}&documentTrackID={7}&docName={8}";
    public static ardsSelectionPrint = "ARDSSelectionPrint";
    public static getDouments = "GetUploadDocs";
    public static deleteDocument = "DeleteDocument";
    public static mergeUploadFiles = "MergeUploadFiles";
    public static generateCumulativeArdsReport = "GenerateCumulativeArdsReport?encEntActID={0}&entityCode={1}";
    public static invalidUploadFile = "InvalidUploadFile";

    public static getUploadProgress = "GetUploadProgress";
    // viewHistory
    public static viewHistory = 'ViewHistory?encEntActID={0}&conditionCode={1}';

    public static getToDoListByCondition = "GetToDoListByCondition?conditionID={0}";
    public static getToDoListCounts = "GetUserToDoListCount?entityType={0}";
    public static getUserEntityList = "GetMenuList?entityType={0}";

    public static getRS232IntegrationOther = "GetRs232IntegrationOther";
    public static manageRs232IntegrationOther = "ManageRs232IntegrationOther";



    public static changeStatus = "ChangeStatus?entityActID={0}&entityCode={1}";
    public static getStatusList = "GetStatusList?entityCode={0}";

    // manage occupancy
    public static manageOccupancy = "ManageOccupancy";
    public static getOccupancyDetails = "GetOccupancyDetails";

    //checklist
    public static getChecklistItemsByCategory = "GetChecklistItemsByCategory?encEntActID={0}&categoryCode={1}&entityCode={2}";
    public static mangeChecklistAnswers = "MangeChecklistAnswers";

    public static getParamMasterData = "GetParamMasterData";
    public static addNewMaterial = "AddMaterial";

    public static getCurrentDateTime = "GetCurrentDateTime";

    //uom converions
    public static getUomsToConvert = "GetUomsToConvert?materialID={0}";
    public static getMaterialUomDetails = "GetMaterialUomDetails?materialID={0}";
    public static addMaterialConvertData = "AddMaterialConvertData";
    public static changeUomConvertionStatus = "ChangeUomConvertionStatus?convertedUomID={0}";

    //deviation
    public static getDeviationDescription = "GetDeviationDescription?entityCode={0}&dcActionCode={1}";

    //get SDMS Details
    public static getSDMSDetails = "GetSDMSDetails";

    //export data
    public static getExportColumns = "GetExportColumns?entityCode={0}";
    public static exportData = "ExportData";

    //capa
    public static CAPAGetCAPAActionsBySourceRefType = "CAPAGetCAPAActionsBySourceRefType";
    public static CAPAInsertUpdateCAPA = "CAPAInsertUpdateCAPA";
}
