import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { ManageRS232IntegrationFieldsBO } from 'src/app/limsHelpers/entity/limsGrid';
import { LIMSHttpService } from '../../common/services/limsHttp.service';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { ServiceUrls } from '../../common/services/utilities/serviceurls';

@Injectable()

export class EnvironmentService {

    environmentSubject: Subject<any> = new Subject();

    constructor(private _limshttpService: LIMSHttpService) { }

    getModuleList(entityType: string) {
        this._limshttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getUserEntityList, [entityType]))
            .subscribe(resp => {
                this.environmentSubject.next({ "result": resp, "purpose": "moduleList" })
            })
    }

    manageRS232IntegrationOther(obj: ManageRS232IntegrationFieldsBO) {
        this._limshttpService.postDataToService(CommonMethods.formatString(ServiceUrls.manageRs232IntegrationOther, []), obj)
            .subscribe(resp => {
                this.environmentSubject.next({ "result": resp, "purpose": "manageRs232IntegrationOther" })
            })
    }

    getReportsInfoForSyncToDMS(entityType: string){
        this._limshttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getReportsInfoForSyncToDMS,[entityType])).subscribe(resp => {
            this.environmentSubject.next({"result": resp, "purpose" : "getReportsInfoForSyncToDMS"});
        });
    }
}