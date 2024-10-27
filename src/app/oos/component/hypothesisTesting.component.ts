import { Component, Input, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { OosService } from '../services/oos.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { OosMessages } from '../messages/oosMessages';
import { EntityCodes, GridActions, ActionMessages, LimsRespMessages, ButtonActions } from 'src/app/common/services/utilities/constants';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { ManageHypoTesting, ManageOOSProcess } from '../model/oosModel';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { MatDialog } from '@angular/material';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { ManageAnalysisComponent } from 'src/app/sampleAnalysis/component/manageAnalysis.component';

@Component({
    selector: 'oos-hypo-test',
    templateUrl: '../html/hypothesisTesting.html'
})

export class HypothesisTestingComponent {

    subscription: Subscription = new Subscription();
    analysisPhaseList: any;
    phaseID: number;
    @Input() pageType: string = 'MNG';
    showAnalysis: boolean = false;
    entityActID: number;
    entityCode: string = EntityCodes.oosModule;
    @Input('appBo') appBo: AppBO = new AppBO();
    @Input('encOosTestID') encOosTestID: string;
    @Input('encOosTestDetID') encOosTestDetID: string;
    gridActions: any = [GridActions.analysis, GridActions.delete];
    headers: any;
    dataSource: any;
    remarks: string;
    btnType: string = ButtonActions.btnSave;
    phaseCompleted: boolean = false;
    btnUpload: string = ButtonActions.btnUpload;
    anaPageType: string;
    isLoaderObj = { isLoaderForPhase: false, isLoaderForOosProcess: false };
    deletedEntID: number;
    @ViewChild('samAna', { static: false }) samAna: ManageAnalysisComponent;
    @Input() phaseTitle: string;


    constructor(private _service: OosService, private _alert: AlertService, public _global: GlobalButtonIconsService, private _confirmDialog: ConfirmationService,
        private _matDailog: MatDialog) { }

    ngAfterContentInit() {
        this.subscription = this._service.oosSubject.subscribe(resp => {
            if (resp.purpose == "oosGetHypoTestingInfo") {
                this.remarks = resp.result.remarks;
                this.phaseCompleted = resp.result.phaseCompleted;
                this.analysisPhaseList = resp.result.oosPhasesMaster;
                this.dataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(resp.result.oosHypoTestingPhasesDetails, 'arrayDateTimeFormat', 'createdOn')))
                this.enableHeaders(!CommonMethods.hasValue(this.remarks))
            }
            else if (resp.purpose == "oosManageHypoTestingPhases") {
                this.isLoaderObj.isLoaderForPhase = false;
                if (resp.result.resultFlag == 'OK') {
                    if (CommonMethods.hasValue(this.deletedEntID) && this.deletedEntID == this.entityActID)
                        this.showAnalysis = false;
                    this.dataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(resp.result.oosHypoTestingPhasesDetails, 'arrayDateTimeFormat', 'createdOn')))
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.resultFlag));
            }
            else if (resp.purpose == "oosProcessItem") {
                this.isLoaderObj.isLoaderForOosProcess = false;
                if (resp.result == "OK") {
                    this._alert.success(OosMessages.oosSuccess)
                    this.enableHeaders(false);
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }

        });
        this.prepareHeaders();
        this.anaPageType = this.pageType;
        if (this.pageType == "VIEW")
            this.gridActions.pop(GridActions.delete);
    }

    addPhase() {
        if (!CommonMethods.hasValue(this.phaseID))
            return this._alert.warning(OosMessages.analysisPhase);
        var obj: ManageHypoTesting = new ManageHypoTesting();
        obj.phaseID = this.phaseID;
        obj.action = 'ADD';
        obj.encOOSTestDetailID = this.encOosTestDetID;
        obj.encOOSTestID = this.encOosTestID;
        this.isLoaderObj.isLoaderForPhase = true;
        this._service.oosManageHypoTestingPhases(obj);
    }

    prepareHeaders() {
        this.headers = [];
        this.headers.push({ columnDef: 'sno', header: 'S.No.', cell: (element: any) => `${element.sno}`, width: 'maxWidth-7per' });
        this.headers.push({ columnDef: 'phaseTitle', header: 'Analysis Phase for Investigation', cell: (element: any) => `${element.phaseTitle}`, width: 'minWidth-25per' });
        this.headers.push({ columnDef: 'createdBy', header: 'Created By', cell: (element: any) => `${element.createdBy}`, width: 'maxWidth-15per' });
        this.headers.push({ columnDef: 'createdOn', header: 'Created On', cell: (element: any) => `${element.createdOn}`, width: 'maxWidth-15per' });
    }

    onActionClicked(evt) {
        if (evt.action == GridActions.analysis) {
            if (this.entityActID != evt.val.oosHypoTestingID) {
                this.entityActID = evt.val.oosHypoTestingID;
                this.showAnalysis = false;
                setTimeout(() => {
                    this.showAnalysis = true;
                }, 100);
            }
        }
        else if (evt.action == GridActions.delete) {
            if (this.pageType == 'VIEW' || this.btnType == ButtonActions.btnUpdate)
                return;
            var obj: ManageHypoTesting = new ManageHypoTesting();

            obj.action = 'DEL';
            obj.encOOSTestDetailID = this.encOosTestDetID;
            obj.encOOSTestID = this.encOosTestID;
            this.deletedEntID = obj.hypoTestPhaseID = evt.val.oosHypoTestingID;

            this._confirmDialog.confirm(LimsRespMessages.delete).subscribe(re => {
                if (re)
                    this._service.oosManageHypoTestingPhases(obj);
            })

        }
    }

    enableHeaders(val: boolean) {
        this.btnType = val && this.pageType == 'MNG' ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.btnUpload = val && this.pageType == 'MNG' ? ButtonActions.btnUpload : ButtonActions.btnViewDocus;
        this.anaPageType = this.pageType == 'VIEW' ? this.pageType : val ? 'MNG' : 'VIEW';
        if (CommonMethods.hasValue(this.samAna)) {
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
    }

    save() {
        if (this.btnType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);
        if (!CommonMethods.hasValue(this.remarks))
            return this._alert.warning(OosMessages.othJustification);
        var obj: ManageOOSProcess = new ManageOOSProcess();
        obj.encOOSTestDetailID = this.encOosTestDetID;
        obj.encOOSTestID = this.encOosTestID;
        obj.count = 1;
        obj.status = 'a';
        obj.isMisc = true;
        obj.remarks = this.remarks;
        this.isLoaderObj.isLoaderForOosProcess = true;
        this._service.oosProcessItem(obj);
    }

    Uploadfiles() {

        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(this.entityCode, 0, 'HYPTST', this.encOosTestID, [], 'MEDICAL_LIMS');
        modal.componentInstance.mode = this.btnType == ButtonActions.btnUpdate ? 'VIEW' : 'MANAGE';

    }

    closeAnalysis(val) {
        this.showAnalysis = !val;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
