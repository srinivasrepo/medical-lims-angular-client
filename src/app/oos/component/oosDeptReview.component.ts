import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { OosService } from '../services/oos.service';
import { oosOptionHandler } from '../model/oosOptionHandler';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ButtonActions, ActionMessages } from 'src/app/common/services/utilities/constants';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { OosMessages } from '../messages/oosMessages';
import { manageDeptReview } from '../model/oosModel';
import { SingleIDBO } from 'src/app/common/services/utilities/commonModels';
import { MatDialog } from '@angular/material';
import { DepartmentReviewsComponent } from './departmentReviews.component';

@Component({
    selector: 'oos-dept-review',
    templateUrl: '../html/oosDeptReview.html'
})

export class OosDeptReviewComponent {

    @Input('encOOSTestDetID') encOOSTestDetID: string;
    othDeptName: string;
    remarks: string;
    actionValidity: string;
    deptList: any;
    validityObj: any;
    btnType: string = ButtonActions.btnSave;
    @Input() pageType: string = 'MNG';
    reviewCompleted: boolean = false;
    phaseCompleted :boolean = false;
    isLoaderStart : boolean;
    @Input() phaseTitle: string;
    subscription: Subscription = new Subscription();
    constructor(private _service: OosService, public _global: GlobalButtonIconsService, private _alert: AlertService, private _matDialog: MatDialog) { }

    ngAfterContentInit() {
        this.subscription = this._service.oosSubject.subscribe(resp => {
            if (resp.purpose == "getDeptReviewDetails") {
                this.remarks = resp.result.remarks;
                this.othDeptName = resp.result.otherDeptName;
                this.actionValidity = resp.result.actionValidity;
                this.reviewCompleted = resp.result.isReviewCompleted;
                this.phaseCompleted = resp.result.phaseCompleted
                this.deptList = resp.result.deptList;
                if (CommonMethods.hasValue(this.actionValidity))
                    this.validityObj = oosOptionHandler.GetOptionDetails(this.actionValidity)
                this.enableHeaders(!CommonMethods.hasValue(this.remarks));
            }
            else if (resp.purpose == "manageOOSDeptReview") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == 'OK') {
                    this.enableHeaders(false);
                    this._alert.success(OosMessages.reviewDept)
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
        });
    }

    getOthDeptEnable() {
        if (CommonMethods.hasValue(this.deptList) && this.deptList.filter(x => x.isSelected && x.moduleName == 'Others').length > 0)
            return false;
        else {
            this.othDeptName = null;
            return true;
        }
    }

    enableHeaders(val: boolean) {
        this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
    }

    save() {
        if (this.btnType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);
        var errMsg: string = this.validation();

        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg);

        var obj: manageDeptReview = new manageDeptReview();
        obj.encOOSTestDetailID = this.encOOSTestDetID;
        obj.remarks = this.remarks;
        obj.othDeptName = this.othDeptName;
        obj.validity = this.actionValidity;
        this.deptList.forEach(x => {
            if (x.isSelected) {
                var item: SingleIDBO = new SingleIDBO();
                item.id = x.moduleID
                obj.list.push(item);
            }
        })
        this.isLoaderStart = true;
        this._service.manageOOSDeptReview(obj);
    }

    viewComments() {
        var matDialog = this._matDialog.open(DepartmentReviewsComponent, {width: '60%'});
        matDialog.disableClose = true;
        matDialog.componentInstance.pageType = 'VIEW'
        matDialog.componentInstance.encOOSTestDetailID = this.encOOSTestDetID;
        matDialog.componentInstance.isPopUp = true;
    }

    validation() {
        if (!this.getOthDeptEnable() && !CommonMethods.hasValue(this.othDeptName))
            return OosMessages.othDeptName;
        if (!CommonMethods.hasValue(this.remarks))
            return OosMessages.reamrks;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}