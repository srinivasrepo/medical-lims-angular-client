import { Component } from '@angular/core'
import { MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { CommonService } from '../services/commonServices';
import { CommonMethods } from '../services/utilities/commonmethods';
import { AlertService } from '../services/alert.service';
import { ManageChecklist } from '../services/utilities/commonModels';
import { ActionMessages, ButtonActions } from '../services/utilities/constants';
import { CommonMessages } from '../messages/commonMessages';
import { GlobalButtonIconsService } from '../services/globalButtonIcons.service';

@Component({
    selector: 'inv-chk',
    templateUrl: '../html/checklist.html'
})

export class checklistComponent {

    encEntityActID: string;
    categoryCode: string;
    pageTitle: string = "Manage Checklist"
    subscription: Subscription = new Subscription();
    displayedColumns: Array<string> = ["S.No.", "Check Point", "Yes", "No", "Not Applicable"]
    dataSource: any;
    isDisabled: boolean = false;
    type: string = 'MANAGE';
    btnType: string = ButtonActions.btnSave;
    remarksMandatory: boolean = false;
    overAllRemarksMandatory: boolean = false;
    entityCode: string;
    remarks: string;
    isLoaderStart : boolean;
    disableBtn : boolean;
    remarksValidationReq: boolean = true;

    constructor(private closeModal: MatDialogRef<checklistComponent>, private service: CommonService,
        private alert: AlertService, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {
        this.subscription = this.service.commonSubject.subscribe(resp => {
            if (resp.purpose == "getChecklistItemsByCategory") {
                this.dataSource = resp.result;
                this.enableHeaders();
            }
            else if (resp.purpose == "mangeChecklistAnswers") {
                this.isLoaderStart = this.disableBtn =false;
                if (resp.result == 'SUCCESS') {
                    this.alert.success(CommonMessages.successCheck);
                    this.enableHeaders();
                }
                else
                    this.alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
        })

        this.service.getChecklistItemsByCategory(this.encEntityActID, this.categoryCode, this.entityCode);

        if (this.type == "VIEW")
            this.displayedColumns = ["S.No.", "Check Point", "Answer"]
        if (this.remarksMandatory)
            this.displayedColumns.push('Remarks')
    }

    close() {
        if (!this.overAllRemarksMandatory)
            this.closeModal.close();
        else this.closeModal.close(this.remarks);
    }

    enableHeaders() {
        var data = this.dataSource.filter(ob => CommonMethods.hasValue(ob.answer))
        this.btnType = data.length == 0 ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.isDisabled = data.length > 0;
    }

    saveChecklist() {
        if (this.btnType == ButtonActions.btnUpdate) {
            this.btnType = ButtonActions.btnSave;
            this.isDisabled = false;
            return;
        }

        var errMsg: string = this.validations();
        if (CommonMethods.hasValue(errMsg))
            return this.alert.warning(errMsg);


        var obj: ManageChecklist = new ManageChecklist();
        obj.list = this.dataSource;
        obj.encEntityActID = this.encEntityActID;
        obj.entitySourceCode = this.categoryCode;
        obj.entityCode = this.entityCode;
        obj.remarks = this.remarks;
        this.isLoaderStart = this.disableBtn = true;
        this.service.mangeChecklistAnswers(obj);

    }

    validations() {
        var data = this.dataSource.filter(ob => CommonMethods.hasValue(ob.answer))
        if (data.length == 0)
            return CommonMessages.checklist;
        else if (this.remarksMandatory && this.remarksValidationReq) {
            data = this.dataSource.filter(ob => CommonMethods.hasValue(ob.answer) && !CommonMethods.hasValue(ob.remarks));
            if (data.length > 0)
                return CommonMessages.remarks;
            data = this.dataSource.filter(ob => !CommonMethods.hasValue(ob.answer) && CommonMethods.hasValue(ob.remarks));
            if (data.length > 0)
                return CommonMessages.chk;
        }
        if (this.overAllRemarksMandatory && !CommonMethods.hasValue(this.remarks))
            return CommonMessages.overRemarks;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}