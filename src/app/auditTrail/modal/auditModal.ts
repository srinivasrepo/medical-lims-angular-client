export class ManageTables {
    tableID: number;
    list: Array<ManageAudObj>;
}

export class ManageAudObj {
    objName: string;
    objFriendlyName: string;
}

export class AuditTrailBO {
    entityID: number;
    refNumber: string;
    dateFrom: any;
    dateTo: any;
    actionID: number;
    actionByID: number;
    action: string;
    actionBy: string;
    pageIndex: number;
}