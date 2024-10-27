import { Component, Input, ViewChild } from '@angular/core';
import { OosService } from '../services/oos.service';
import { Subscription } from 'rxjs';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { ManageQASummaryInfo } from '../model/oosModel';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ButtonActions, LookupCodes, ActionMessages, EntityCodes } from 'src/app/common/services/utilities/constants';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { OosMessages } from '../messages/oosMessages';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { MatDialog } from '@angular/material';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';

@Component({
    selector: 'qa-sum',
    templateUrl: '../html/qaSummary.html'
})

export class QASummaryComponent {

    @Input() encOosTestID: string;
    @Input() pageType: string = 'MNG';
    notificationDate: string;
    isNotifyFromAPP: string;
    btnType: string = ButtonActions.btnSave;
    disableFields: boolean;
    hideLkp: boolean;
    @Input() hideReasonForDelay: boolean = true;
    btnUpload: string = ButtonActions.btnUpload;
    isLoaderStart : boolean;
    @Input() refNo: string ;

    customerInfo: LookupInfo;
    @ViewChild('customer', { static: false }) customer: LookupComponent;

    appBO: AppBO = new AppBO();
    manageObj: ManageQASummaryInfo = new ManageQASummaryInfo();

    subscription: Subscription = new Subscription();

    constructor(private _service: OosService, private _alert: AlertService,
        public _global: GlobalButtonIconsService, private _matDailog: MatDialog, ) { }

    ngAfterViewInit() {
        this.subscription = this._service.oosSubject.subscribe(resp => {
            if (resp.purpose == "getQASummaryInfo") {
                this.appBO = resp.result.recordActions;
                this.manageObj = resp.result;
                this.notificationDate = dateParserFormatter.FormatDate(resp.result.notificationDate, 'datetime');
                this.isNotifyFromAPP = resp.result.isNotifyFromAPP;
                this.manageObj.isQualityAgreement = this.isNotifyFromAPP ? 'Yes' : 'No';
                if (CommonMethods.hasValue(this.manageObj.customerName))
                    this.hideLkp = true;
                this.enableHeaders(true);
            }
            else if (resp.purpose == "manageQASummaryInfo") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == "SUCCESS") {
                    this._alert.success(OosMessages.qualityAssurence);
                    this.appBO = resp.result;
                    this._service.getQASummaryInfo(this.encOosTestID);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
        })
        this.prepareLkp();
        if(this.pageType == 'VIEW')
            this.btnUpload = ButtonActions.btnViewDocus;
        this._service.getQASummaryInfo(this.encOosTestID);
    }

    saveQASummary() {
        if (this.btnType == ButtonActions.btnUpdate)
            return this.enableHeaders(false);

        var errMsg = this.validation();
        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg);
        if (CommonMethods.hasValue(this.customer)) {
            this.manageObj.customerID = this.customer.selectedId;
            this.manageObj.customerName = this.customer.selectedText;
        }
        this.manageObj.initTime = this.appBO.initTime;
        this.manageObj.isOOSNotify = this.manageObj.isQualityAgreement;
        this.manageObj.encOOSTestID = this.encOosTestID;
        this.isLoaderStart = true;
        this._service.manageQASummaryInfo(this.manageObj);
    }

    enableHeaders(type: boolean) {
        this.btnType = this.btnType == ButtonActions.btnSave ? ButtonActions.btnUpdate : ButtonActions.btnSave;
        this.btnUpload = this.btnType == ButtonActions.btnSave ? ButtonActions.btnUpload : ButtonActions.btnViewDocus;
        this.disableFields = type;
        setTimeout(() => {
            if(CommonMethods.hasValue(this.customer))
                this.customer.disableBtn = type;
        }, 300);

    }

    prepareLkp() {
        this.customerInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Customer, LookupCodes.getPlantCustomers,
            LKPDisplayNames.customerCode, LKPDisplayNames.customer, LookUpDisplayField.header, LKPPlaceholders.customer);

    }

    validation() {
        if (this.manageObj.isQualityAgreement == 'Yes' && !CommonMethods.hasValue(this.manageObj.customerName) && !CommonMethods.hasValue(this.customer.selectedId))
            return OosMessages.customer;
        if (!CommonMethods.hasValue(this.manageObj.descNotification) && this.manageObj.isQualityAgreement == 'Yes')
            return OosMessages.descNotification
        if (!this.hideReasonForDelay && !CommonMethods.hasValue(this.manageObj.reasonForDelay))
            return OosMessages.reasonForDelay;
    }

    Uploadfiles() {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.oosModule, 0, 'QA_REVW', this.encOosTestID, [], 'MEDICAL_LIMS',this.refNo);

        modal.componentInstance.mode = this.btnType == ButtonActions.btnSave ? 'MANAGE' : 'VIEW';
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}