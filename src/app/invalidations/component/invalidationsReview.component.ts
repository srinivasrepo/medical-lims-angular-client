import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { InvalidationsService } from '../service/invalidations.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { invalidationsMessages } from '../messages/invalidationsMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import { RootCauseBo, ManageInvalidationBO } from '../model/invalidationsModel';
import { AppBO, CategoryItem, CategoryItemList, SingleIDBO } from 'src/app/common/services/utilities/commonModels';
import { ActionMessages, ButtonActions, EntityCodes } from 'src/app/common/services/utilities/constants';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'inv-review',
    templateUrl: '../html/invalidationsReview.html'
})

export class invalidationsReviewComponent {

    @Input('encInvalidationID') encInvalidationID: string;
    reAnalysisResult: string;
    ifNoActions: string;
    summary: string;
    subscription: Subscription = new Subscription();
    disable: boolean = false;
    btnType: string = ButtonActions.btnSave;
    catCode: string;
    rootCauseList: any;
    checkedRootCause: any = [];
    initRes: string;
    initSstRes: string;
    reSstRes: string;
    reAnalyRes: string;
    appBO: AppBO = new AppBO();
    appLevel: number;
    otherRootCause: string;
    qaRemarks: string;
    prevInvalidationID: number;
    btnUpload: string = ButtonActions.btnUpload;
    isLoaderStart : boolean;
    assignCatItemList: CategoryItemList = [];

    @Output() updateData: EventEmitter<any> = new EventEmitter();

    constructor(private invalidationService: InvalidationsService, private alert: AlertService, private modal: MatDialog, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {
        this.subscription = this.invalidationService.invalidationsSubject.subscribe(resp => {
            if (resp.purpose == "getInvalidationData") {
                this.otherRootCause = resp.result.otherRootCause;
                this.reAnalysisResult = resp.result.isReAnalysisValid;
                this.ifNoActions = resp.result.reviewActRecommended;
                this.summary = resp.result.implimantationSummary;
                this.initSstRes = resp.result.initSSTResult;
                this.initRes = resp.result.initAnaResult;
                this.reSstRes = resp.result.reSSTResult;
                this.reAnalyRes = resp.result.reAnaResult;
                this.appBO = resp.result.act;
                this.appLevel = resp.result.applevel;
                this.checkedRootCause = resp.result.rootCause;
                this.qaRemarks = resp.result.qaRemarks;
                this.prevInvalidationID = resp.result.prevInvalidationID;

                if (CommonMethods.hasValue(resp.result.impactTypeCode)) {
                    this.catCode = resp.result.impactTypeCode;
                    this.invalidationService.getCategoryItemsByCatCode(this.catCode);
                }
                if (CommonMethods.hasValue(this.summary))
                    this.enableHeaders(false);
            }
            else if (resp.purpose == this.catCode) {
                this.rootCauseList = resp.result;
                if (CommonMethods.hasValue(this.checkedRootCause) && this.checkedRootCause.length > 0) {
                    this.checkedRootCause.forEach(x => {
                        var obj: CategoryItem = new CategoryItem();
                        obj.catItem = x.rootCause;
                        obj.catItemCode = x.rootCauseCode;
                        obj.catItemID = x.rootCauseID;
                        obj.category = this.catCode;
                        this.assignCatItemList.push(obj);
                    })
                    this.rootCauseList = CommonMethods.prepareCategoryItemsList(this.rootCauseList, this.assignCatItemList);
                    this.checkedRootCause.forEach(ob => {
                        var data = this.rootCauseList.filter(o => o.catItemID == ob.rootCauseID)
                        data[0].isSelect = true;
                    });
                }
            }
            else if (resp.purpose == "REVIEW") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == 'SUCCESS') {
                    this.enableHeaders(false);
                    this.appBO = resp.result;
                    this.updateData.emit(this.appBO);
                    this.alert.success(invalidationsMessages.reviewSuccess);

                    if (!this.isOtherRootCause())
                        this.otherRootCause = '';
                }
                else
                    this.alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
        });

        this.changeBgColor('INIT');
    }

