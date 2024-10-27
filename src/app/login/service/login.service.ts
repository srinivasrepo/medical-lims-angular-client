import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { LoginUser, CommonLogin } from '../model/login';
import { LIMSHttpService } from '../../common/services/limsHttp.service';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { ServiceUrls } from '../../common/services/utilities/serviceurls';
import { RolePermissionServiceUrl } from 'src/app/rolePermissions/service/rolePermissionServiceUrl';
import { SwitchPlant } from '../model/switchPlant';

@Injectable()

export class LoginService {

    loginSubject: Subject<any> = new Subject();

    constructor(private _limsHttpService: LIMSHttpService) { }

    validateLogin(obj: LoginUser) {
        this._limsHttpService
            .postDataToService(CommonMethods.formatString(ServiceUrls.validateLogin, []), obj)
            .subscribe(resp => {
                this.loginSubject.next({ "result": resp, "purpose": "loginDetails" });
            })
    }

    auditUnderProcessRecords() {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.auditUnderProcessRecords, []))
            .subscribe(resp => {
                this.loginSubject.next({ "result": resp, "purpose": "auditUnderProcessRecords" });
            })
    }

    CommonLogin(obj: CommonLogin) {
        this._limsHttpService
            .postDataToService(CommonMethods.formatString(ServiceUrls.validateMedicalLimsToken, []), obj)
            .subscribe(resp => {
                this.loginSubject.next({ "result": resp, "purpose": "tokenValidate" });
            })
    }

    getEventCalendarData() {
        this._limsHttpService
            .getDataFromService(CommonMethods.formatString(ServiceUrls.getEventCalendarData, []))
            .subscribe(resp => {
                this.loginSubject.next({ "result": resp, "purpose": "getEventCalendarData" });
            })
    }

    getPlantDeptList() {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(RolePermissionServiceUrl.getPlantDeptsList, []))
            .subscribe(resp => {
                this.loginSubject.next({ "result": resp, "purpose": "getPlantDeptsList" })
            })
    }

    switchPlant(obj: SwitchPlant) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.switchPlant, []), obj).subscribe(resp => {
            this.loginSubject.next({ "result": resp, "purpose": "switchPlant" })
        })
    }

}
