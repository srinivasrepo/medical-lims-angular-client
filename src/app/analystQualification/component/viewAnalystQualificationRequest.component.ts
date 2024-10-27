import { Component } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { analystService } from '../service/analyst.service';
import { QualificationRequest } from '../model/analystModel';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { PageUrls, EntityCodes, GridActions } from 'src/app/common/services/utilities/constants';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { MatDialog } from '@angular/material';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ArdsReportBO } from 'src/app/sampleAnalysis/model/sampleAnalysisModel';
import { AnalysisReportComponent } from 'src/app/sampleAnalysis/component/analysisReport.component';
import { checklistComponent } from 'src/app/common/component/checklist.component';
import { ReportBO } from 'src/app/reports/models/report.model';
import { ReportView } from 'src/app/common/component/reportView.component';

@Component({
    selector: 'view-analystQualiRequest',
    templateUrl: '../html/viewAnalystQualificationRequest.html'
})

export class viewAnalystQualificationRequestComponent {

    encQualificationID: string;
    headersData: Array<any> = [];
    dataSource: any;
    status: string;
    backUrl: string = PageUrls.analystQualif;
    pageTitle: string = PageTitle.viewAnalyst;
    viewHistory: any;
    refNo: string;
    subscription: Subscription = new Subscription();
    qualificationRequest: QualificationRequest = new QualificationRequest();
    accptCriteria: any = [];
    analyHeader: any;
    analyDataSource: any;
    showArNum: boolean = false;
    actions: any = [GridActions.Calib_Report];
    entityCode: string = EntityCodes.analystQualif

    constructor(private _actRoute: ActivatedRoute, private _analystService: analystService, private _modalDialog: MatDialog, public _global: GlobalButtonIconsService) {
    }

    ngAfterContentInit() {
        this._actRoute.queryParams.subscribe(param => { this.encQualificationID = param['id'] });
        this.subscription = this._analystService.analystSubject.subscribe(resp => {
            if (resp.purpose == "getQualificationDetailsForView") {
                this.qualificationRequest = resp.result.qualificationRequest;
                this.showArNum = resp.result.qualificationRequest.showArNum;
                this.status = this.qualificationRequest.status;
                this.refNo = this.qualificationRequest.requestCode;
                this.accptCriteria = resp.result.getAcceptenceCriteriaDetailsList;
                this.dataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(resp.result.getQualificationTestsDetails));
                this.analyDataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(resp.result.analysisResultList));
                this.prepareHeaders();
            }
        });
        this.viewHistory = ({ id: this.encQualificationID, code: 'ANALYST_QUALIFICATION' });
        this._analystService.getQualificationDetailsForView(this.encQualificationID);
    }

    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ columnDef: "sno", header: "S. No.", cell: (element: any) => `${element.sno}`, width: "maxWidth-5per" });
        this.headersData.push({ columnDef: "testTitle", header: "Test Title", cell: (element: any) => `${element.testTitle}`, width: "maxWidth-20per" });
        this.headersData.push({ columnDef: "preparationResult1", header: "Preparation Result 1", cell: (element: any) => `${element.preparationResult1}` , width: "maxWidth-15per" });
        this.headersData.push({ columnDef: "preparationResult2", header: "Preparation Result 2", cell: (element: any) => `${element.preparationResult2}`, width: "maxWidth-15per" });
        if (this.qualificationRequest.requestTypeCode != 'SAMPLE_ANALYSIS')
            this.headersData.push({ columnDef: "preparationResult3", header: "Preparation Result 3", cell: (element: any) => `${element.preparationResult3}`, width: "maxWidth-15per" });
        this.headersData.push({ columnDef: "variationObserved", header: "Variation Observed", cell: (element: any) => `${element.variationObserved}`, width: "maxWidth-15per" });
        this.headersData.push({ columnDef: "acceptanceCriteria", header: "Acceptance Criteria", cell: (element: any) => `${element.acceptanceCriteria}`, width: "maxWidth-15per" });
        this.headersData.push({ columnDef: "averageResult", header: "Average Result", cell: (element: any) => `${element.averageResult}`, width: "maxWidth-15per" });
        this.headersData.push({ columnDef: "originalResult", header: "Original Result", cell: (element: any) => `${element.originalResult}`, width: "maxWidth-15per" });
        this.headersData.push({ columnDef: "originalVariationObserved", header: "Original Variation Observed", cell: (element: any) => `${element.originalVariationObserved}`, width: "maxWidth-25per" });
        this.headersData.push({ columnDef: "originalAcceptanceCriteria", header: "Original Acceptance Criteria", cell: (element: any) => `${element.originalAcceptanceCriteria}`, width: "maxWidth-25per" });

        this.analyHeader = [];
        this.analyHeader.push({ "columnDef": 'sno', "header": "S.No.", cell: (element: any) => `${element.sno}`, width: "maxWidth-5per" });
        this.analyHeader.push({ "columnDef": 'sioCode', "header": "Inward No.", cell: (element: any) => `${element.sioCode}`, width: "maxWidth-15per" });
        this.analyHeader.push({ "columnDef": 'arNumber', "header": "AR Number", cell: (element: any) => `${element.arNumber}`, width: "maxWidth-15per" });
        this.analyHeader.push({ "columnDef": 'testName', header: "Test Name", cell: (element: any) => `${element.testName}`, width: "maxWidth-20per"  });
        this.analyHeader.push({ "columnDef": 'specDesc', header: "Specification Limit", cell: (element: any) => `${element.specDesc}`, width: "maxWidth-20per"  });
        this.analyHeader.push({ "columnDef": 'finalResult', "header": "Result", cell: (element: any) => `${element.finalResult}`, width: "maxWidth-15per" });
    }

    formatString(val) {
        return CommonMethods.FormatValueString(val);
    }

    uploadFile(section) {
        const modal = this._modalDialog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.analystQualif, 0, section, this.encQualificationID, [], 'MEDICAL_LIMS', this.refNo);
        modal.componentInstance.mode = 'VIEW';

    }

    onActionClicked(evt) {
        var rptObj: ArdsReportBO = new ArdsReportBO();
        rptObj.ardsExecID = evt.val.samAnaTestID;
        rptObj.entityCode = EntityCodes.sampleAnalysis;
        rptObj.dmsReportID = evt.val.dmsReportID;
        rptObj.refNumber = evt.val.arNumber;
        rptObj.requestFrom = EntityCodes.analystQualif;

        const modal = this._modalDialog.open(AnalysisReportComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.rptObj = rptObj;
    }

    viewCheckList() {
        const modal = this._modalDialog.open(checklistComponent, { width: '800px' });
        modal.disableClose = true;
        modal.componentInstance.encEntityActID = this.encQualificationID;
        modal.componentInstance.categoryCode = 'INVALID_CHECKLIST';
        modal.componentInstance.type = 'VIEW';
        modal.componentInstance.entityCode = EntityCodes.analystQualif;
    }

    showVolSolReport() {
        const modalRef = this._modalDialog.open(UploadFiles, CommonMethods.modalFullWidth);
        modalRef.disableClose = true;
        modalRef.componentInstance.mode = "VIEW";
        modalRef.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.volumetricSol, 0, "REPORT", String(this.qualificationRequest.volSolutionID));
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}