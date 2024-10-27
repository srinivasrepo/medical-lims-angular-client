import { Component } from "@angular/core";
import { Subscription } from 'rxjs';
import { SamplePlanService } from '../service/samplePlan.service';
import { PageTitle } from '../../common/services/utilities/pagetitle';
import { PageUrls, EntityCodes } from '../../common/services/utilities/constants';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { AnalystOccupancyDetailsComponent } from './analystOccupancyDetails.component';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { GetSampleDetailsModel } from '../model/samplePlanModel';
import { ViewSampleDetailsComponent } from './viewSampleDetails.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { UploadFiles } from "src/app/UtilUploads/component/upload.component";

@Component({
    selector: 'view-sample',
    templateUrl: '../html/viewSamplePlan.html'
})

export class ViewSamplePlanComponent {

    encPlanID: string;
    sampleObj: any = {};
    pageTitle: string = PageTitle.viewSampleplan;
    backUrl: string = PageUrls.searchSamplePlan;
    stepName: string = 'ANALYSTS';
    selectedTabIndex: number = 0;
    getSamplesTypes: Array<string>;
    testTypesList: Array<string> = [];
    entityCode: string = EntityCodes.samplePlan;
    showRpts: boolean = false;
    viewObj: any;
    subscription: Subscription = new Subscription();

