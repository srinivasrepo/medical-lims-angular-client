export class RolePermissionDetails {
    module: string;
    version: string;
    createdOn: any;
    status: string;
    templateID: number;
}

export class Condition {
    conditionID: number;
    encTemplateIDU: string;
}

export class ManageAppLevel {
    appLevel: any;
    statusID: number;
    appType: string;
    actions: Array<any> = [];
    encTemplateIDU: string;
    respectiveDept: boolean;
    respectivePlant: boolean;
    componentID: number;
    operationType: string;
}

export class ManageTemplateRoles {
    roleList: Array<any> = [];
    type: string;
    encDetailID: string;
}

export class ManageCapability {
    entityID: number;
    selectedCapaList: Array<SelectedCapa> = [];
}

export class SelectedCapa {
    deptID: number;
    capID: number;
}

export class RoleClone {
    roleID: number;
    list: Array<RoleCloneList> = [];
}

export class RoleCloneList {
    id: number;
    capability: string;
}

export class DialogData {
    encDetailID: string;
    type: string;
    deptID: number;
}

export class GetUsersByID {
    plantID: number;
    deptID: number;
    roleID: number;
    encDetailID: string;
    encEntityActID: string;
}

export class ManageApprovalUsers {
    usrList: Array<any> = [];
    encDetailID: string;
    deptID: number;
    roleID: number;
    plantID: number;
    encEntityActID: string;
    type: string;
    roleList: Array<any> = [];
}

export class ApprovalData {
    encDetailID: string;
    type: string;
    deptID: number;
}

export class GetApprovalUsers {
    encEntityActID: string;
    encDetailID: string;
}

export class GetApprovalTemplateDetails {
    encEntityActID: string;
    encTemplateID: string;
}

export class SearchRPDetails {
    conditionID: number;
    statusID: number;
    entityID: number;
    entityType: string;
    pageIndex: string;
}

export class ManageStatusBo{
    statusCode : string;
    status : string;
}

export class ManageActionBO{
    actionCode: string = "";
    action: string;
}