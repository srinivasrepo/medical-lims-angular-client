import { Component, ViewChild } from '@angular/core'
import { Subscription } from 'rxjs'
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { DataReviewService } from '../services/dataReview.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, ActionMessages, PageUrls, EntityCodes, GridActions, ButtonActions, PageTypeSection, CategoryCodeList } from 'src/app/common/services/utilities/constants';
import { GetTestBO, ManageDataReview } from '../modal/dataReviewModal';
import { AppBO, SingleIDBO, CategoryItemList, GetCategoryBO, CategoryItem } from 'src/app/common/services/utilities/commonModels';
import { DataReviewMessages } from '../messages/dataReviewMessages';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { calibrationArdsHeaderBO } from 'src/app/calibrationArds/modal/calibrationArdsModal';
import { AnalysisHeaderBO, ManageAnalysisOccupancyBO, GetCurrentAnalysisBO } from 'src/app/sampleAnalysis/model/sampleAnalysisModel';
import { MatDialog } from '@angular/material';
import { AnalysisOccupancyComponent } from 'src/app/sampleAnalysis/component/analysisOccupancy.component';
import { methodResultsComponent } from 'src/app/sampleAnalysis/component/methodResults.component';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { ApprovalComponent } from 'src/app/approvalProcess/component/approvalProcess.component';
import { select, Store } from '@ngrx/store';
import * as fromAnalysisOptions from 'src/app/sampleAnalysis/state/analysis/analysis.reducer';
import * as analysisActions from 'src/app/sampleAnalysis/state/analysis/analysis.action';
import { ManageAnalysisComponent } from 'src/app/sampleAnalysis/component/manageAnalysis.component';
import { ContainerWiseAnalysisComponent } from 'src/app/sampleAnalysis/component/containerWiseAnalysis.component';

@Component({
    selector: 'mng-data-review',
    templateUrl: '../html/manageDataReview.html'
})

export class ManageDataReviewComponent {

    encReviewID: string;
    sourceID: number
    requestInfo: LookupInfo;
    entityCode: string;
    @ViewChild('requestLkp', { static: false }) requestLkp: LookupComponent;
    testHeader: any;
    testDataSource: any;
    appBo: AppBO = new AppBO();
    pageTitle: string;
    backUrl: string = PageUrls.homeUrl;
    requestTypeCode: string;
    headersData: any;
    headerInfo: calibrationArdsHeaderBO = new calibrationArdsHeaderBO();
    analysisHeader: AnalysisHeaderBO = new AnalysisHeaderBO();
    actions: Array<string> = [GridActions.MNG_OCC, GridActions.Method_Res, GridActions.RAW, GridActions.upload];
    removeActions: any = { headerName: 'rowType', MNG_OCC: 'SUBCAT', METHOD_RES: 'TEST', UPLOAD: 'TEST', RRT: 'TEST', isRRT: true, RAW: 'TEST' }
    requestID: number;
    requestEntityCode: string;
    encSamAnalysisTestID: string;
    btntype: string = ButtonActions.btnGo;
    showHidePageType: string = PageTypeSection.ANALYSIS;
    displayConfirm: boolean = true;
    subscription: Subscription = new Subscription();
    status: string;
    refNo: string;
    viewHistory: TransHistoryBo = new TransHistoryBo();
    viewHistoryVisible: boolean;
    isLoaderStart: boolean;
    packList: any = [];
    totalCatItemList: CategoryItemList;
    assignCatItemList: CategoryItemList = [];
    @ViewChild('samAnalysis', { static: false }) samAnalysis: ManageAnalysisComponent;
    @ViewChild('conAnalysis', { static: false }) conAnalysis: ContainerWiseAnalysisComponent;

    constructor(private _service: DataReviewService, private _alert: AlertService, public _global: GlobalButtonIconsService, private _actRoute: ActivatedRoute, private _matDailog: MatDialog,
        private _confirmService: ConfirmationService, private _router: Router, private _store: Store<fromAnalysisOptions.AnalysisState>, ) {
        this.entityCode = localStorage.getItem('entityCode');
        if (this.entityCode == EntityCodes.dataReview)
            this.pageTitle = PageTitle.manageDataReview;
        else
            this.pageTitle = PageTitle.manageAnalyticalData;
    }

