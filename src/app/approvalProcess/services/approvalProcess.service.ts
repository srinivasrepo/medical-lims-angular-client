import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { ApprovalsBO } from "../models/Approval.model";
import { approvalProcessServiceUrl } from "./approvalProcessServiceUrl";
import { LIMSHttpService } from '../../common/services/limsHttp.service';
import { CommonMethods } from '../../common/services/utilities/commonmethods';

@Injectable()

export class ApprovalService {

    constructor(private _limsHttpService: LIMSHttpService) { }

    approvalSubject: Subject<any> = new Subject();

    getApprovalDetails(appBO: ApprovalsBO) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(approvalProcessServiceUrl.GetUserEntityApproveDetails,
            [appBO.detailID.toString(), appBO.encryptedKey]))
            .subscribe(resp => {
                this.approvalSubject.next({ "result": resp, "purpose": "approvalSubject" });
            })
    }

    confirmAction(appBO: ApprovalsBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(approvalProcessServiceUrl.confirmAction, []), appBO, null)
            .subscribe(resp => {
                this.approvalSubject.next({ "result": resp, "purpose": "confirmResult" });
            })
    }

}