import { Component, AfterContentInit, OnDestroy } from "@angular/core";
import { Subscription } from 'rxjs';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { EntityCodes, ActionMessages } from 'src/app/common/services/utilities/constants';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ArdsReportBO, ManageViewResetReportBO } from '../model/sampleAnalysisModel';
import { AlertService } from 'src/app/common/services/alert.service';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { select, Store } from '@ngrx/store';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import * as analysisActions from '../state/analysis/analysis.action';
import * as fromCalibArdsOptions from '../../calibrationArds/state/calibrationArds/calibrationArds.reducer';
import { ReportView } from 'src/app/common/component/reportView.component';
import { FileDownloadComponent } from 'src/app/limsHelpers/component/fileDownload.component';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';

@Component({
    selector: 'app-analysisReport',
    templateUrl: '../html/analysisReport.html'
})

export class AnalysisReportComponent implements AfterContentInit, OnDestroy {

    pageTitle: string = "Ards Report";
    rptObj: ArdsReportBO = new ArdsReportBO();


    mode: string = "MANAGE";
    entityCode: string = EntityCodes.sampleAnalysis;

    // documentID: number;
    // entityActID: string;
    dataSource: any;
    title: string;
    downloadFile: FileDownloadComponent = new FileDownloadComponent();
    fileType: string;


    subscription: Subscription = new Subscription();

    constructor(private _service: SampleAnalysisService, private _modal: MatDialog, private _limsContext: LIMSContextServices,
        public _global: GlobalButtonIconsService, private _alert: AlertService,
        private _store: Store<fromAnalysisOptions.AnalysisState>, private _matDailogRef: MatDialogRef<AnalysisReportComponent>) { }


    ngAfterContentInit() {
        this._service.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getCalibrationReportDetails" || (resp.purpose == "manageViewResetReport" && resp.type == "RESET")) {
                if (resp.result.statusCode == 'SUCCESS') {
                    // window.open(resp.result.message, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=200,left=200,width=1500,height=700");
                    this.rptObj.dmsReportID = resp.result.dmsReportID;
                    this._alert.success(SampleAnalysisMessages.generateReport);

                    var samTestList = [];

                    this._store
                        .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
                        .subscribe(testList => {
                            samTestList = testList;
                        });

                    samTestList.filter(x => x.samAnaTestID == this.rptObj.ardsExecID).forEach((item) => {
                        item.dmsReportID = this.rptObj.dmsReportID;
                    })

                    this._store.dispatch(new analysisActions.UpdateAnalysisTestInfo(samTestList));

                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.statusCode));
            }
            else if (resp.purpose == "manageViewResetReport" && resp.type == "VIEW") {
                if (this._modal.openDialogs.length < 2) {
                    const modal = this._modal.open(ReportView, CommonMethods.modalFullWidth);
                    modal.componentInstance.setAuditReportUrl = resp.result.message;
                }
            }
            else if (resp.purpose == 'downloadReport') {
                if (resp.result != 'DOC_FAILED') {
                    var file = { type: this.fileType, name: this.title }
                    this.downloadFile.convertBase64StringToBlob(resp.result, file);
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == "getFileName") {
                this.title = resp.result;
                if (CommonMethods.hasValue(this.title))
                    this.fileType = this.title.split('.')[1];
            }
            else if (resp.purpose == "updatePlaceholderValues") {
                if (resp.result == 'SUCCESS')
                    this._alert.success(SampleAnalysisMessages.reportRefresh);
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
        })
        if (CommonMethods.hasValue(this.rptObj.dmsReportID))
            this._service.getFileName(this.rptObj.dmsReportID);

    }


    generateReport(type: string) {


        if (type == 'GEN') {
            this._service.getCalibrationReportDetails(this.rptObj);
        }
        else { // View AND Reset
            var obj: ManageViewResetReportBO = new ManageViewResetReportBO();
            obj.ardsExecID = this.rptObj.ardsExecID;
            obj.entityCode = this.rptObj.entityCode;
            obj.reportID = this.rptObj.dmsReportID;
            obj.type = type;
            obj.role = this._limsContext.limsContext.userDetails.roleName;
            obj.section = this.getUploadType();
            this._service.manageViewResetReport(obj);
        }

    }


    uploadFiles() {
        const modal = this._modal.open(UploadFiles);
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(this.rptObj.entityCode, 0, this.getUploadType(), this.rptObj.ardsExecID.toString(), [], 'MEDICAL_LIMS');
        modal.componentInstance.uploadBO.refNumber = this.rptObj.refNumber;
        modal.componentInstance.dmsID = this.rptObj.dmsReportID;
        modal.disableClose = true;
        modal.componentInstance.mode = this.mode;
        modal.afterClosed().subscribe(re => {
            if (CommonMethods.hasValue(this.rptObj.dmsReportID))
                this._service.getFileName(this.rptObj.dmsReportID);
        })

    }

    getUploadType() {
        //return this.entityCode == EntityCodes.sampleAnalysis ? 'ARDS_REPRT' : 'CALI_REPT';
        return 'DMS_REPORT';
    }

    downloadReport() {
        var obj: ManageViewResetReportBO = new ManageViewResetReportBO();
        obj.reportID = this.rptObj.dmsReportID;
        obj.type = 'MEDICAL_LIMS';
        obj.section = this.getUploadType();
        this._service.downloadReport(obj);
    }

    updatePlaceholder() {
        this._service.updatePlaceholderValues(this.rptObj);
    }

    formatString() {

    }


    close() {
        this._matDailogRef.close();
    }


    ngOnDestroy() {
        this.subscription.unsubscribe();
    }


}