    ngAfterContentInit() {
        this._actRoute.queryParams.subscribe(param => this.encReviewID = param['id']);
        this.subscription = this._service.dataReviewSubject.subscribe(resp => {
            // if (resp.purpose == "ARDS_SOURCES")
            //     this.sourceList = resp.result.filter(x => x.catItemCode == 'SAMANA' || x.catItemCode == 'CALIB');
            if (resp.purpose == "getCatItemsByCatCodeList")
                this.totalCatItemList = resp.result.filter(x => x.catItemCode == 'SAMANA' || x.catItemCode == 'CALIB' || x.catItemCode == 'OOS_TEST');
            else if (resp.purpose == "getTestForReview") {
                this.btntype = ButtonActions.btnChange;
                this.requestLkp.disableBtn = true;
                this.testDataSource = CommonMethods.bindMaterialGridData(resp.result)
            }
            else if (resp.purpose == "getDataReviewData") {
                if (!resp.result.hasReviewAccess && !CommonMethods.hasValue(localStorage.getItem("DATA_REVIEW_PAGE"))) {
                    this._alert.error(DataReviewMessages.onlyAnalystCanPer);
                    this._router.navigateByUrl(PageUrls.homeUrl);
                }
                this.appBo = resp.result.act;
                this.packList = resp.result.packLst;
                this.requestTypeCode = resp.result.requestTypeCode
                this.requestID = resp.result.requestID;
                this.status = resp.result.status;
                this.refNo = resp.result.requestCode;
                this.showHistory();
                if (resp.result.requestTypeCode == 'CALIB')
                    this._service.getCalibrationArdsHeaderInfo(resp.result.requestID);
                else
                    this._service.getAnalysisHeaderInfo(resp.result.requestID);

                this.requestEntityCode = this.requestTypeCode == 'CALIB' ? EntityCodes.calibrationArds : EntityCodes.sampleAnalysis;

                setTimeout(() => {
                    this.samAnalysis.getSampleAnalysisData();
                    if (this.packList && this.packList.length > 0)
                        this.conAnalysis.getList()
                }, 500);
            }
            else if (resp.purpose == "manageDataReviewData") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == 'SUCCESS') {
                    this._alert.success(DataReviewMessages.successData);
                    this.encReviewID = resp.result.encTranKey;
                    this._service.getDataReviewData(this.encReviewID);
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == 'getCalibrationArdsHeaderInfo')
                this.headerInfo = resp.result;
            else if (resp.purpose == "getAnalysisHeaderInfo")
                this.analysisHeader = resp.result;
        })

        if (!CommonMethods.hasValue(this.encReviewID)) {
            var obj: GetCategoryBO = new GetCategoryBO();
            obj.list = CategoryCodeList.GetManageDataReviewCategories();
            obj.type = 'MNG';
            this._service.getCatItemsByCatCodeList(obj);
            this.getRequests();
        }
        else
            this._service.getDataReviewData(this.encReviewID);
        this.changeBgColor('INIT');
        this.prepareHeaders();

