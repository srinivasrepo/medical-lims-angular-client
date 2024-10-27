import { Component, ViewChild } from '@angular/core'
import { Subscription } from 'rxjs'
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { PageUrls, EntityCodes, ActionMessages, DCActionCode } from 'src/app/common/services/utilities/constants';
import { CalibrationArdsService } from '../services/calibrationArds.service';
import { Store, select } from '@ngrx/store';
import * as calibArdsActions from '../state/calibrationArds/calibrationArds.action';
import * as fromCalibArdsOptions from '../state/calibrationArds/calibrationArds.reducer';
import * as fromAnalysisOptions from '../../sampleAnalysis/state/analysis/analysis.reducer';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { ActivatedRoute, Router } from '@angular/router';
import { calibrationArdsHeaderBO } from '../modal/calibrationArdsModal';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { MatDialog } from '@angular/material';
import { ApprovalComponent } from 'src/app/approvalProcess/component/approvalProcess.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { SampleAnalysisMessages } from 'src/app/sampleAnalysis/messages/sampleAnalysisMessages';
import { ManageAnalysisComponent } from 'src/app/sampleAnalysis/component/manageAnalysis.component';
import { CalibrationArdsMessages } from '../messages/calibrationArdsMessages';
import { DeviationHandler } from 'src/app/common/component/deviationHandler.component';
import { deviation } from 'src/app/sampleAnalysis/model/sampleAnalysisModel';

@Component({
    selector: 'mng-calib-ards',
    templateUrl: '../html/manageCalibrationArds.html'
})

export class ManageCalibrationArdsComponent {
    subscription: Subscription = new Subscription();
    pageTitle: string = PageTitle.manageCalibrationArds;
    backUrl: string = PageUrls.homeUrl;
    headerInfo: calibrationArdsHeaderBO = new calibrationArdsHeaderBO();
    appBO: AppBO = new AppBO();
    encID: string;
    status: string;
    refNum: string;
    pageType: string = 'MNG';
    isDispay: boolean = true;
    analysisPageType: string = 'MNG';
    showConfirm: boolean = true;
    entityCode: string = EntityCodes.calibrationArds;

    encArdsExecID: string = "";

    showViewHis: boolean = false;
    viewHistory: any;
    @ViewChild('analysis', { static: false }) analysis: ManageAnalysisComponent;

    constructor(private _calibService: CalibrationArdsService, private store: Store<fromCalibArdsOptions.CalibrationArdsState>, private _actRoute: ActivatedRoute,
        private _matDailog: MatDialog, private _route: Router, public _global: GlobalButtonIconsService, private _alert: AlertService) { }

    ngOnInit() {
        this.store
            .pipe(select(fromCalibArdsOptions.getCalibrationArdsInfo))
            .subscribe(calibrationArds => {
                this.headerInfo = calibrationArds;
                if (CommonMethods.hasValue(this.headerInfo) && CommonMethods.hasValue(this.headerInfo.encEqpMinSchID)){
                    this.isRaiseDeviation();
                    this.tranHistory();
                }
            });

        this.store
            .pipe(select(fromCalibArdsOptions.getCalibrationArdsAppInfo))
            .subscribe(calibrationArds => {
                this.appBO = calibrationArds;
                this.status = calibrationArds.status;
                this.refNum = calibrationArds.referenceNumber;
                if (CommonMethods.hasValue(this.appBO.operationType)) {
                    this.pageType = this.appBO.operationType == "MANAGE" && this.pageType == 'MNG' ? 'MNG' : this.pageType != 'MNG' ? this.pageType : this.appBO.operationType;
                    if (CommonMethods.hasValue(this.analysis))
                        this.analysis.pageType = this.pageType;
                }
            });
        this.store
            .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
            .subscribe(testList => {
                if (CommonMethods.hasValue(testList) && testList.length > 0) {
                    var obj = testList.filter(x => x.hasOccSubmitted)
                    if (obj.length > 0) {
                        this.isDispay = false;
                        this.analysisPageType = this.pageType;
                    }
                    else {
                        this.isDispay = true;
                        this.analysisPageType = 'VIEW';
                    }
                }
            });
    }

