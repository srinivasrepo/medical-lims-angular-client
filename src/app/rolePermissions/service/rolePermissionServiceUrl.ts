export class RolePermissionServiceUrl {
    public static getAllEntityModules = "GetAllEntityModules?entityType={0}";
    public static getRolePermissionDetails = "GetRolePermissionDetails";
    public static manageTemplate = "ManageTemplate";
    public static getmanageApplevels = "GetManageAppLevel";
    public static insertApprovalTemplates = "InsertApprovalTemplates";
    public static getManageRolesDetails = "GetManageRolesDetails";
    public static deleteApprovalTemplateDetails = "DeleteApprovalTemplateDetails";
    public static createNewVersion = "CreateNewVersion";
    public static getConditionSByEntityModulesByID = "GetConditionSByEntityModulesByID?entityID={0}";
    public static getUsersByID = "GetUsersByID";
    public static manageApprovalUsers = "ManageApprovalUsers";
    public static manageApprovalRoles = "ManageApprovalRoles";
    public static discardTemplate = "DiscardTemplate?encTemplateID={0}";
    public static manageStatus = "ManageStatus";
    public static manageAction = "ManageActionProvision";
    public static getActionList = "GetAllActiveActions";

    // capability 
    public static getCapabilityDetailsByID = "GetSelectedDeptCapabilities?entityID={0}";
    public static manageCapability = "InsertApprovalPermission";
    public static getCapabilityRoles = "GetManageCapabilityRolesDetails?encPermissionID={0}&deptID={1}";
    public static deleteCapabilityPermission = "DeleteCapability?encPermissionID={0}";
    public static manageCapabilityRoles = "ManageCapabilityRoles";

    public static getPlantDeptsList = "GetPlantDeptsList";
    public static getRoles = "GetRoles?deptID={0}";
    public static getRolesByID = "GetRolesByID";
}