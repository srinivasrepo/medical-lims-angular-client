import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { ActionMessages, ButtonActions } from 'src/app/common/services/utilities/constants';
import { OosMessages } from '../messages/oosMessages';
import { OosService } from '../services/oos.service';

@Component({
    selector: 'oos-header',
    templateUrl: '../html/oosHeaderData.html'
})

export class OosHeaderDataComponent {

    subscription: Subscription = new Subscription();
    @Input() encOosTestID: string;
    testInfo: any = {};
    btnType: string = ButtonActions.btnSave;
    appBo: AppBO = new AppBO();
    @Input() conditionCode: string;
    @Input() oosPageType: string;
    isLoaderStart: boolean;


    constructor(private _service: OosService, private _alert: AlertService, public _global: GlobalButtonIconsService, private _matDailog: MatDialog,
        private _router: Router) { }

    ngAfterContentInit() {
        this.subscription = this._service.oosSubject.subscribe(resp => {
            if (resp.purpose == "getTestInfo") {
                this.testInfo = resp.result;
                if (CommonMethods.hasValue(this.testInfo.summary))
                    this.btnType = ButtonActions.btnUpdate;
            }
            else if (resp.purpose == 'updateOOSSummary') {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == 'SUCCESS') {
                    this.appBo.initTime = resp.result.returnFlag;
                    this.btnType = ButtonActions.btnUpdate;
                    this._alert.success(OosMessages.descOOS);
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
        })
        var obj: any = { encOOSTestID: this.conditionCode == 'OOS_APP' ? this.encOosTestID : null, encOOSTestDetailID: this.conditionCode == 'OOS_APP' ? null : this.encOosTestID, conditionCode: this.conditionCode }
        this._service.getTestInfo(obj);
    }

    formatingString(val) {
        return CommonMethods.FormatValueString(val);
    }

    dateFormate(val) {
        return CommonMethods.hasValue(val) ? dateParserFormatter.FormatDate(val, 'datetime') : 'N / A';
    }

    updateSummary() {
        if (this.btnType == ButtonActions.btnUpdate)
            return this.btnType = ButtonActions.btnSave;
        if (!CommonMethods.hasValue(this.testInfo.summary))
            return this._alert.warning(OosMessages.summary);
        var obj: any
        obj = { encOosTestID: this.encOosTestID, summary: this.testInfo.summary };
        this.isLoaderStart = true;
        this._service.updateOOSSummary(obj);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}