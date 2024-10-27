import { environment } from '../../../environments/environment';

export class ManageMaster {
    categoryID: number;
    catItemCode: string;
    catItem: string;
    pageIndex: string;
    pageSize: number = environment.recordsPerPage;
    entityType: string;
    entityID: number;
    value: number;
    catItemID: number;
    categoryCode: string;
}

export class SysConfigBO{
    configID : number;
    configKey : string;
    configValue : number;
    description : string;
    isVisible : boolean;
}

export class UpdateSysConfiguration{
    encConfigID : string;
    configValue: string;
}



