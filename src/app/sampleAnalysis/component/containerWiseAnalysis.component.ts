import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { Subscription } from 'rxjs';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { Store, select } from '@ngrx/store';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import * as analysisActions from '../state/analysis/analysis.action';
import { AnalysisHeaderBO, deviation, SkipPacks } from '../model/sampleAnalysisModel';
import { DCActionCode, EntityCodes, PageUrls, ActionMessages, CapabilityActions } from 'src/app/common/services/utilities/constants';
import { DeviationHandler } from 'src/app/common/component/deviationHandler.component';
import { MatDialog } from '@angular/material/dialog';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { Router } from '@angular/router';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { AppBO, SingleIDBO } from 'src/app/common/services/utilities/commonModels';
import { ManageAnalysisComponent } from './manageAnalysis.component';

@Component({
    selector: 'con-ana',
    templateUrl: '../html/containerWiseAnalysis.html'
})

export class ContainerWiseAnalysisComponent implements OnInit {

    @Input('encSioID') encSioID: string;
    @Input() pageType: string = 'MNG';
    subscription: Subscription = new Subscription()
    isShow: boolean = false;
    containerAnaID: number;
    packList: any;
    headerInfo: AnalysisHeaderBO = new AnalysisHeaderBO();
    analysisMode: string;
    showSpecRest: boolean = false;
    @Output() emitArdsExecID: EventEmitter<any> = new EventEmitter();
    allSelect: boolean = false;
    appBO: AppBO = new AppBO();
    isLoaderStartObj = { isLoaderStartForSkip: false, isLoaderStartSpecReset: false };
    @ViewChild('samAnalysis', { static: false }) samAnalysis: ManageAnalysisComponent;

    constructor(private _service: SampleAnalysisService, private _store: Store<fromAnalysisOptions.AnalysisState>,
        private _matDailog: MatDialog, public _global: GlobalButtonIconsService, private _limsTitle: LIMSContextServices,
        private _alert: AlertService, private _router: Router) { }


    ngOnInit() {
        this._store
            .pipe(select(fromAnalysisOptions.getAnalysisAppInfo))
            .subscribe(appBOInfo => {
                this.appBO = appBOInfo;
            });

        this._store
            .pipe(select(fromAnalysisOptions.getAnalysisInfo))
            .subscribe(analysisInfo => {
                this.headerInfo = analysisInfo
            });
    }


