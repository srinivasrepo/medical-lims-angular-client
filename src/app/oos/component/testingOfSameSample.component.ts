import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core'
import { Subscription } from 'rxjs'
import { OosService } from '../services/oos.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { EntityCodes, ButtonActions, ActionMessages, GridActions } from 'src/app/common/services/utilities/constants';
import { MatDialog } from '@angular/material';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { OosMessages } from '../messages/oosMessages';
import { ManageOOSProcess } from '../model/oosModel';
import { Store, select } from '@ngrx/store';
import * as fromAnalysisOptions from '../../sampleAnalysis/state/analysis/analysis.reducer';
import { ManageAnalysisComponent } from 'src/app/sampleAnalysis/component/manageAnalysis.component';
import { oosOptionHandler } from '../model/oosOptionHandler';

@Component({
    selector: 'oos-tst-sample',
    templateUrl: '../html/testingOfSameSample.html'
})

export class TestingOfSameSampleComponent {

    @Input('encOosTestID') encOosTestID: string;
    @Input('encOosTestDetID') encOosTestDetID: string;
    @Input('appBo') appBo: AppBO = new AppBO();
    entityCode: string = EntityCodes.oosModule;
    @Input() pageType: string = 'MNG';
    btnType: string = ButtonActions.btnSave;
    btnUpload: string = ButtonActions.btnUpload;
    testResult: string;
    remarks: string;
    isMisc: boolean;
    tests: any;
    phaseCompleted: boolean = false;
    @ViewChild('samAna', { static: false }) samAna: ManageAnalysisComponent;
    anaPageType: string;
    conditionList: any;
    validityObj: any;
    condition: string;
    isLoaderStart : boolean;
    @Input() phaseTitle: string;

    // ardsExecID: string = "";
    @Output() emitArdsExecID: EventEmitter<any> = new EventEmitter();

    subscription: Subscription = new Subscription();

    constructor(private _service: OosService, private _alert: AlertService, public _global: GlobalButtonIconsService, private _matDailog: MatDialog, private _store: Store<fromAnalysisOptions.AnalysisState>) { }
    ngAfterContentInit() {
        this.subscription = this._service.oosSubject.subscribe(resp => {
            if (resp.purpose == "oosTestingOfNewPortionOfSameSampleResult") {
                this.remarks = resp.result.remarks;
                this.isMisc = resp.result.isMisc;
                this.phaseCompleted = resp.result.phaseCompleted;
                this.conditionList = resp.result.conditionList;
                this.condition = resp.result.condition;
                if (CommonMethods.hasValue(this.remarks))
                    this.testResult = `${resp.result.phaseStatus}`.trim();
                this.samAna.getSampleAnalysisData();
                this.enableHeaders(!CommonMethods.hasValue(this.remarks))
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
        this.anaPageType = this.pageType
    }

    ngOnInit() {
        this._store
            .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
            .subscribe(testList => {
                this.tests = testList;
            });
    }

    Uploadfiles() {

        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(this.entityCode, 0, 'SA', this.encOosTestDetID, [], 'MEDICAL_LIMS');
        modal.componentInstance.mode = this.btnType == ButtonActions.btnUpdate ? 'VIEW' : 'MANAGE';

    }

    enableHeaders(val: boolean) {
        this.btnType = val && this.pageType == 'MNG' ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.btnUpload = val && this.pageType == 'MNG' ? ButtonActions.btnUpload : ButtonActions.btnViewDocus;
        this.samAna.btnType = this.btnType;
        this.anaPageType = this.pageType == 'VIEW' ? this.pageType : this.btnType == ButtonActions.btnSave ? 'MNG' : 'VIEW';
        this.samAna.pageType = this.samAna.actPageType = this.anaPageType;
        if (this.anaPageType == 'VIEW') {
            var index = this.samAna.actions.findIndex(x => x == 'INVALID');
            this.samAna.actions.splice(index, 1);
            this.samAna.gridResetActions();
        }
        else {
            var index = this.samAna.actions.findIndex(x => x == 'INVALID');
            if (index == -1)
                this.samAna.actions.push(GridActions.Invalid);
            this.samAna.gridResetActions();
        }
    }

    save() {
        if (this.btnType == ButtonActions.btnUpdate)
            return this.enableHeaders(true)
        var err: string = this.validation();
        if (CommonMethods.hasValue(err))
            return this._alert.warning(err);

        var obj: ManageOOSProcess = new ManageOOSProcess();
        obj.encOOSTestDetailID = this.encOosTestDetID;
        obj.encOOSTestID = this.encOosTestID;
        obj.count = 1;
        obj.status = this.testResult;
        obj.validity = this.condition;
        obj.isMisc = CommonMethods.hasValue(this.isMisc);
        obj.remarks = this.remarks;
        this.isLoaderStart = true;
        this._service.oosProcessItem(obj);

    }

    validation() {
        if (!CommonMethods.hasValue(this.testResult))
            return OosMessages.testResult;
        var obj = this.tests.filter(x => x.passOrFail == 'F')
        if (obj.length > 0 && this.testResult == 'a')
            return OosMessages.cantApp;
        if (!CommonMethods.hasValue(this.remarks))
            return OosMessages.corrAction;
    }

    gethandler() {
        if (CommonMethods.hasValue(this.testResult) && this.conditionList.filter(x => `${x.phaseStatusIDCode}`.trim() == this.testResult && CommonMethods.hasValue(x.conditionCode)).length > 0)
            this.validityObj = oosOptionHandler.GetOptionDetails(this.conditionList.filter(x => `${x.phaseStatusIDCode}`.trim() == this.testResult)[0].conditionCode)
        else {
            this.validityObj = null;
            this.condition = null;
        }

    }


    getArdsExec(evt) {
        this.emitArdsExecID.emit(evt)
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}