    saveReview() {
        if (this.btnType == ButtonActions.btnUpdate) {
            this.enableHeaders(true);
            return;
        }
        var errMsg: string = this.validations();
        if (CommonMethods.hasValue(errMsg))
            return this.alert.warning(errMsg);
        var obj: ManageInvalidationBO = new ManageInvalidationBO();
        obj.encInvalidationID = this.encInvalidationID;
        obj.type = 'REVIEW';
        obj.initTime = this.appBO.initTime;
        obj.isReAnalysisValid = this.reAnalysisResult;

        if (this.reAnalysisResult == 'NO')
            obj.reviewActRecommended = this.ifNoActions;

        obj.implimantationSummary = this.summary;

        if (this.catCode != 'INVALID_NON-QUALITY') {
            obj.initSSTResult = this.initSstRes;
            obj.initAnaResult = this.initRes;
            obj.reSSTResult = this.reSstRes;
            obj.reAnaResult = this.reAnalyRes;
        }

        obj.qaRemarks = this.qaRemarks;
        obj.otherRootCause = this.isOtherRootCause() ? this.otherRootCause : null;

        var lst = this.rootCauseList.filter(o => o.isSelect)
        lst.forEach(x => {
            var data: SingleIDBO = new SingleIDBO();
            data.id = x.catItemID;
            obj.list.push(data);
        })

        this.isLoaderStart = true;
        this.invalidationService.manageInvalidationInfo(obj);
    }

    isOtherRootCause() {

        if (!CommonMethods.hasValue(this.rootCauseList))
            return false;

        var obj = this.rootCauseList.filter(x => x.catItemCode == 'OTHER');
        if (obj.length > 0)
            return obj[0].isSelect;
    }

    clear() {
        if (!this.appBO.isFinalApp) {
            this.reAnalysisResult = this.ifNoActions = this.summary = this.initSstRes = this.initRes = this.reAnalyRes = this.reSstRes = this.otherRootCause = "";
            this.rootCauseList.forEach((item) => { item.isSelect = false });
        }
        else
            this.qaRemarks = "";
    }

    enableHeaders(val: boolean) {
        this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.btnUpload = val ? ButtonActions.btnUpload : ButtonActions.btnViewDocus;
        this.disable = !val;
    }

    validations() {
        if (!CommonMethods.hasValue(this.reAnalysisResult))
            return invalidationsMessages.reanalysis;
        var obj = this.rootCauseList.filter(o => o.isSelect)
        if (obj.length == 0)
            return invalidationsMessages.rootCause;

        else if (!CommonMethods.hasValue(this.otherRootCause) && this.isOtherRootCause())
            return invalidationsMessages.otherRootCause;
        else if (!CommonMethods.hasValue(this.summary))
            return invalidationsMessages.summary;
        else if (!CommonMethods.hasValue(this.initSstRes) && this.catCode != 'INVALID_NON-QUALITY')
            return invalidationsMessages.initSSTRes;
        else if (!CommonMethods.hasValue(this.initRes) && this.catCode != 'INVALID_NON-QUALITY')
            return invalidationsMessages.initRes;
        else if (!CommonMethods.hasValue(this.reSstRes) && this.catCode != 'INVALID_NON-QUALITY')
            return invalidationsMessages.reSSTRes;
        else if (!CommonMethods.hasValue(this.reAnalyRes) && this.catCode != 'INVALID_NON-QUALITY')
            return invalidationsMessages.reAnaRes;
        else if (this.catCode == 'INVALID_NON-QUALITY' && !CommonMethods.hasValue(this.qaRemarks) && this.appBO.isFinalApp)
            return invalidationsMessages.qaRemarks;
    }

    changeBgColor(type: string) {
        var docID = document.getElementById('bg_complaints');

        if (CommonMethods.hasValue(docID) && type == 'CLEAR')
            docID.className = '';
        else if (CommonMethods.hasValue(docID) && type != 'CLEAR')
            docID.className = 'small-tab';
    }

    uploadFiles() {
        const modal = this.modal.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.invalidations, 0, 'INVALID_REVIEW', this.encInvalidationID, [], 'MEDICAL_LIMS', this.appBO.referenceNumber);
        modal.componentInstance.mode = this.btnType == ButtonActions.btnUpdate ? 'VIEW' : "MANAGE";
    }

    ngOnDestroy() {
        this.changeBgColor('CLEAR');
        this.subscription.unsubscribe();
    }
}