    ngAfterContentInit() {
        this.subscription = this._service.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getContainerWiseAnalysis") {
                this.packList = resp.result.packList;
                this.analysisMode = resp.result.analysisMode;
                this.packList.forEach(x => x.isSkipedFromAnalysis = false);
                var capActions: CapabilityActions = this._limsTitle.getSearchActinsByEntityCode(EntityCodes.sampleAnalysis);
                var obj = capActions.actionList.filter(x => x == 'RESET');
                if (CommonMethods.hasValue(this.analysisMode) && obj.length > 0)
                    this.showSpecRest = true;
                this.selectSingle()
            }
            else if (resp.purpose == DCActionCode.LIMS_CONTAINER_SPEC_RESET) {
                this.isLoaderStartObj.isLoaderStartSpecReset = false;
                if (resp.result == 'OK') {
                    this._alert.success(SampleAnalysisMessages.specReset);
                    if (this.headerInfo.statusCode != 'APP')
                        this._router.navigateByUrl(PageUrls.homeUrl);
                    else
                        this._router.navigateByUrl('/lims/sampleAnalysis')
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == "skipPacksFromAnalysis") {
                this.isLoaderStartObj.isLoaderStartForSkip = false;
                if (resp.result.returnFlag == 'SUCCESS') {
                    this._alert.success(SampleAnalysisMessages.skipSucc);
                    this.appBO.initTime = resp.result.initTime;
                    this._store.dispatch(new analysisActions.UpdateAnalysisAppInfo(this.appBO));
                    this.getAnalysis(this.containerAnaID);
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag))
            }
        })
    }

    getAnalysis(id) {
        this._service.getContainerWiseAnalysis(this.encSioID);
        if (CommonMethods.hasValue(id)) {
            this.isShow = false;
            setTimeout(() => {
                this.isShow = true;
                this.containerAnaID = id;
                this.packList.forEach(x => { if (x.continerAnalysisID == id) x.isActive = true; else x.isActive = false });
                if (CommonMethods.hasValue(this.samAnalysis)) {
                    this.samAnalysis.sourceCode = 'CONT_WISE_ANA';
                    this.samAnalysis.getSampleAnalysisData();
                }
                else
                    this._service.getAnalysisTestBySioID(id, 'CONT_WISE_ANA');
            }, 200);
        }
    }

    getClass(statusCode: string) {
        var cls: string = ''
        cls = statusCode == 'APP' ? 'pack-app' : statusCode == 'REJ' ? 'pack-rej' : '';
        if (CommonMethods.hasValue(this.containerAnaID))
            this.packList.forEach(x => { if (x.continerAnalysisID == this.containerAnaID) x.isActive = true; else x.isActive = false });
        return cls;
    }

    skipAnalysis() {
        var obj = this.packList.filter(x => x.isSkipedFromAnalysis);
        if (!CommonMethods.hasValue(obj) || obj.length == 0)
            return this._alert.warning(SampleAnalysisMessages.skipPack);

        var skipObj: SkipPacks = new SkipPacks();
        skipObj.encSioID = this.encSioID;
        skipObj.initTime = this.appBO.initTime;
        skipObj.list = [];
        this.packList.forEach(x => {
            if (x.isSkipedFromAnalysis) {
                var item: SingleIDBO = new SingleIDBO();
                item.id = x.continerAnalysisID;
                skipObj.list.push(item);
            }
        })
        this.isLoaderStartObj.isLoaderStartForSkip = true;
        this._service.skipPacksFromAnalysis(skipObj);
    }

    specReset() {
        this.raiseDeviation(DCActionCode.LIMS_CONTAINER_SPEC_RESET);
    }

    raiseDeviation(dcActionCode: string) {
        const dialogRef = this._matDailog.open(DeviationHandler, { width: '80%' });
        dialogRef.disableClose = true;
        dialogRef.componentInstance.entityCode = EntityCodes.sampleAnalysis;
        dialogRef.componentInstance.dcActionCode = dcActionCode;

        dialogRef.afterClosed().subscribe(result => {
            if (result != null && result.CanRiceDeviation) {
                var obj: deviation = new deviation();
                obj.encEntityActID = this.encSioID;
                obj.entityCode = EntityCodes.sampleAnalysis;
                obj.dcActionCode = dcActionCode;
                obj.remarks = result.comments;
                obj.devType = result.DeviationType;
                obj.refCode = this.headerInfo.arNumber;
                obj.initTime = this.appBO.initTime;
                obj.lst = result.lst;
                this.isLoaderStartObj.isLoaderStartSpecReset = true;
                this._service.raiseDeviation(obj);
            }
        });
    }

    getArdsExcuID(evt) {
        this.emitArdsExecID.emit(evt);
    }

    selectAll(evt) {
        this.packList.forEach(x => x.isSkipedFromAnalysis = evt);
    }

    selectSingle() {
        var obj = this.packList.filter(x => !x.isSkipedFromAnalysis);
        if (!CommonMethods.hasValue(obj) || obj.length == 0)
            this.allSelect = true;
        else this.allSelect = false;

    }

    getList() {
        this._service.getContainerWiseAnalysis(this.encSioID)
    }

    getIcon(status) {
        if (status == 'QA_COM')
            return 'fas fa-check-double';
        else if (status == 'QC_COM')
            return 'fas fa-user-check'
        else if (status == 'UND_REV')
            return 'fas fa-user-edit'
        else if (status == 'RES_COM')
            return 'far fa-registered'
        else
            return ''
    }

    getIconTooltip(status) {
        if (status == 'QA_COM')
            return 'QA Review Completed';
        else if (status == 'QC_COM')
            return 'QC Review Completed'
        else if (status == 'UND_REV')
            return 'Review Under Process'
        else if (status == 'RES_COM')
            return 'Result Submitted'
        else
            return ''
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}