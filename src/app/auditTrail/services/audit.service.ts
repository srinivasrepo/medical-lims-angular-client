import { Injectable } from "@angular/core";
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { Subject } from 'rxjs';
import { AuditServiceUrl } from './auditServiceUrl';
import { environment } from '../../../environments/environment';
import { ManageTables, AuditTrailBO } from '../modal/auditMOdal';
import { LIMSHttpService } from '../../common/services/limsHttp.service';
import { RolePermissionServiceUrl } from '../../rolePermissions/service/rolePermissionServiceUrl';

@Injectable()

export class AuditService {

    auditSubject: Subject<any> = new Subject();

    constructor(private _limsHttpService: LIMSHttpService) { }

    getEntityModules(entityType: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(RolePermissionServiceUrl.getAllEntityModules, [entityType]))
            .subscribe(resp => {
                this.auditSubject.next({ "result": resp, "purpose": "getEntityModules" })
            })
    }

    getAuditTrailLogDetails(obj: AuditTrailBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(AuditServiceUrl.getAuditTrailLogDetails, []), obj)
            .subscribe(resp => {
                this.auditSubject.next({ "result": resp, "purpose": "getAuditTrailLogDetails" })
            })
    }

    viewAuditTableData(encauditID: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(AuditServiceUrl.viewAuditTableData, [encauditID])).subscribe(resp => {
            this.auditSubject.next({ "result": resp, "purpose": "viewAuditTableData" })
        })
    }

    getAuditColumnsByTableID(encTableID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(AuditServiceUrl.getAuditColumnsByTableID, [encTableID])).subscribe(resp => {
            this.auditSubject.next({ "result": resp, "purpose": "getAuditColumnsByTableID" })
        })
    }

    getAllTables(id?: any) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(AuditServiceUrl.getAllTables, [id])).subscribe(resp => {
            this.auditSubject.next({ "result": resp, "purpose": "getAllTables" })
        })
    }

    manageDBObjects(obj: ManageTables) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(AuditServiceUrl.manageDBObjects, []), obj).subscribe(resp => {
            this.auditSubject.next({ "result": resp, "purpose": "manageDBObjects" })
        })
    }


}