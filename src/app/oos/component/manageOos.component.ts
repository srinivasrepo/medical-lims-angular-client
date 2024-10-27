import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { OosService } from '../services/oos.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { ButtonActions, ActionMessages, PageUrls, EntityCodes } from 'src/app/common/services/utilities/constants';
import { OosMessages } from '../messages/oosMessages';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { MatDialog } from '@angular/material';
import { ApprovalComponent } from 'src/app/approvalProcess/component/approvalProcess.component';

@Component({
    selector: 'oos-mng',
    templateUrl: '../html/manageOos.html'
})

export class manageOosComponent {

    subscription: Subscription = new Subscription();

    pageTitle: string = PageTitle.manageOos;
    encOosTestID: string;
    encOosTestDetailID: string;

    appBo: AppBO = new AppBO();
    status: string;
    conditionCode: string;
    oosPageType: string = 'MNG';
    reviewPageType: string = 'VIEW';
    backUrl: string = PageUrls.homeUrl;
    reqCode: string;
    viewHistory: any;
    viewHistoryVisible : boolean;
    hideReasonForDelay: boolean = true;
    entityCode : string = EntityCodes.oosModule;

    encArdsExecID: string = "";

    constructor(private _service: OosService, private _alert: AlertService, public _global: GlobalButtonIconsService, private _actRoute: ActivatedRoute, private _matDailog: MatDialog,
        private _router: Router) {
        this.conditionCode = localStorage.getItem('conditionCode');
        if (this.conditionCode == 'OOS_APP') {
            this.oosPageType = 'MNG';
            this.reviewPageType = 'VIEW';
            if (CommonMethods.hasValue(localStorage.getItem("viewOos"))) {
                this.oosPageType = 'VIEW';
                this.pageTitle = PageTitle.viewOos;
                this.backUrl = PageUrls.searchOOS;
            }
        }
        else {
            this.oosPageType = 'VIEW';
            this.reviewPageType = 'MNG';
        }
    }

    ngAfterContentInit() {
        this._actRoute.queryParams.subscribe(param => { this.encOosTestID = param['id'] });
        this.subscription = this._service.oosSubject.subscribe(resp => {
            if (resp.purpose == "getTestInfo") {
                this.appBo = resp.result.act;
                this.status = resp.result.status;
                this.encOosTestID = resp.result.encOosTestID;
                this.reqCode = resp.result.oosNumber;

                this.showHistory();
                if (resp.result.showQAJustificationDelay)
                    this.hideReasonForDelay = false;
            }
            else if (resp.purpose == 'updateOOSSummary') {
                if (resp.result.returnFlag == 'SUCCESS') {
                    this.appBo.initTime = resp.result.initTime;
                }
            }
        })
        this.changeBgColor('INIT');
        // var obj: any = { encOOSTestID: this.conditionCode == 'OOS_APP' ? this.encOosTestID : null, encOOSTestDetailID: this.conditionCode == 'OOS_APP' ? null : this.encOosTestID, conditionCode: this.conditionCode }
        this.encOosTestDetailID = this.conditionCode == 'OOS_APP' ? null : this.encOosTestID;
        // this._service.getTestInfo(obj);
    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.appBo.encTranKey;
        obj.code = this.conditionCode;

        const modal = this._matDailog.open(ApprovalComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBo.detailID, this.appBo.encTranKey,this.entityCode,this.appBo.appLevel,this.appBo.initTime);
        modal.componentInstance.transHis = obj;
        modal.afterClosed().subscribe((obj) => {
            if (obj == "OK")
                this._router.navigate(['/lims/home']);
        });
    }

    changeBgColor(type: string) {
        var docID = document.getElementById('bg_complaints');

        if (CommonMethods.hasValue(docID) && type == 'CLEAR')
            docID.className = '';
        else if (CommonMethods.hasValue(docID) && type != 'CLEAR')
            docID.className = 'blue-light';
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encOosTestID;
        obj.code = 'OOS_APP';
        this.viewHistory = obj;
    }

    showHistory(){
        if (CommonMethods.hasValue(this.encOosTestID)) {
            this.viewHistoryVisible = true;
            this.tranHistory();
        }
        else
            this.viewHistoryVisible = false;
    }

    getArdsExec(evt) {
        this.encArdsExecID = evt;
    }

    ngOnDestroy() {
        this.changeBgColor('CLEAR');
        localStorage.removeItem('viewOos');
        this.subscription.unsubscribe();
    }

}