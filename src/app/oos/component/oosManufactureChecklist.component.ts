import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { OosService } from '../services/oos.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ButtonActions, ActionMessages } from 'src/app/common/services/utilities/constants';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { AlertService } from 'src/app/common/services/alert.service';
import { OosMessages } from '../messages/oosMessages';
import { ManageOOSProcess } from '../model/oosModel';

@Component({
    selector: 'oos-manu-chk',
    templateUrl: '../html/oosManufactureChecklist.html'
})

export class OosManufactureChecklistComponent {

    subscription: Subscription = new Subscription();
    catBtnType: string = ButtonActions.btnGo;
    chkCatID: number;
    checkCategories: any;
    checkPoints: any;
    dataSource: any;
    spans = [];
    @Input('encOOSTestDetID') encOOSTestDetID: string;
    @Input('encOosTestID') encOosTestID: string;
    @Input() pageType: string = 'MNG'
    displayedColumns: Array<string> = ['Sno', 'checkCatID', 'Check Point', 'Answer', 'Remarks'];
    btnType: string = ButtonActions.btnSave;
    remarks: string;
    proposedCapa: string;
    canShowCapa: boolean;
    phaseCompleted : boolean;
    isLoaderObj = { isLoaderForCheckList : false, isLoaderOosProcess : false }
    capaPageType: string = 'MNG';
    @Input() phaseTitle: string;

    constructor(private _service: OosService, public _global: GlobalButtonIconsService, private _alert: AlertService) { }

    ngAfterContentInit() {
        this.subscription = this._service.oosSubject.subscribe(resp => {
            if (resp.purpose == "getManufactureChecklist")
                this.checkCategories = resp.result;
            else if (resp.purpose == "getManufactureCheckPoints") {
                this.isLoaderObj.isLoaderForCheckList = false;
                if (CommonMethods.hasValue(resp.result.getQCOOSCheckList) && resp.result.getQCOOSCheckList.length > 0) {
                    this.checkPoints = resp.result;
                    this.dataSource = resp.result.getCheckListQuestions;
                    this.catBtnType = ButtonActions.btnChange;
                    this.cacheSpan('checkCatID', d => d.checkCatID);
                }
                else
                    this._alert.info(OosMessages.noCheck);
            }
            else if (resp.purpose == "manufactureInvestigationDetails") {
                this.isLoaderObj.isLoaderForCheckList = false;
                this.canShowCapa = resp.result.canShowCAPA;
                this.remarks = resp.result.remarks;
                this.proposedCapa = resp.result.proposedCapa;
                this.phaseCompleted = resp.result.phaseCompleted;
                if (resp.result.phaseCompleted)
                    this.pageType = 'VIEW';
                this.chkCatID = resp.result.phaseID;
                if (CommonMethods.hasValue(this.chkCatID))
                    this._service.getManufactureCheckPoints(this.encOOSTestDetID, this.chkCatID);
                this.enableHeaders(!CommonMethods.hasValue(this.remarks))
            }
            else if (resp.purpose == "oosProcessItem") {
                this.isLoaderObj.isLoaderOosProcess = false;
                if (resp.result == "OK") {
                    this._alert.success(OosMessages.oosSuccess)
                    this.enableHeaders(false);
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }

        })

        this._service.getManufactureChecklist('MFGCL');
        this.capaPageType = this.pageType;
    }

    getCategory(id) {
        return this.checkPoints.getQCOOSCheckList.filter(x => x.checkCatID == id)[0].category;
    }

    getRowSpan(col, index) {
        return this.spans[index] && this.spans[index][col];
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


    getChecklist() {
        if (this.catBtnType == ButtonActions.btnChange)
            return this.catBtnType = ButtonActions.btnGo;
        if (!CommonMethods.hasValue(this.chkCatID))
            return this._alert.warning(OosMessages.slctCategory);
        this.isLoaderObj.isLoaderForCheckList = true;
        this._service.getManufactureCheckPoints(this.encOOSTestDetID, this.chkCatID);
    }

    enableHeaders(val: boolean) {
        this.btnType = val && this.pageType == 'MNG' ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.capaPageType = val && this.pageType == 'MNG'? 'MNG': 'VIEW';
    }

    save() {
        if (this.btnType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);
        var err: string = this.validation();
        if (CommonMethods.hasValue(err))
            return this._alert.warning(err);

        var obj: ManageOOSProcess = new ManageOOSProcess();
        obj.encOOSTestID = this.encOosTestID;
        obj.encOOSTestDetailID = this.encOOSTestDetID;
        obj.status = 'a';
        obj.count = 0;
        obj.proposeCapa = this.proposedCapa;
        obj.phaseID = this.chkCatID;
        obj.remarks = this.remarks;
        obj.lst = this.checkPoints.getCheckListQuestions;
        this.isLoaderObj.isLoaderOosProcess = true;
        this._service.oosProcessItem(obj);
    }

    validation() {
        if (!CommonMethods.hasValue(this.chkCatID) || this.catBtnType == ButtonActions.btnGo)
            return OosMessages.slctCategory;
        if (!CommonMethods.hasValue(this.remarks))
            return OosMessages.probablecase;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}