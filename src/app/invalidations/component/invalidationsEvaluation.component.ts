import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { InvalidationsService } from '../service/invalidations.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { invalidationsMessages } from '../messages/invalidationsMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import { MatDialog } from '@angular/material';
import { checklistComponent } from 'src/app/common/component/checklist.component';
import { ManageInvalidationBO } from '../model/invalidationsModel';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { ActionMessages, ButtonActions, EntityCodes } from 'src/app/common/services/utilities/constants';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';

@Component({
    selector: 'inv-evl',
    templateUrl: '../html/invalidationsEvaluation.html'
})

export class invalidationEvaluationComponent {

    @Input('encInvalidationID') encInvalidationID: string;
    reasons: string;
    actionsRecommended: string;
    btnType: string = ButtonActions.btnSave;
    disable: boolean = false;
    subscription: Subscription = new Subscription();
    appBO: AppBO = new AppBO();
    appLevel: number;
    @Output() updateData: EventEmitter<any> = new EventEmitter();
    btnUpload: string = ButtonActions.btnUpload;
    isLoaderStart : boolean;

    constructor(private invalidationsService: InvalidationsService, private alert: AlertService,
        private modal: MatDialog, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {
        this.subscription = this.invalidationsService.invalidationsSubject.subscribe(resp => {
            if (resp.purpose == "getInvalidationData") {
                this.reasons = resp.result.otherReasons;
                this.actionsRecommended = resp.result.actionsRecommended;
                this.appBO = resp.result.act;
                this.appLevel = resp.result.applevel;
                if (CommonMethods.hasValue(this.actionsRecommended))
                    this.enableHeaders(false);
            }
            else if (resp.purpose == "EVAL") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == 'SUCCESS') {
                    this.enableHeaders(false);
                    this.appBO = resp.result;
                    this.updateData.emit(this.appBO);
                    this.alert.success(invalidationsMessages.evalSuccess);
                }
                else
                    this.alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
        });
    }

    saveEvalutions() {
        if (this.btnType == ButtonActions.btnUpdate) {
            this.enableHeaders(true);
            return
        }
        var errMsg: string = this.validations();
        if (CommonMethods.hasValue(errMsg))
            return this.alert.warning(errMsg);
        var obj: ManageInvalidationBO = new ManageInvalidationBO();
        obj.encInvalidationID = this.encInvalidationID;
        obj.type = 'EVAL';
        obj.initTime = this.appBO.initTime;
        obj.otherReasons = this.reasons;
        obj.actionsRecommended = this.actionsRecommended;
        this.isLoaderStart = true;
        this.invalidationsService.manageInvalidationInfo(obj);
    }

    clear() {
        this.reasons = this.actionsRecommended = "";
    }

    saveChecklist() {
        const modal = this.modal.open(checklistComponent, { width: '80%' });
        modal.disableClose = true;
        modal.componentInstance.encEntityActID = this.encInvalidationID;
        modal.componentInstance.categoryCode = 'INVALID_CHECKLIST';
        modal.componentInstance.type = this.appLevel > 1 || this.disable ? 'VIEW' : 'MANAGE';
        modal.componentInstance.entityCode = EntityCodes.invalidations;
    }

    enableHeaders(val: boolean) {
        this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.btnUpload = val ? ButtonActions.btnUpload : ButtonActions.btnViewDocus;
        this.disable = !val;
    }

    uploadFiles() {
        const modal = this.modal.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.invalidations, 0, 'INVALID_EVAL', this.encInvalidationID, [], 'MEDICAL_LIMS', this.appBO.referenceNumber);
        modal.componentInstance.mode = this.btnType == ButtonActions.btnUpdate ? 'VIEW' : "MANAGE";
    }

    validations() {
        if (!CommonMethods.hasValue(this.actionsRecommended))
            return invalidationsMessages.actionsRecomm;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}