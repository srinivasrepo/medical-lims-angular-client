import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { OosService } from '../services/oos.service';
import { ButtonActions, ActionMessages } from 'src/app/common/services/utilities/constants';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { OosMessages } from '../messages/oosMessages';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { ManageOOSProcess } from '../model/oosModel';
import { ActivatedRoute } from '@angular/router';
import { oosOptionHandler } from '../model/oosOptionHandler';

@Component({
    selector: 'oos-chk-grid',
    templateUrl: '../html/oosChecklistGrid.html'
})

export class OosChecklistGridComponent {

    encOosTestID: string;
    @Input('encOosTestDetID') encOosTestDetID: string;
    subscription: Subscription = new Subscription();
    displayedColumns: Array<string> = ['Sno', 'checkCatID', 'Check Point', 'Remarks'];
    resultData: any;
    dataSource: any;
    btnType: String = ButtonActions.btnSave;
    rootCause: string;
    rootCauseRelatedTo: string;
    remarks: string;
    status: string;
    spans = [];
    validity: string;
    phaseCompleted: boolean = false;
    @Input() pageType: string;
    validityObj: any;
    isLoaderStart: boolean;
    @Input() phaseTitle: string;

    constructor(private _service: OosService, public _global: GlobalButtonIconsService, private _alert: AlertService, private _actRoute: ActivatedRoute) { }

    ngAfterContentInit() {
        this._actRoute.queryParams.subscribe(param => this.encOosTestID = param['id']);
        this.subscription = this._service.oosSubject.subscribe(resp => {
            if (resp.purpose == 'oosGetPhase1CheckList') {
                this.resultData = resp.result;
                this.dataSource = resp.result.getCheckListQuestions;
                this.rootCause = this.resultData.qcOosTestDetails.obviousRootCause;
                this.rootCauseRelatedTo = this.resultData.qcOosTestDetails.rootCauseRelatedTo;
                this.remarks = this.resultData.qcOosTestDetails.remarks;
                this.validity = this.resultData.oosProcessCondition.conditionCode;
                if (CommonMethods.hasValue(this.rootCause))
                    this.status = this.resultData.qcOosTestDetails.phaseStatusCode;
                this.phaseCompleted = this.resultData.qcOosTestDetails.phaseComplited;
                this.cacheSpan('checkCatID', d => d.checkCatID);
                this.enableHeaders(!CommonMethods.hasValue(this.rootCause))
                this.gethandler();
            }
            else if (resp.purpose == "oosProcessItem") {
                this.isLoaderStart = false;
                if (resp.result == "OK") {
                    this._alert.success(OosMessages.oosSuccess)
                    this.enableHeaders(false);
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }

        })
    }


    getCategory(id) {
        return this.resultData.getQCOOSCheckList.filter(x => x.checkCatID == id)[0].category;
    }

    cacheSpan(key, accessor) {
        for (let i = 0; i < this.dataSource.length;) {
            let currentValue = accessor(this.dataSource[i]);
            let count = 1;

            // Iterate through the remaining rows to see how many match
            // the current value as retrieved through the accessor.
            for (let j = i + 1; j < this.dataSource.length; j++) {
                if (currentValue != accessor(this.dataSource[j])) {
                    break;
                }

                count++;
            }

            if (!this.spans[i]) {
                this.spans[i] = {};
            }

            // Store the number of similar values that were found (the span)
            // and skip i to the next unique row.
            this.spans[i][key] = count;
            i += count;
        }
    }

    getRowSpan(col, index) {
        return this.spans[index] && this.spans[index][col];
    }

    enableHeaders(val) {
        this.btnType = val && this.pageType == 'MNG' ? ButtonActions.btnSave : ButtonActions.btnUpdate;
    }

    save() {
        if (this.btnType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        var error: string = this.valdation();

        if (CommonMethods.hasValue(error))
            return this._alert.warning(error);

        var obj: ManageOOSProcess = new ManageOOSProcess();
        obj.encOOSTestID = this.encOosTestID;
        obj.encOOSTestDetailID = this.encOosTestDetID;
        obj.status = this.status;
        obj.count = 0;
        obj.obviousRootCause = this.rootCause;
        obj.rootCauserelatedTo = this.rootCauseRelatedTo;
        obj.remarks = this.remarks;
        if (CommonMethods.hasValue(this.validityObj))
            obj.validity = this.validity;
        obj.lst = this.resultData.getCheckListQuestions;
        this.isLoaderStart = true;
        this._service.oosProcessItem(obj);
    }

    valdation() {
        if (!CommonMethods.hasValue(this.rootCause))
            return OosMessages.rootCause;
        if (this.rootCause == 'Yes' && !CommonMethods.hasValue(this.rootCauseRelatedTo))
            return OosMessages.rootCauseRelated;
        if (!CommonMethods.hasValue(this.status))
            return OosMessages.status;
    }

    gethandler() {
        if (this.status == this.resultData.oosProcessCondition.phaseStatusIDCode)
            this.validityObj = oosOptionHandler.GetOptionDetails(this.resultData.oosProcessCondition.conditionCode)
        else
            this.validityObj = null;

    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}