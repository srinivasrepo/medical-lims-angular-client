import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { Subscription } from 'rxjs';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { CommonMethods, CustomLocalStorage, LOCALSTORAGE_KEYS, LOCALSTORAGE_VALUES } from 'src/app/common/services/utilities/commonmethods';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { MatDialog } from '@angular/material';
import { ApprovalComponent } from 'src/app/approvalProcess/component/approvalProcess.component';
import { EntityCodes, PageUrls, DCActionCode, ActionMessages } from 'src/app/common/services/utilities/constants';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { Store, select } from '@ngrx/store';
import * as analysisActions from '../state/analysis/analysis.action';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import { AnalysisHeaderBO, deviation } from '../model/sampleAnalysisModel';
import { AlertService } from 'src/app/common/services/alert.service';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { DeviationHandler } from 'src/app/common/component/deviationHandler.component';
import { ManageAnalysisComponent } from './manageAnalysis.component';
import { ContainerWiseAnalysisComponent } from './containerWiseAnalysis.component';



@Component({
    selector: 'mng-sam-anly',
    templateUrl: '../html/manageSampleAnalysis.html'
})

export class ManageSampleAnalysisComponent implements OnInit {

    subscription: Subscription = new Subscription();
    pageTitle: string = PageTitle.manageSampleAnalysis;
    encSioID: string;
    appBO: AppBO = new AppBO();
    backUrl: string = PageUrls.homeUrl;
    headerInfo: AnalysisHeaderBO = new AnalysisHeaderBO();
    getArdsInputsInfo: any;
    @ViewChild('samAnalysis', { static: false }) samAnalysis: ManageAnalysisComponent;
    @ViewChild('conAnalysis', { static: false }) conAnalysis: ContainerWiseAnalysisComponent;
    containerWiseAnalysisApp: string = 'No';
    pageType: string = 'MNG';
    showHistory: boolean = false;
    viewHistory: TransHistoryBo = new TransHistoryBo();;
    encArdsExecID: string = "";
    entityCode: string = EntityCodes.sampleAnalysis;

    constructor(private _saService: SampleAnalysisService, private _modal: MatDialog, private _actRoute: ActivatedRoute,
        private _router: Router, public _global: GlobalButtonIconsService,
        private _alert: AlertService,
        private store: Store<fromAnalysisOptions.AnalysisState>) { }

    ngOnInit() {


        this.store
            .pipe(select(fromAnalysisOptions.getAnalysisInfo))
            .subscribe(analysis => {
                this.headerInfo = analysis;
                if (CommonMethods.hasValue(this.headerInfo) && CommonMethods.hasValue(this.headerInfo.arID)) {
                    this.viewHistory.id = this.headerInfo.encSamAnaID;
                    this.encSioID = analysis.act.encTranKey;
                    this.showViewHistory();
                    this.validation();
                    if (this.headerInfo.statusCode == 'APP' || this.headerInfo.statusCode == 'REJ')
                        this.backUrl = "/lims/sampleAnalysis/search";
                }
            });

        this.store
            .pipe(select(fromAnalysisOptions.getAnalysisAppInfo))
            .subscribe(analysis => {
                this.appBO = analysis;
            });

        this.store
            .pipe(select(fromAnalysisOptions.getArdsHeaderDataInfo))
            .subscribe(getArdsInputsInfo => {
                this.getArdsInputsInfo = getArdsInputsInfo
            });
    }

