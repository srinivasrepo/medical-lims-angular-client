import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { OosService } from '../services/oos.service';
import { ButtonActions, ActionMessages } from 'src/app/common/services/utilities/constants';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { OosMessages } from '../messages/oosMessages';
import { manageDeptCommetns } from '../model/oosModel';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { MatDialogRef } from '@angular/material/dialog';
import { Optional } from '@angular/core';

@Component({
    selector: 'dept-review',
    templateUrl: '../html/departmentReviews.html'
})

export class DepartmentReviewsComponent {

    @Input('encOOSTestDetailID') encOOSTestDetailID: string;
    @Input('appBo') appBo: AppBO = new AppBO();
    @Input() pageType: string = 'MNG';
    subscription: Subscription = new Subscription();
    deptRemarksList: any;
    btnType: string = ButtonActions.btnSave;
    isPopUp: Boolean = false;
    isLoaderStart : boolean;

    constructor(private _service: OosService, public _global: GlobalButtonIconsService, private _alert: AlertService, @Optional() private _closeModel: MatDialogRef<DepartmentReviewsComponent>) { }

    ngAfterContentInit() {
        this.subscription = this._service.oosSubject.subscribe(resp => {
            if (resp.purpose == 'getDepartmentWiseReview') {
                this.deptRemarksList = resp.result;
                var obj = this.deptRemarksList.filter(x => x.deptCode == x.userDeptCode && CommonMethods.hasValue(x.comments))
                this.enableHeaders(!(obj.length > 0))
            }
            else if (resp.purpose == "manageDepartmentComments") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == 'OK') {
                    this.enableHeaders(false);
                    this._alert.success(OosMessages.deptCommentsSuss);
                    this.appBo = resp.result;
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }

        });

        this._service.getDepartmentWiseReview(this.encOOSTestDetailID);
    }

    showAndHide(deptCode, userDept) {
        if ((deptCode != 'OTHER' && deptCode == userDept) || (deptCode == 'OTHER' && userDept == "QA"))
            return true;
        else false;
    }

    enableHeaders(val: boolean) {
        this.btnType = val && this.pageType == 'MNG' ? ButtonActions.btnSave : ButtonActions.btnUpdate;
    }

    save() {
        if (this.btnType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);
        var err: string = this.validation();
        if (CommonMethods.hasValue(err))
            return this._alert.warning(err);
        var obj: manageDeptCommetns = new manageDeptCommetns();
        obj.encOOSTestDetailID = this.encOOSTestDetailID;
        obj.initTime = this.appBo.initTime;
        obj.list = this.deptRemarksList.filter(x => this.showAndHide(x.deptCode, x.userDeptCode));
        this.isLoaderStart = true;
        this._service.manageDepartmentComments(obj)
    }

    close() {
        this._closeModel.close();
    }
    validation() {
        if (this.deptRemarksList.filter(x => x.userDeptCode == 'QA' && x.deptCode != 'OTHER' && x.deptCode != 'QA' && !CommonMethods.hasValue(x.isConfirmed)).length > 0)
            return OosMessages.othDeptComments;
        if (this.deptRemarksList.filter(x => (x.userDeptCode == x.deptCode && !CommonMethods.hasValue(x.comments)) || (x.deptCode == 'OTHER' && x.userDeptCode == 'QA' && !CommonMethods.hasValue(x.comments))).length > 0)
            return OosMessages.deptComments;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}