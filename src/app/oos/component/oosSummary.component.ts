import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { OosService } from '../services/oos.service';
import { ManageOOSSummaryInfo } from '../model/oosModel';
import { ButtonActions, ActionMessages, EntityCodes } from 'src/app/common/services/utilities/constants';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { CommonMessages } from 'src/app/common/messages/commonMessages';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { OosMessages } from '../messages/oosMessages';
import { AppBO, CategoryItem, CategoryItemList } from 'src/app/common/services/utilities/commonModels';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { MatDialog } from '@angular/material';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';

@Component({
    selector: 'oos-summary',
    templateUrl: '../html/oosSummary.html'
})

export class OosSummaryComponent {

    subscription: Subscription = new Subscription();
    @Input() encOosTestID: string;
    @Input() pageType: string = 'MNG';
    @Input() appBo: AppBO = new AppBO();
    summaryBO: ManageOOSSummaryInfo = new ManageOOSSummaryInfo();
    btnType: string = ButtonActions.btnSave;
    btnUpload: string = ButtonActions.btnUpload;
    rootCauseList: any;
    devList: any;
    disRefDev: boolean = false;
    disOthRoot: boolean = false;
    capaPageType: string;
    phaseCompleted: boolean;
    isLoaderStartObj = { isLoaderGenDev: false, isLoaderOosSum: false };
    assignedCatList: CategoryItemList = [];

    constructor(private _service: OosService, public _global: GlobalButtonIconsService, private _alert: AlertService, private _confirm: ConfirmationService, private _matDailog: MatDialog) { }

    ngAfterContentInit() {
        this.subscription = this._service.oosSubject.subscribe(resp => {
            if (resp.purpose == "OOS_ROOT_CAUSE")
                this.rootCauseList = resp.result;
            else if (resp.purpose == 'getOOSSummaryInfo') {
                this.summaryBO = resp.result;
                this.devList = resp.result.devReqList;
                if (CommonMethods.hasValue(this.summaryBO.rootCauseOOS)) {
                    var obj: CategoryItem = new CategoryItem();
                    obj.catItem = this.summaryBO.rootCauseDesc;
                    obj.catItemCode = this.summaryBO.rootCauseCode;
                    obj.catItemID = this.summaryBO.rootCauseOOS;
                    obj.category = 'OOS_ROOT_CAUSE';
                    this.assignedCatList.push(obj);
                    this.rootCauseList = CommonMethods.prepareCategoryItemsList(this.rootCauseList, this.assignedCatList);
                }
                this.getRootCode('No');
                if (this.summaryBO.catCode != 'INTER_MAT' && this.summaryBO.catCode != 'FIN_MAT') {
                    this.summaryBO.refDevInvestigation = 'No'
                    this.disRefDev = true;
                }
                this.enableHeaders(!CommonMethods.hasValue(this.summaryBO.mfgInvstDone))
            }
            else if (resp.purpose == "manageOOSSummaryInfo") {
                this.isLoaderStartObj.isLoaderOosSum = false;
                if (resp.result.returnFlag == 'SUCCESS') {
                    this.appBo = resp.result;
                    this.enableHeaders(false);
                    this._alert.success(OosMessages.successQCSumm);
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == 'generateDeviationReq') {
                this.isLoaderStartObj.isLoaderGenDev = false;
                if (resp.result.retval == 'OK') {
                    this.summaryBO.devID = resp.result.deV_ID;
                    this.devList = resp.result.devReqList;
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.retval))
            }

        })
        if (this.appBo.appLevel > 4)
            this.phaseCompleted = true;
        this._service.getCategoryItemsByCatCode('OOS_ROOT_CAUSE');
        this._service.getOOSSummaryInfo(this.encOosTestID);
        this.capaPageType = this.pageType;
    }


    isJustificationClear(type) {
        if (type == 'CHK')
            this.summaryBO.checkListJustification = null;
        else if (type == 'ANA')
            this.summaryBO.reAnaJustification = null;
        else if (type == 'CNF')
            this.summaryBO.confirmAnaJustification = null;
        else if (type == 'OOS')
            this.summaryBO.oosInvestJustification = null;

    }

    getRootCode(type: string = 'Clear') {
        if (CommonMethods.hasValue(this.summaryBO.rootCauseOOS)) {
            var obj = this.rootCauseList.filter(x => x.catItemID == this.summaryBO.rootCauseOOS)
            if (obj[0].catItemCode == 'OTH')
                this.disOthRoot = false;
            else
                this.disOthRoot = true;
            if (type == 'Clear')
                this.summaryBO.otherCause = null
        }
        else this.disOthRoot = true;

    }

    enableHeaders(val: boolean) {
        this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.btnUpload = val && this.pageType == 'MNG' ? ButtonActions.btnUpload : ButtonActions.btnViewDocus;
        this.capaPageType = val && this.pageType == 'MNG' ? 'MNG' : 'VIEW';
    }

    save() {
        if (this.btnType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);
        var err: string = this.validation()
        if (CommonMethods.hasValue(err))
            return this._alert.warning(err);
        this.summaryBO.encOOSTestID = this.encOosTestID;
        this.summaryBO.initTime = this.appBo.initTime;
        this.isLoaderStartObj.isLoaderOosSum = true;
        this._service.manageOOSSummaryInfo(this.summaryBO);
    }

    validation() {
        if (!CommonMethods.hasValue(this.summaryBO.mfgInvstDone))
            return OosMessages.manuInvst;
        if (!CommonMethods.hasValue(this.summaryBO.rootCauseMfgInvestigation))
            return OosMessages.rootCauseManuInvst;
        if (!CommonMethods.hasValue(this.summaryBO.mfgChkAttached))
            return OosMessages.manInvstAtt;
        if (!CommonMethods.hasValue(this.summaryBO.refDevInvestigation))
            return OosMessages.slctDevInvst;
        if (this.summaryBO.refDevInvestigation == 'Yes' && !CommonMethods.hasValue(this.summaryBO.devID))
            return OosMessages.slctDevNum;
        if (!CommonMethods.hasValue(this.summaryBO.checkListObservation) || !CommonMethods.hasValue(this.summaryBO.reAnaObservation) || !CommonMethods.hasValue(this.summaryBO.confirmAnaObservation))
            return OosMessages.observation;
        if ((this.summaryBO.checkListObservation == 'No' && !CommonMethods.hasValue(this.summaryBO.checkListJustification)) || (this.summaryBO.reAnaObservation == 'No' && !CommonMethods.hasValue(this.summaryBO.refDevInvestigation)) || (this.summaryBO.confirmAnaObservation) == 'No' && !CommonMethods.hasValue(this.summaryBO.confirmAnaJustification) || (this.summaryBO.oosInvestObservation) == 'No' && !CommonMethods.hasValue(this.summaryBO.oosInvestJustification))
            return OosMessages.sumJustification;
        if (this.summaryBO.showJustificationDelay && !CommonMethods.hasValue(this.summaryBO.justificationForDelay))
            return OosMessages.justForDelay;

    }

    Uploadfiles() {

        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.oosModule, 0, 'QC_REVW', this.encOosTestID, [], 'MEDICAL_LIMS',this.appBo.referenceNumber);
        modal.componentInstance.mode = this.btnType == ButtonActions.btnUpdate ? 'VIEW' : 'MANAGE';

    }

    generateDev() {
        this._confirm.confirm(OosMessages.confirmDev).subscribe(re => {
            if (re) {
                this.isLoaderStartObj.isLoaderGenDev = true;
                this._service.generateDeviationReq(this.encOosTestID);
            }
        })
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}