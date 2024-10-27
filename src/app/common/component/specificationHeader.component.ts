import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { PageUrls, EntityCodes, GridActions } from 'src/app/common/services/utilities/constants';
import { GetSpecHeaderInfo } from 'src/app/common/model/commonModel';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { CommonService } from '../services/commonServices';
import { QCCalibTestResultComponent } from 'src/app/qcCalibrations/component/testResult.component';

@Component({
    selector: 'spec-hea',
    templateUrl: '../html/specificationHeader.html'
})

export class SpecificationHeaderComponent {

    encSpecID: string = "0";
    encCalibID: string = "0";
    entityCode: string;
    isShow: boolean

    pageTitle: string = PageTitle.getSpecHeaderInfo;
    backUrl: string = PageUrls.homeUrl;
    headers: any;
    dataSource: any;
    actions: Array<string> = [GridActions.view]


    specHeaderObj: GetSpecHeaderInfo = new GetSpecHeaderInfo();

    subscription: Subscription = new Subscription();

    constructor(private _service: CommonService, public _global: GlobalButtonIconsService,
        private _matDailog: MatDialog, private _closeModel: MatDialogRef<SpecificationHeaderComponent>) { }

    ngAfterViewInit() {
        this.subscription = this._service.commonSubject.subscribe(resp => {
            if (resp.purpose == 'getSpecHeaderInfo') {
                this.specHeaderObj = resp.result;
                this.specHeaderObj.effectiveFrom = dateParserFormatter.FormatDate(resp.result.effectiveFrom, "datetime");
                this.specHeaderObj.effectiveTo = dateParserFormatter.FormatDate(resp.result.effectiveTo, "datetime");
                this.specHeaderObj.supersedDate = dateParserFormatter.FormatDate(resp.result.supersedDate, "datetime");
                this.specHeaderObj.targetReviewDate = dateParserFormatter.FormatDate(resp.result.targetReviewDate, 'date');
                this.dataSource = CommonMethods.bindMaterialGridData(resp.result.getSpecificationData)
            }
        })
        this.changeBgColor('INIT');
        this.prepareHeader();
        this._service.getSpecHeaderInfo(this.encSpecID, this.encCalibID);
    }



    prepareHeader() {
        this.headers = [];

        this.headers.push({ "columnDef": 'srNum', "header": "S.No.", cell: (element: any) => `${element.srNum}`, width: "maxWidth-5per" });
        this.headers.push({ "columnDef": 'testNameCode', "header": CommonMethods.hasValue(this.encCalibID) ? "Parameter Name(Parameter ID)" : "Test Name", cell: (element: any) => `${element.testNameCode}`, width: "minWidth-10per maxWidth-22per" });
        this.headers.push({ "columnDef": 'specDesc', "header": "Acceptance Criteria", cell: (element: any) => `${element.specDesc}`, width: "minWidth-15per maxWidth-15per" });
        this.headers.push({ "columnDef": 'limitResult', "header": "Limit for Results", cell: (element: any) => `${element.limitResult}`, width: "minWidth-15per maxWidth-15per" });
        this.headers.push({ "columnDef": 'stpTitle', "header": "STP Title", cell: (element: any) => `${element.stpTitle}`, width: "maxWidth-25per" });
        this.headers.push({ "columnDef": 'isGroupTest', "header": "Group Technique", cell: (element: any) => `${element.isGroupTest}`, width: "maxWidth-15per" });
    }

    Uploadfiles(type: string) {

        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(type == 'SPEC' ? 'QCSPEC' : EntityCodes.calibParamSet, 0, type, type == 'SPEC' ? this.encSpecID : this.encCalibID, [], type == 'SPEC' ? "MEDICALLIMS" : 'MEDICAL_LIMS');
        modal.componentInstance.mode = 'VIEW';
    }

    close() {
        this._closeModel.close();
    }

    changeBgColor(type: string) {
        var docID = document.getElementById('bg_complaints');

        if (CommonMethods.hasValue(docID) && type == 'CLEAR')
            docID.className = '';
        else if (CommonMethods.hasValue(docID) && type != 'CLEAR')
            docID.className = 'blue-light';
    }

    onActionClicked(evt: any) {
        if (evt.action == "PDF") {
            const modal = this._matDailog.open(QCCalibTestResultComponent, CommonMethods.modalFullWidth);
            modal.componentInstance.encSpecCatID = evt.val.specCatID;
            modal.afterClosed();
        }
        else if (evt.action == 'VIEW_METHOD') {
            if (CommonMethods.hasValue(this.encCalibID))
                this.ParameterUploadfiles('METHOD', evt.val.specCatID);
            else
                this.TestUploadfiles('METHOD', evt.val.specTestID)
        }
        else if (evt.action == 'VIEW') {
            if (CommonMethods.hasValue(this.encCalibID))
                this.ParameterUploadfiles('FILE', evt.val.specCatID);
            else
                this.TestUploadfiles('FILE', evt.val.specTestID)
        }
    }

    ParameterUploadfiles(type: string, val: any) {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.calibParamSet, 0, type == 'FILE' ? 'CALIB_PARAM_FILE' : type == 'METHOD' ? 'CALIB_PARAM_METHOD' : type == 'HEADER_UPLOAD' ? 'CALIB_PARAM_REQ' : null, val,[], 'MEDICAL_LIMS');
        modal.componentInstance.mode = 'VIEW';
        modal.componentInstance.uploadTitle = type == 'METHOD' ? 'View Method' : type == 'FILE' ? 'View Files' : modal.componentInstance.uploadTitle;
        modal.afterClosed().subscribe((resu) => { })
    }

    TestUploadfiles(type: string, val: any) {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload('QCSPEC', 0, type == 'FILE' ? 'SPEC_TEST' : 'SPECMETHOD', val, [], 'MEDICALLIMS');
        modal.componentInstance.mode = 'VIEW';
        modal.componentInstance.uploadTitle = type == 'METHOD' ? 'View Method' : type == 'FILE' ? 'View Files' : modal.componentInstance.uploadTitle;
        modal.afterClosed().subscribe((resu) => { })
    }

    ngOnDestroy() {
        this.changeBgColor('CLEAR');
        this.subscription.unsubscribe();
    }
}