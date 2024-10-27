import { Component, Input } from "@angular/core";
import { Subscription } from "rxjs";
import { ApprovalService } from "../services/approvalProcess.service";
import { ApprovalProcessMessages } from "../messages/approvalProcessMessages";
import { MatDialog, MatDialogRef } from '@angular/material';
import { TransHistoryBo } from '../models/Approval.model';
import { ConfirmationService } from '../../limsHelpers/component/confirmationService';
import { AlertService } from '../../common/services/alert.service';
import { ActionMessages, LimsRespMessages } from '../../common/services/utilities/constants';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'lims-approvals',
    templateUrl: '../html/approvalProcess.component.html'
})

export class ApprovalComponent {

    @Input('appbo') appbo: any;
    transHis: TransHistoryBo = new TransHistoryBo();

    actions: any;
    subscription: Subscription = new Subscription();
    // icnConfirm: string = ButtonIcons.icnConfirm;
    appclass: string = "modal-content blank-pop";
    doNotSelectAction: string;
    isLoaderStart: boolean = false;
    noteMsg : string = LimsRespMessages.confirmValid;
    constructor(public activeModal: MatDialog, private _appService: ApprovalService,
        private _toaster: AlertService, private _confirm: ConfirmationService,
        private _closeModal: MatDialogRef<ApprovalComponent>, public _global: GlobalButtonIconsService) { }

    ngOnInit() {
        this._closeModal.updateSize('80%');
    }

    ngAfterViewInit() {
        this.subscription = this._appService.approvalSubject.subscribe(resp => {
            if (resp.purpose == "approvalSubject") {
                if (resp.result.status == "OK")
                    this.actions = resp.result.actions;
                else
                    this._toaster.error(resp.result.status);
            }
            else if (resp.purpose == "confirmResult") {
                this.isLoaderStart = false;
                if (resp.result == "OK" || resp.result == "FINAL") {
                    this._toaster.success(ApprovalProcessMessages.actionConfirm);
                    this._closeModal.close(resp.result);
                }
                else
                    this._toaster.error(ActionMessages.GetMessageByCode(resp.result));
            }
        });
        this._appService.getApprovalDetails(this.appbo);
    }

    onConfirm() {
        var retVal = this.controlValidate();
        if (retVal != null && retVal != undefined) {
            this._toaster.warning(retVal);
            return;
        }

        this._confirm.confirm(ApprovalProcessMessages.confirmRequest).subscribe(result => {
            if (result) {
                this.isLoaderStart = true;
                this._appService.confirmAction(this.appbo);
            }
        });

    }

    controlValidate() {
        if (this.appbo.actionID < 1)
            return ApprovalProcessMessages.actionMandatory;
        if (CommonMethods.hasValue(this.doNotSelectAction) && this.doNotSelectAction == this.getActionCode())
            return ApprovalProcessMessages.noApproveAction;

        else if (this.getActionCode() != 'APP' && this.getActionCode() != 'CLS') {
            if (!CommonMethods.hasValue(this.appbo.comment))
                return ApprovalProcessMessages.commentMandatory;
            else if (this.appbo.comment.trim().length < 50)
                return ApprovalProcessMessages.miniFiveChara;
        }
    }

    cancel() {
        this._closeModal.close("close");
    }

    getActionCode() {
        return this.actions.filter(objData => objData.actionID == this.appbo.actionID).map(function (obj) { return obj.actionCode; })
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}






