export class LimsHelperUrl {
    public static getLookupData = 'GetLookupData?lookupCode={0}&condition={1}&searchText={2}&purpose={3}&extColumnName={4}&decrypt={5}';
    public static getStages = "GetProductStagesByProductID?productID={0}";
    public static getMaterialCategories = "GetMaterialCategories";
    public static getMaterialSubCategories = "getMaterialSubCategories?catCode={0}";
    public static getMaterialDetailsByMatID = "GetMaterialDetailsByMatID?matID={0}";
    public static manageSolventQuantityPreparation = "ManageSolventQuantityPreparation";
    public static getUomDetailsByMaterialID = "GetUomDetailsByMaterialID?materialID={0}";
    public static fileDownload = "fileDownload";
    public static viewFile = "ViewFile";

    public static getPreparationDetails = "GetSolPreparationDetails";
    public static getMaterialUomList = "GetMaterialUomList?materialID={0}";
    public static getMaterialUOMConvertions = "GetMaterialUOMConvertions?baseUOM={0}"
    public static getUOMConvertionDenomination = "GetUOMConvertionDenomination";

    public static getChemicalBatchDetailsByPackInvID = "GetChemicalBatchDetailsByPackInvID?packInvID={0} &refPackID={1}";
    public static discardPreparationBatch = "DiscardPreparationBatch";

    public static manageRs232Integration = "ManageRs232Integration";
    public static getRs232Integration = "GetRs232Integration";
    public static getSpecHeaderInfo = "GetSpecHeaderInfo?encSpecID={0}&encCalibID={1}";
    public static eQPUpdateToDateTime = "EQPUpdateToDateTime?encOccupancyID={0}";

    public static resetRs232EqpOtherOcc = "ResetRs232EqpOtherOcc?encRS232IntegrationID={0}";
}