    ngAfterContentInit() {
        this._actRoute.queryParams.subscribe(param => this.encID = param['id']);
        this.store.dispatch(new calibArdsActions.GetCalibrationArdsHeaderInfo(this.encID));

        this.subscription = this._calibService.calibrationArdsSubject.subscribe(resp => {
            if (resp.purpose == "runCalibration") {
                if (resp.result.returnFlag == "SUCCESS") {
                    this.isDispay = false;
                    this.analysisPageType = 'MNG'
                    this._alert.success(CalibrationArdsMessages.runCalib);
                    this.analysis.pageType = this.analysis.actPageType = this.analysisPageType;
                    this.analysis.getSampleAnalysisData()
                    this.appBO.initTime = resp.result.initTime;
                    this.store.dispatch(new calibArdsActions.UpdateCalibrationArdsAppInfo(this.appBO));
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            if (resp.purpose == DCActionCode.RPT_EXECUTE) {
                if (resp.result == 'OK') {
                    this._alert.success(SampleAnalysisMessages.specReset)
                    this._route.navigateByUrl(PageUrls.homeUrl);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
        })

        this.changeBgColor('INIT');

        setTimeout(() => {


            if (CommonMethods.hasValue(localStorage.getItem('CALIB_PAGE')) && localStorage.getItem('CALIB_PAGE') == 'VIEW') {
                this.analysisPageType = this.pageType = 'VIEW';
                this.showConfirm = false;
                this.backUrl = "/lims/calibArds/search";
                this.pageTitle = PageTitle.viewCalibrationArds;
                this.showViewHis = true;
                this.analysis.pageType = this.analysis.actPageType = 'VIEW'
            }

            else if (this.headerInfo.hasPrimaryOccSubmitted || !CommonMethods.hasValue(this.headerInfo.specNumber)) {
                this.isDispay = false;
                this.analysisPageType = 'MNG'
                this.analysis.pageType = this.analysis.actPageType = 'MNG'
            }
            else {
                this.isDispay = true;
                this.analysisPageType = 'VIEW';
            }
        }, 300);

        setTimeout(() => {
            this.analysis.pageType = this.analysis.actPageType = this.analysisPageType
        }, 1000);
        this.tranHistory();
        this.showHistory();
    }

    isRaiseDeviation() {
        if (CommonMethods.hasValue(localStorage.getItem('CALIB_PAGE')))
            this.pageType = localStorage.getItem('CALIB_PAGE');

        if (this.headerInfo && (this.headerInfo.specResetDeviation == true || this.headerInfo.docStatus == 'FORQAAPP') && this.pageType != 'VIEW') {
            this._alert.error(SampleAnalysisMessages.pendingSpec);
            this._route.navigate([PageUrls.homeUrl]);
        }
        else if (this.headerInfo && this.headerInfo.hasDeviation && this._matDailog.openDialogs.length == 0 && this.pageType != 'VIEW') {
            const dialogRef = this._matDailog.open(DeviationHandler, { width: '60%' });
            dialogRef.disableClose = true;
            dialogRef.componentInstance.entityCode = EntityCodes.calibrationArds;
            dialogRef.componentInstance.dcActionCode = DCActionCode.RPT_EXECUTE;
            dialogRef.afterClosed().subscribe(result => {
                if (result != null && result.CanRiceDeviation) {
                    var obj: deviation = new deviation();
                    obj.encEntityActID = this.encID;
                    obj.entityCode = EntityCodes.calibrationArds;
                    obj.dcActionCode = DCActionCode.RPT_EXECUTE;
                    obj.remarks = result.comments;
                    obj.devType = result.DeviationType;
                    obj.refCode = this.refNum;
                    obj.initTime = this.appBO.initTime;
                    obj.lst = result.lst;
                    this._calibService.raiseDeviation(obj);
                }
                else
                    this._route.navigateByUrl(PageUrls.homeUrl);

            });
        }
    }

    getDate(val) {
        return CommonMethods.hasValue(val) ? dateParserFormatter.FormatDate(val, 'date') : 'N / A'
    }

    getyear(val) {
        var date = new Date(val);
        return date.getFullYear() + '-' + (date.getFullYear() + 1).toString().slice(-2);

        // console.log(val.getFullYear());
    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encID;
        obj.code = EntityCodes.calibrationArds;

        const modal = this._matDailog.open(ApprovalComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.encID, EntityCodes.calibrationArds,this.appBO.appLevel,this.appBO.initTime);
        modal.componentInstance.transHis = obj;
        modal.afterClosed().subscribe((obj) => {
            if (obj == "OK")
                this._route.navigate([PageUrls.homeUrl]);
        });
    }

    changeBgColor(type: string) {
        var docID = document.getElementById('bg_complaints');

        if (CommonMethods.hasValue(docID) && type == 'CLEAR')
            docID.className = '';
        else if (CommonMethods.hasValue(docID) && type != 'CLEAR')
            docID.className = 'blue-light';
    }

    run() {
        var obj: any = { initTime: this.appBO.initTime, encEntActID: this.encID };
        this._calibService.runCalibration(obj);
    }

    getArdsExec(evt) {
        this.encArdsExecID = evt;
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encID;
        obj.code = this.headerInfo.conditionCode;
        this.viewHistory = obj;
    }

    showHistory() {
        if (CommonMethods.hasValue(this.encID)) {
            this.showViewHis = true;
            this.tranHistory();
        }
        else
            this.showViewHis = false;
    }

    updateStatus(status){
        if(CommonMethods.hasValue(status))
            this.status = status;
    }

    ngOnDestroy() {
        this.changeBgColor('CLEAR');
        this.store.dispatch(new calibArdsActions.DestoryCalibInfo());
        this.subscription.unsubscribe();
    }
}