import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { analystService } from '../service/analyst.service';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, ActionMessages, EntityCodes, PageUrls, ButtonActions } from 'src/app/common/services/utilities/constants';
import { analystBO, qualificationBo } from '../model/analystModel';
import { analystMessages } from '../messages/analystMessages';
import { SingleIDBO, AppBO } from 'src/app/common/services/utilities/commonModels';
import { AlertService } from 'src/app/common/services/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { ApprovalComponent } from 'src/app/approvalProcess/component/approvalProcess.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'mng-analyst',
    templateUrl: '../html/manageAnalystQualification.html'
})

export class manageAnalystQualification {

    pageTitle: string = PageTitle.manageAnalyst;
    qualificationList: Array<qualificationBo>;
    btnType: string = ButtonActions.btnSave;
    // icnSave: string = ButtonIcons.icnSave;
    // icnClear: string = ButtonIcons.icnCancel;
    // icnConfirm: string = ButtonIcons.icnConfirm; 
    btnDisabledReq: boolean = false;
    reason: string;
    disable: boolean;
    encAnalystID: string;
    appBO: AppBO = new AppBO();
    status: string;
    refNo: string;
    backUrl: string = PageUrls.homeUrl;

    analystInfo: LookupInfo;
    @ViewChild('analyst', { static: true }) analyst: LookupComponent;

    subscription: Subscription = new Subscription();
    constructor(private _analystService: analystService, private alert: AlertService, private actRoute: ActivatedRoute,
        private _modalDialog: MatDialog, private _router: Router, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {
        this.actRoute.queryParams.subscribe(param => this.encAnalystID = param['id']);
        this.subscription = this._analystService.analystSubject.subscribe(resp => {
            if (resp.purpose == "getAnalystQualifications")
                this.qualificationList = resp.result;
            else if (resp.purpose == "manageAnalystQualification") {
                if (resp.result.returnFlag == 'SUCCESS') {
                    this.alert.success(analystMessages.savedAnallyst);
                    this.appBO = resp.result;
                    this.encAnalystID = resp.result.encTranKey;
                    this.enableHeaders(false);
                }
                else this.alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
                this.btnDisabledReq = false;
            }
            else if (resp.purpose == "getAnalystDetailsByID") {
                this.appBO = resp.result.act;
                this.analyst.setRow(resp.result.analyst.userRoleID, resp.result.analyst.userName);
                this.reason = resp.result.analyst.reason;
                this.status = resp.result.analyst.status;
                this.refNo = resp.result.analyst.analystNumber;
                resp.result.analystList.forEach(ob => {
                    var obj = this.qualificationList.filter(o => o.catItemID == ob.qualificationID)
                    if (obj.length > 0)
                        obj[0].isSelect = true;
                });
                this.enableHeaders(false);
            }
        });
        this._analystService.getAnalystQualifications();
        this.analystInfo = CommonMethods.PrepareLookupInfo(LKPTitles.analyst, LookupCodes.allUsers, LKPDisplayNames.actionBy, LKPDisplayNames.actionByCode, LookUpDisplayField.header, LKPPlaceholders.analyst, "MODULE_CODE = 'QC'", '', 'LIMS');
        if (CommonMethods.hasValue(this.encAnalystID))
            this._analystService.getAnalystDetailsByID(this.encAnalystID);
    }

    enableHeaders(val: boolean) {
        this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        // this.icnSave = val ? ButtonIcons.icnSave : ButtonIcons.icnUpdate;
        this.analyst.disableBtn = this.disable = !val;
    }

    changeIcons() {
        return this.btnType == ButtonActions.btnSave ? this._global.icnSave : this._global.icnUpdate;
    }

    save() {
        this.btnDisabledReq = true;
        if (this.btnType == ButtonActions.btnUpdate) {
            this.enableHeaders(true);
            return this.btnDisabledReq = false;
        }

        var obj: analystBO = new analystBO();

        obj.encAnalystID = this.encAnalystID;
        obj.userRoleID = this.analyst.selectedId;
        obj.reason = this.reason;
        var lst = this.qualificationList.filter(ob => ob.isSelect)
        lst.forEach(l => {
            var data: SingleIDBO = new SingleIDBO();
            data.id = l.catItemID;
            obj.list.push(data);
        })

        var err: string = this.validations(obj)
        if (CommonMethods.hasValue(err)) {
            this.btnDisabledReq = false;
            return this.alert.warning(err);
        }
        this._analystService.manageAnalystQualification(obj);
    }

    validations(obj: analystBO) {
        if (!CommonMethods.hasValue(obj.userRoleID))
            return analystMessages.analyst;
        if (obj.list.length == 0)
            return analystMessages.qualification;
        else if (!CommonMethods.hasValue(obj.reason))
            return analystMessages.reason;
    }

    clear() {
        this.analyst.clear();
        this.qualificationList.forEach(ob => ob.isSelect = false);
        this.reason = "";
    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encAnalystID;
        obj.code = 'ANALYST_QUALIFICATION';

        const modal = this._modalDialog.open(ApprovalComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.encAnalystID, EntityCodes.analystQualif);
        modal.componentInstance.transHis = obj;
        modal.afterClosed().subscribe((obj) => {
            if (obj == "OK")
                this._router.navigate([PageUrls.homeUrl]);
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}