    constructor(private _service: SamplePlanService, private _actRoute: ActivatedRoute, private _matDailog: MatDialog, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {

        this._actRoute.queryParams.subscribe(param => this.encPlanID = param['id']);

        this.subscription = this._service.samplePlanSubject.subscribe(resp => {
            if (resp.purpose == "viewSamplePlanDetailsByID") {
                this.sampleObj = resp.result;
                let smaples = this.sampleObj.sampling.map(x => x.analysisType);
                this.getSamplesTypes = smaples.filter(function (v, i) { return smaples.indexOf(v) == i; });

                if (this.sampleObj.sampleTestAct.wetIns.length > 0) {
                    var testTypes = this.sampleObj.sampleTestAct.wetIns.map(x => x.testType);
                    this.testTypesList = testTypes.filter(function (v, i) { return testTypes.indexOf(v) == i; })
                }

                this.sampleObj.planning.userPlanDet = CommonMethods.getAnalystOccupancy(this.sampleObj.planning.userPlanDet);

            }
        })

        this._service.viewSamplePlanDetailsByID(this.encPlanID);
        this.tranHistory();
    }

    getAalystsDetails(encUserRoleID: string) {
        const modal = this._matDailog.open(AnalystOccupancyDetailsComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.encUserRoleID = encUserRoleID;
        modal.afterClosed();
    }

    //#region samples

    getSamplesSelectedCount(analysisType: string) {
        var totalCount: number, selecedCount: number;

        if (analysisType == 'SAMPLING')
            selecedCount = this.sampleObj.sampleTestAct && this.sampleObj.sampleTestAct.sam.length;
        else if (analysisType == 'invalidations')
            selecedCount = this.sampleObj.sampleTestAct && this.sampleObj.sampleTestAct.inv.length;
        else if (analysisType == 'oos')
            selecedCount = this.sampleObj.oosTestList && this.sampleObj.oosTestList.length;
        else if (analysisType == 'DR')
            selecedCount = this.sampleObj.drList && this.sampleObj.drList.length;
        else if (analysisType == 'CALIB')
            selecedCount = this.sampleObj.calibList && this.sampleObj.calibList.filter(x => x.conditionCode == "CALIB_ARDS") && this.sampleObj.calibList.filter(x => x.conditionCode == "CALIB_ARDS").length;
        else if (analysisType == 'DAILY_CALIB')
            selecedCount = this.sampleObj.calibList && this.sampleObj.calibList.filter(x => x.conditionCode == "DAILY_CALIB") && this.sampleObj.calibList.filter(x => x.conditionCode == "DAILY_CALIB").length;
        else
            selecedCount = this.sampleObj.sampleTestAct && this.sampleObj.sampleTestAct.wetIns.length;

        if (this.getSamplesTypes && this.getSamplesTypes.includes(analysisType))
            selecedCount = this.sampleObj.sampling.filter(x => x.analysisType == analysisType).length;

        return selecedCount; //+ ' / ' + totalCount;
    }


    //#endregion samples

    //#region sample spec

    getSampleDetails(sampleID: number) {
        var obj: GetSampleDetailsModel = new GetSampleDetailsModel();
        obj = this.sampleObj.sampleSpec.sam.filter(x => x.sampleID == sampleID)[0];

        const modal = this._matDailog.open(ViewSampleDetailsComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.obj = obj;
        modal.afterClosed();
    }

    getSampleSpec(sampleID: number) {
        return this.sampleObj.sampleSpec.samSpe.filter(x => x.sampleID == sampleID);
    }

    //#endregion sample spec


    //#region planning
    selectedTab(type: string) {
        if (type == 'left')
            this.selectedTabIndex = this.selectedTabIndex == 0 ? this.selectedTabIndex : this.selectedTabIndex - 1;
        else
            this.selectedTabIndex = this.selectedTabIndex == 4 ? this.selectedTabIndex : this.selectedTabIndex + 1;

        this.stepName = this.getStepName(this.selectedTabIndex);
    }

    setTabIndex(evt) {
        this.selectedTabIndex = evt;
        this.stepName = this.getStepName(this.selectedTabIndex);
    }

    getStepName(index: number) {
        return index == 0 ? 'ANALYSTS' : index == 1 ? 'SAMPLES' : index == 2 ? 'SPECIFICATIONS' : index == 3 ? 'SAMPLE TEST' : index == 4 ? 'PLANNING' : null;
    }

    //#endregion plnning

    prepareHeaders(type: string) {
        var headersData: Array<any> = [];

        if (type == 'SAMPLES') {
            headersData.push({ columnDef: 'sno', header: 'S. No.', cell: (element: any) => `${element.sno}`, width: 'maxWidth-5per' });
            headersData.push({ "columnDef": 'inwardDate', "header": "Inward Date", cell: (element: any) => `${element.inwardDate}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'arNumber', "header": "AR Number", cell: (element: any) => `${element.arNumber}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'batchNumber', "header": "Batch Number", cell: (element: any) => `${element.batchNumber}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'sampleNumber', "header": "Sample Number", cell: (element: any) => `${element.sampleNumber}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'productName', "header": "Product / Material", cell: (element: any) => `${element.productName}`, width: 'maxWidth-35per' })
            headersData.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}`, width: 'maxWidth-10per' })

        }
        else if (type == 'SAMPLING') {
            headersData.push({ columnDef: "sno", header: "S. No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-5per' });
            headersData.push({ "columnDef": 'sampleNumber', "header": "Sample Number", cell: (element: any) => `${element.sampleNumber}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'arNumbr', "header": "AR Number", cell: (element: any) => `${element.arNumbr}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'invBatchNumber', "header": "Batch Number", cell: (element: any) => `${element.invBatchNumber}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'productName', "header": "Product / Material Name", cell: (element: any) => `${element.productName}`, width: 'maxWidth-30per' })
            headersData.push({ "columnDef": 'labelMinutes', "header": "Analyst Occupancy in Minutes", cell: (element: any) => `${element.minutes}`, width: 'maxWidth-10' })
        }
        else if (type == 'Samples for Analysis') {
            headersData.push({ columnDef: "sno", header: "S. No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-5per' });
            headersData.push({ "columnDef": 'arNumber', "header": "AR Number", cell: (element: any) => `${element.arNumber}`, width: 'maxWidth-10per' })
            // headersData.push({ "columnDef": 'sampleNumber', "header": "Sample Operation Number", cell: (element: any) => `${element.sampleNumber}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'invBatchNumber', "header": "Batch Number", cell: (element: any) => `${element.invBatchNumber}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'productName', "header": "Product / Material Name", cell: (element: any) => `${element.productName}`, width: 'maxWidth-35per' })
            headersData.push({ "columnDef": 'testTitle', "header": "Test Name", cell: (element: any) => `${element.testTitle}`, width: 'maxWidth-35per' })
            headersData.push({ "columnDef": 'analysisType', "header": "Analysis Type", cell: (element: any) => `${element.analysisType}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'labelMinutes', "header": "Analyst Occupancy in Minutes", cell: (element: any) => `${element.minutes}`, width: 'maxWidth-10' })
        }
        else if (type == 'invalidations') {
            headersData.push({ columnDef: "sno", header: "S. No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-5per' });
            headersData.push({ "columnDef": 'invalidationCode', "header": "Invalidation Number", cell: (element: any) => `${element.invalidationCode}`, width: 'minWidth-10per' })
            headersData.push({ "columnDef": 'arNumber', "header": "AR Number", cell: (element: any) => `${element.arNumber}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'invBatchNumber', "header": "Batch Number", cell: (element: any) => `${element.invBatchNumber}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'productName', "header": "Product / Material Name", cell: (element: any) => `${element.productName}`, width: 'maxWidth-35per' })
            headersData.push({ "columnDef": 'invalidationDate', "header": "Date of Invalidation", cell: (element: any) => `${element.invalidationDate}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'labelMinutes', "header": "Analyst Occupancy in Minutes", cell: (element: any) => `${element.minutes}`, width: 'maxWidth-10' })
        }
        else if (type == 'oos') {
            headersData.push({ columnDef: "sno", header: "S. No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-5per' });
            headersData.push({ "columnDef": 'oosNumber', "header": "OOS Number", cell: (element: any) => `${element.oosNumber}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'arNumber', "header": "AR Number", cell: (element: any) => `${element.arNumber}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'invBatchNumber', "header": "Batch Number", cell: (element: any) => `${element.invBatchNumber}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'prodNameCode', "header": "Product / Material Name", cell: (element: any) => `${element.prodNameCode}`, width: 'maxWidth-35per' })
            headersData.push({ "columnDef": 'oosDate', "header": "Date of OOS", cell: (element: any) => `${element.oosDate}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'labelMinutes', "header": "Analyst Occupancy in Minutes", cell: (element: any) => `${element.minutes}`, width: 'maxWidth-10' })
        }
        else if (type == 'DR') {
            headersData.push({ columnDef: "sno", header: "S. No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-5per' });
            headersData.push({ "columnDef": 'requestCode', "header": "Request Code", cell: (element: any) => `${element.requestCode}`, width: 'maxWidth-12per' })
            headersData.push({ "columnDef": 'productName', "header": "Product / Material Name", cell: (element: any) => `${element.productName}`, width: 'maxWidth-35per' })
            headersData.push({ "columnDef": 'testTitle', "header": "Test/Parameter Name", cell: (element: any) => `${element.testTitle}`, width: 'maxWidth-30per' })
            headersData.push({ "columnDef": 'reviewDate', "header": "Date of Send for Review", cell: (element: any) => `${element.reviewDate}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'labelMinutes', "header": "Analyst Occupancy in Minutes", cell: (element: any) => `${element.minutes}`, width: 'maxWidth-10' })
        }
        else if (type == 'CALIB' || type == "DAILY_CALIB") {
            headersData.push({ columnDef: "sno", header: "S. No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-5per' });
            headersData.push({ "columnDef": 'rptNumber', "header": "Request Code", cell: (element: any) => `${element.rptNumber}`, width: 'maxWidth-12per' })
            headersData.push({ "columnDef": 'eqpCode', "header": "Instrument ID", cell: (element: any) => `${element.eqpCode}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'category', "header": "Instrument Type", cell: (element: any) => `${element.category}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'testTitle', "header": "Parameter Name", cell: (element: any) => `${element.testTitle}`, width: 'maxWidth-30per' })
            headersData.push({ "columnDef": 'nextDueDate', "header": "Schedule Date", cell: (element: any) => `${element.nextDueDate}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'labelMinutes', "header": "Analyst Occupancy in Minutes", cell: (element: any) => `${element.minutes}`, width: 'maxWidth-10' })
        }
        else if (type == 'NOT_PLANNING') {
            headersData.push({ columnDef: "sno", header: "S. No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-7per' });
            headersData.push({ "columnDef": 'activity', "header": "Activity Type", cell: (element: any) => `${element.activity}`, width: 'maxWidth-15per' });
            headersData.push({ "columnDef": 'referenceNumber', "header": "Reference Number", cell: (element: any) => `${element.referenceNumber}`, width: 'maxWidth-15per' });
            headersData.push({ "columnDef": 'materialName', "header": "Product / Material Name", cell: (element: any) => `${element.materialName}`, width: 'maxWidth-35per' });
            headersData.push({ "columnDef": 'activityDesc', "header": "Activity Description", cell: (element: any) => `${element.activityDesc}`, width: 'minWidth-15per' });
        }

        else {
            headersData.push({ columnDef: "sno", header: "S. No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-7per' });
            headersData.push({ "columnDef": 'activity', "header": "Activity Type", cell: (element: any) => `${element.activity}`, width: 'maxWidth-15per' });
            headersData.push({ "columnDef": 'referenceNumber', "header": "Reference Number", cell: (element: any) => `${element.referenceNumber}`, width: 'maxWidth-15per' });
            headersData.push({ "columnDef": 'materialName', "header": "Product / Material Name", cell: (element: any) => `${element.materialName}`, width: 'maxWidth-35per' });
            headersData.push({ "columnDef": 'activityDesc', "header": "Activity Description", cell: (element: any) => `${element.activityDesc}`, width: 'minWidth-15per' });
            headersData.push({ "columnDef": 'activitySta', "header": "Activity Status", cell: (element: any) => `${element.activityStatus}`, width: 'maxWidth-15per' });
        }


        return headersData;
    }


    getDataSource(type: string, val: number = 0) {
        var dataSource: any;

        if (type == 'SAMPLING')
            dataSource = this.sampleObj.sampleTestAct ? this.sampleObj.sampleTestAct.sam : "";
        else if (type == 'Samples for Analysis')
            dataSource = this.sampleObj.sampleTestAct.wetIns;
        else if (type == 'invalidations')
            dataSource = this.sampleObj.sampleTestAct ? dateParserFormatter.FormatDate(this.sampleObj.sampleTestAct.inv, 'arrayDateTimeFormat', 'invalidationDate') : "";
        else if (type == 'oos')
            dataSource = this.sampleObj.oosTestList ? dateParserFormatter.FormatDate(this.sampleObj.oosTestList, 'arrayDateTimeFormat', 'oosDate') : "";
        else if (type == 'DR')
            dataSource = this.sampleObj.drList ? dateParserFormatter.FormatDate(this.sampleObj.drList, 'arrayDateTimeFormat', 'reviewDate') : "";
        else if (type == 'CALIB')
            dataSource = this.sampleObj.calibList && this.sampleObj.calibList.filter(x => x.conditionCode == "CALIB_ARDS").length > 0 ? dateParserFormatter.FormatDate(this.sampleObj.calibList.filter(x => x.conditionCode == "CALIB_ARDS"), 'arrayDateFormat', 'nextDueDate') : "";
        else if (type == 'DAILY_CALIB')
            dataSource = this.sampleObj.calibList && this.sampleObj.calibList.filter(x => x.conditionCode == "DAILY_CALIB").length > 0 ? dateParserFormatter.FormatDate(this.sampleObj.calibList.filter(x => x.conditionCode == "DAILY_CALIB"), 'arrayDateFormat', 'nextDueDate') : "";
        else if (type == 'not_planning')
            dataSource = this.sampleObj.planning.plandet.filter(x => !CommonMethods.hasValue(x.userRoleID));
        else if (type == 'planning')
            dataSource = this.sampleObj.planning.plandet.filter(x => x.userRoleID == val);
        else {
            dataSource = this.sampleObj.sampling.filter(x => x.analysisType == type);
            dataSource = dateParserFormatter.FormatDate(dataSource, 'arrayDateFormat', 'inwardDate');
        }

        return CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dataSource));
    }

    getAnalystsList(type: string) {
        if (type == 'AVAILABLE')
            return this.sampleObj && this.sampleObj.analysts && this.sampleObj.analysts.filter(x => CommonMethods.hasValue(x.isAvailable))
        else
            return this.sampleObj && this.sampleObj.analysts && this.sampleObj.analysts.filter(x => !CommonMethods.hasValue(x.isAvailable))
    }

    getAnalystReport(analystID: string) {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.mode = "VIEW";
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(this.entityCode, 0, "REPORT", analystID);
    }

    getSamplesOrder(obj) {
        if (CommonMethods.hasValue(obj)) {
            const data = obj.slice();
            var result = data.sort((a, b) => {
                return (a.count > b.count ? -1 : 1);
            })
            return result;
        }
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encPlanID
        obj.code = EntityCodes.samplePlan;
        this.viewObj = obj;
    }

    getMasterTests(masterTestID: number) {
        if (CommonMethods.hasValue(masterTestID)) {
            var obj = this.sampleObj.sampleTestAct.wetIns.filter(x => x.masterTestID == masterTestID);
            return CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(obj));
        }
        else {
            var obj = this.sampleObj.sampleTestAct.wetIns.filter(x => !CommonMethods.hasValue(x.masterTestID));
            return CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(obj));
        }
    }

    getMasterTestsSelectedCount(masterTestID) {
        var totalCount: number, selecedCount: number;
        if (CommonMethods.hasValue(masterTestID)) {
            var obj = this.sampleObj.sampleTestAct.wetIns.filter(x => x.masterTestID == masterTestID)
            selecedCount = obj.length;
            //selecedCount = obj.filter(x => x.isSelected == true).length;
        }
        else {
            var obj = this.sampleObj.sampleTestAct.wetIns.filter(x => !CommonMethods.hasValue(x.masterTestID))
            selecedCount = obj.length;
            //selecedCount = obj.filter(x => x.isSelected == true).length;
        }
        return selecedCount; //+ ' / ' + totalCount;

    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}