    ngAfterContentInit() {
        this._actRoute.queryParams.subscribe(param => this.encSioID = param['id']);

        this.subscription = this._saService.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == DCActionCode.STB_ANA_DT_EXP) {
                if (resp.result == 'OK') {
                    this._alert.success(SampleAnalysisMessages.specReset)
                    this._router.navigateByUrl(PageUrls.homeUrl);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == "getSamplingInfo") {
                this.containerWiseAnalysisApp = resp.result.containerAnalysisApplicable;
            }
        })

        this.changeBgColor('INIT');
        this.store.dispatch(new analysisActions.GetAnalysisInfo(this.encSioID));
        //this._saService.getAnalysisHeaderInfo(this.encSioID);
        //this.store.dispatch(fromAnalysisOptions.addTodo({ payload: item }));
        if (CommonMethods.hasValue(localStorage.getItem('SAM_PAGE')) && localStorage.getItem('SAM_PAGE') == 'VIEW') {
            this.pageType = 'VIEW';
            this.pageTitle = PageTitle.viewSampleAnalysis;
            this.backUrl = "/lims/sampleAnalysis/search";
            this.showHistory = true;
            this.viewHistory.id = this.headerInfo.encSamAnaID;
            this.viewHistory.code = 'SAMPLE_ANALYSIS';
        }
        else if (localStorage.getItem('SAM_PAGE') == 'UPD') {
            this.pageType = 'UPD';
        }
    }

    validation() {

        if (CommonMethods.hasValue(localStorage.getItem('SAM_PAGE')))
            this.pageType = localStorage.getItem('SAM_PAGE');
        if (this.pageType != "VIEW") {
            if (!CommonMethods.hasValue(this.headerInfo.canAccess)) {
                this._alert.error(ActionMessages.GetMessageByCode('ANALYST_CAN_PERFORM'));
                return this._router.navigateByUrl(PageUrls.homeUrl);
            }
            if (this.headerInfo.statusCode != 'APP' && this.pageType != 'VIEW' && this.headerInfo.statusCode != 'REJ' && this.headerInfo.isResetPending || this.headerInfo.retCode == "PENDING_FROM_QA" || (CommonMethods.hasValue(this.headerInfo.updRemarksStatus) && this.headerInfo.updRemarksStatus != 'APP')) {
                this._alert.error(SampleAnalysisMessages.pendingSpec);
                this._router.navigateByUrl(PageUrls.homeUrl);
            }
            else if (this.headerInfo.retCode == 'PREV_SAMPL_NOTCOMLITED' && this.headerInfo.statusCode != 'APP' && this.headerInfo.statusCode != 'REJ' && this.pageType != 'VIEW') {
                this._alert.error(SampleAnalysisMessages.prevSampleNot);
                this._router.navigateByUrl(PageUrls.homeUrl);
            }
            else if (this.headerInfo.retCode == 'STB_ANA_DT_EXP' && this.headerInfo.statusCode != 'APP' && this.headerInfo.statusCode != 'REJ' && this.pageType != 'VIEW' && this._modal.openDialogs.length == 0) {
                const dialogRef = this._modal.open(DeviationHandler, { width: '60%' });
                dialogRef.disableClose = true;
                dialogRef.componentInstance.entityCode = 'SAMPINOUT';
                dialogRef.componentInstance.dcActionCode = DCActionCode.STB_ANA_DT_EXP;
                dialogRef.afterClosed().subscribe(result => {
                    if (result != null && result.CanRiceDeviation) {
                        var obj: deviation = new deviation();
                        obj.encEntityActID = this.encSioID;
                        obj.entityCode = 'SAMPINOUT';
                        obj.dcActionCode = DCActionCode.STB_ANA_DT_EXP;
                        obj.remarks = result.comments;
                        obj.devType = result.DeviationType;
                        obj.refCode = this.headerInfo.arNumber;
                        obj.initTime = this.appBO.initTime;
                        obj.lst = result.lst;
                        this._saService.raiseDeviation(obj);
                    }
                    else
                        this._router.navigateByUrl(PageUrls.homeUrl);

                });
            }
        }
    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.headerInfo.encSamAnaID;
        obj.code = 'SAMPLE_ANALYSIS';

        const modal = this._modal.open(ApprovalComponent);
        modal.disableClose = true;
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.encSioID, EntityCodes.sampleAnalysis,this.appBO.appLevel,this.appBO.initTime);
        modal.componentInstance.transHis = obj;

        modal.afterClosed().subscribe(re => {
            if (re == 'OK')
                this._router.navigateByUrl(PageUrls.homeUrl);
        })

    }

    setTabIndex(index) {
        this.headerInfo.currentTab = index == 0 ? 'SAMP' : index == 1 ? 'SAMP_INFO' : index == 2 ? 'ARDS' : index == 3 ? 'ANALY' : 'SAMP';
        this.store.dispatch(new analysisActions.UpdateAnalysisInfo(this.headerInfo));
        if (index == 4)
            this.getTests();
        if (CommonMethods.hasValue(this.conAnalysis)) {
            this.conAnalysis.isShow = false;
            this.conAnalysis.containerAnaID = 0;
            this.conAnalysis.packList.forEach(x => x.isActive = false)
        }

        this.encArdsExecID = null;
    }

    showConfirm() {
        return (this.appBO.canApprove && this.appBO.showConfirmBtn)
    }

    changeBgColor(type: string) {
        var docID = document.getElementById('bg_complaints');

        if (CommonMethods.hasValue(docID) && type == 'CLEAR')
            docID.className = '';
        else if (CommonMethods.hasValue(docID) && type != 'CLEAR')
            docID.className = 'blue-light';
    }

    getTests() {
        this.samAnalysis.getSampleAnalysisData()
    }

    getArdsExec(evt) {
        // RS232 OFF AGAINEST TO SPEC TEST 
        this.encArdsExecID = evt;
    }

    tabChanged(evt) {

        if (evt.tab.textLabel == 'Sampling') {
            CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE, LOCALSTORAGE_VALUES.RS232_SAMPLING);
            CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.RS232_SEC_CLICK, LOCALSTORAGE_VALUES.ON);
        }
        else if (evt.tab.textLabel == 'Container Wise Analysis')
            CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE, LOCALSTORAGE_VALUES.RS232_CON_WISE);
        else if (evt.tab.textLabel == 'Analysis')
            CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE, LOCALSTORAGE_VALUES.RS232_ANALYSIS);

        this.encArdsExecID = evt.tab.textLabel == 'Sampling' ? this.encSioID : (evt.tab.textLabel == 'Container Wise Analysis' || evt.tab.textLabel == 'Analysis') ? this.encArdsExecID : null;
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.headerInfo.encSamAnaID;
        obj.code = 'SAMPLE_ANALYSIS';
        this.viewHistory = obj;
    }

    showViewHistory() {
        if (CommonMethods.hasValue(this.headerInfo.encSamAnaID)) {
            this.showHistory = true;
            this.tranHistory();
        }
        else
            this.showHistory = false;
    }

    ngOnDestroy() {
        this.changeBgColor('CLEAR');
        this.subscription.unsubscribe();
        this.store.dispatch(new analysisActions.DestoryAnalysisInfo());
        CustomLocalStorage.removeItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE);
    }
}