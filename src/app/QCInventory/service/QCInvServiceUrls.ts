export class QCInvtServiceUrls {
    public static getQCInventoryDetails = "GetQCInventoryDetails?encInvSourceID={0}";
    public static getQCInvPackDetails = "GetQCInvPackDetails?invID={0}";
    public static manageQCInvPackDetails = "ManageQCInvPackDetails";
    public static getBlocks = "GetBlocks?DeptCode={0}";
    public static manageQCBatchDetails = "ManageQCBatchDetails";
    public static manageQcInvt = 'ManageQCInventory';
    public static getMaterialDetailsByID = "GetMaterialDetailsByID?matID={0}";
    public static viewInvtDetailsByInvID = 'ViewInvtDetailsByInvID';
    public static searchQCInventory = "SearchQCInventory";
    public static getStatusList = "GetStatusList?entityCode={0}";
    public static getValidityPeriods = "GetValidityPeriods?entityCode={0}";
    public static getMiscConsumptionDetails = "GetMiscConsumptionDetails?packInvID={0}";
    public static manageMiscConsumptionData = "ManageMiscConsumptionData";
    public static openPack = "ManageOpenPack";
    public static manageDiscardCommnets = "ManageDiscardCommnets";
    public static getPackInvReserDetails = "GetPackInventoryReservationsDetails?encPackInvID={0}";
    public static getQCInventorySources = "GetQCInventorySources";
    public static generateNewBatchSplit = "GenerateNewBatchSplit";
    public static deleteNewBatchSplit = "DeleteNewBatchSplit?encInvID={0}";
    public static sendBatchForSample = "SendBatchForSample?invID={0}";
    public static getBlockByPlantID = "GetBlockByPlantID";
}