        if (CommonMethods.hasValue(localStorage.getItem("DATA_REVIEW_PAGE")) && localStorage.getItem("DATA_REVIEW_PAGE") == 'VIEW') {
            this.displayConfirm = false;
            this.backUrl = PageUrls.searchDataReview;
            if (this.entityCode == EntityCodes.dataReview)
                this.pageTitle = PageTitle.viewDataReview;
            else
                this.pageTitle = PageTitle.viewAnalyticalData;
            this.viewHistory.id = this.encReviewID;
            this.viewHistory.code = this.entityCode;
        }

    }

    getRequests() {
        if (CommonMethods.hasValue(this.requestLkp))
            this.requestLkp.clear();
        var obj: any;
        if (CommonMethods.hasValue(this.sourceID))
            obj = this.totalCatItemList.filter(x => x.catItemID == this.sourceID)
        if (CommonMethods.hasValue(obj) && obj[0].catItemCode == 'CALIB')
            this.requestInfo = CommonMethods.PrepareLookupInfo(LKPTitles.calibrationRef, LookupCodes.calibrationDataReview, LKPDisplayNames.calibCode, LKPDisplayNames.equipmentCode, LookUpDisplayField.header, LKPPlaceholders.calibrationRef);
        else
            this.requestInfo = CommonMethods.PrepareLookupInfo(LKPTitles.arNumber, LookupCodes.analysisDataReview, LKPDisplayNames.arNumber, LKPDisplayNames.batchNumber, LookUpDisplayField.header, LKPPlaceholders.arNumber);
    }

    getTests() {
        if (this.btntype == ButtonActions.btnChange) {
            this.btntype = ButtonActions.btnGo;
            this.requestLkp.disableBtn = false;
            return
        }

        var err: string = this.validation();
        if (CommonMethods.hasValue(err))
            return this._alert.warning(err);

        var obj: GetTestBO = new GetTestBO()
        obj.entityCode = this.entityCode;
        obj.requestID = this.requestLkp.selectedId;
        obj.requestType = this.totalCatItemList.filter(x => x.catItemID == this.sourceID)[0].catItemCode;
        this._service.getTestForReview(obj);
    }

    validation() {
        if (!CommonMethods.hasValue(this.sourceID))
            return DataReviewMessages.requestType;
        var obj = this.totalCatItemList.filter(x => x.catItemID == this.sourceID)
        if (!CommonMethods.hasValue(this.requestLkp.selectedId))
            return obj[0].catItemCode == 'CALIB' ? DataReviewMessages.calibRef : DataReviewMessages.arNum;

    }

    prepareHeaders() {
        this.testHeader = [];
        this.testHeader.push({ "columnDef": 'isSelected', "header": "", cell: (element: any) => `${element.isSelected}`, width: 'maxWidth-5per' })
        this.testHeader.push({ "columnDef": 'testName', "header": "Test/Parameter Name", cell: (element: any) => `${element.testName}` })

        this.headersData = [];
        //this.headersData.push({ columnDef: "isSelected", header: "", cell: (element: any) => `${element.isExclude}`, class: 'hide-chk' });
        this.headersData.push({ columnDef: "srNum", header: "SR Number", cell: (element: any) => `${element.srNum}` });
        this.headersData.push({ columnDef: "testName", header: "Test Name", cell: (element: any) => `${element.testName}` });
        this.headersData.push({ columnDef: "testDesc", header: "Result", cell: (element: any) => `${element.testDesc}` });
        this.headersData.push({ columnDef: "specDesc", header: "Specification Limit", cell: (element: any) => `${element.specDesc}` });
        this.headersData.push({ columnDef: "resultAPP", header: "", cell: (element: any) => `${element.isSelected}` });

    }

    saveRequest() {
        var data = this.testDataSource.data.filter(x => x.isSelected)
        if (data.length == 0)
            return this._alert.warning(DataReviewMessages.selectAtone)
        var obj: ManageDataReview = new ManageDataReview();
        obj.entityCode = this.entityCode;
        obj.requestType = this.sourceID;
        obj.requestID = this.requestLkp.selectedId;
        obj.lst = [];
        this.testDataSource.data.forEach(x => {
            if (x.isSelected) {
                var item: SingleIDBO = new SingleIDBO();
                item.id = x.ardsExecID;
                obj.lst.push(item);
            }
        })
        this._confirmService.confirm(DataReviewMessages.cnfmReq).subscribe(re => {
            if (re) {
                this.isLoaderStart = true;
                this._service.manageDataReviewData(obj);
            }

        })
    }

    getDate(val) {
        return CommonMethods.hasValue(val) ? dateParserFormatter.FormatDate(val, 'date') : 'N / A'
    }

    getyear(val) {
        var date = new Date(val);
        return date.getFullYear() + '-' + (date.getFullYear() + 1).toString().slice(-2);
    }

    changeBgColor(type: string) {
        var docID = document.getElementById('bg_complaints');

        if (CommonMethods.hasValue(docID) && type == 'CLEAR')
            docID.className = '';
        else if (CommonMethods.hasValue(docID) && type != 'CLEAR')
            docID.className = 'blue-light';
    }

    onActionClick(evt) {
        if (evt.action == "MNG_OCC")
            this.openOccupancy(evt.val);
        else if (evt.action == GridActions.Method_Res) {
            const modal = this._matDailog.open(methodResultsComponent, { width: '80%' });
            modal.disableClose = true;
            modal.componentInstance.encSampleAnaTestID = evt.val.samAnaTestID;
            modal.componentInstance.mode = 'VIEW';
            modal.componentInstance.entityCode = this.requestEntityCode;
        }
        else if (evt.action == GridActions.upload) {
            const modal = this._matDailog.open(UploadFiles);
            modal.disableClose = true;
            modal.componentInstance.uploadBO = CommonMethods.BuildUpload(this.requestEntityCode, 0, 'TSTDOCS', evt.val.samAnaTestID, [], 'MEDICAL_LIMS');
            modal.componentInstance.mode = 'VIEW';
        }

        else if (evt.action == GridActions.RAW) {

            this.encSamAnalysisTestID = evt.val.samAnaTestID;
            this.showHidePageType = PageTypeSection.ARDS;
            this._store.dispatch(new analysisActions.UpdateAnalysisPageTypeAction(this.showHidePageType));
        }
    }

    hideRawDataEmit(evt: any) {
        this.encSamAnalysisTestID = "";
        this.showHidePageType = PageTypeSection.ANALYSIS;
    }

    openOccupancy(item: any) {

        var obj: ManageAnalysisOccupancyBO = new ManageAnalysisOccupancyBO();
        obj.encSamAnalTestID = item.samAnaTestID;
        obj.occupancyReq = "Y";
        obj.testInitTime = item.testInitTime;
        obj.entityCode = this.requestEntityCode;

        const modal = this._matDailog.open(AnalysisOccupancyComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.manageOccuBO = obj;
        modal.componentInstance.encEntActID = String(this.requestID);

        modal.componentInstance.mode = 'VIEW';
        modal.componentInstance.isPrimaryInstAdded = item.hasOccSubmitted;

    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encReviewID;
        obj.code = this.entityCode;

        const modal = this._matDailog.open(ApprovalComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBo.detailID, this.encReviewID, this.entityCode,this.appBo.appLevel,this.appBo.initTime);
        modal.componentInstance.transHis = obj;
        modal.afterClosed().subscribe((obj) => {
            if (obj == "OK")
                this._router.navigate(['/lims/home']);
        });
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encReviewID;
        obj.code = this.entityCode;
        this.viewHistory = obj;
    }

    showHistory() {
        if (CommonMethods.hasValue(this.encReviewID)) {
            this.viewHistoryVisible = true;
            this.tranHistory();
        }
        else
            this.viewHistoryVisible = false;
    }

    setTabIndex(index) {
        if (index == 2 && CommonMethods.hasValue(this.conAnalysis))
            this.samAnalysis.getSampleAnalysisData();
        if (CommonMethods.hasValue(this.conAnalysis)) {
            this.conAnalysis.isShow = false;
            this.conAnalysis.containerAnaID = 0;
            this.conAnalysis.packList.forEach(x => x.isActive = false)
        }
    }

    getCatItemList(categoryCode: string) {
        if (this.totalCatItemList && this.totalCatItemList.length > 1)
            return this.totalCatItemList.filter(x => x.category == categoryCode);
        else
            return null;
    }

    ngOnDestroy() {
        this.changeBgColor('CLEAR');
        localStorage.removeItem("DATA_REVIEW_PAGE");
        this.subscription.unsubscribe();
    }
}