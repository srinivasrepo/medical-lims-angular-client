export class AuditServiceUrl {
    public static getAuditTrailLogDetails = "GetAuditTrailLogDetails";
    public static viewAuditTableData = "GetAuditTableByAuditID?encAuditID={0}";
    public static getAuditColumnsByTableID = "GetAuditColumnsByTableID?encTableID={0}";

    public static getAllTables = "GetAllTables?tabID={0}";
    public static manageDBObjects = "ManageDBObjects";
}