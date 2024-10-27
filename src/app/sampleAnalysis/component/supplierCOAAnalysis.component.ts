import { Component, Input, Output, EventEmitter } from '@angular/core'
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { Subscription } from 'rxjs';
import { ButtonActions, EntityCodes, ActionMessages } from 'src/app/common/services/utilities/constants';
import { SupplierCOADetails, AnalysisHeaderBO } from '../model/sampleAnalysisModel';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { MatDialog } from '@angular/material';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { Store, select } from '@ngrx/store';
import * as analysisActions from '../state/analysis/analysis.action';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import { checklistComponent } from 'src/app/common/component/checklist.component';

@Component({
    selector: 'sup-coa',
    templateUrl: '../html/supplierCOAAnalysis.html'
})

export class SupplierCOAAnalysisComponent {

    @Input() pageType: string = 'MNG';

    subscription: Subscription = new Subscription();
    coaDet: SupplierCOADetails = new SupplierCOADetails();
    testDate: any;
    minDate: Date = new Date();
    btnType: string = ButtonActions.btnSave;
    btnDisabledReq: boolean = false;
    btnUpload: string = ButtonActions.btnUpload;
    appBo: AppBO = new AppBO();
    headerInfo: AnalysisHeaderBO = new AnalysisHeaderBO();
    encIoID: string;
    isLoaderStart : boolean;

    constructor(private _saService: SampleAnalysisService, private _alert: AlertService, private _matDailog: MatDialog, private _global: GlobalButtonIconsService,
        private store: Store<fromAnalysisOptions.AnalysisState>) { }

    ngOnInit() {
        this.store
            .pipe(select(fromAnalysisOptions.getAnalysisInfo))
            .subscribe(analysis => {
                this.headerInfo = analysis;
            });

        this.store
            .pipe(select(fromAnalysisOptions.getAnalysisAppInfo))
            .subscribe(analysis => {
                this.appBo = analysis;
            });
    }

    ngAfterContentInit() {
        this.subscription = this._saService.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getSupplierCOADetails") {
                this.coaDet = resp.result;
                this.testDate = resp.result.supRetestExpiryDate;
                //this.appBo = resp.result.act;
                this.enableHeaders(!CommonMethods.hasValue(this.coaDet.sampledBy));
            }

            else if (resp.purpose == "manageSupplierCOADetails") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == 'SUCCESS') {
                    this.appBo.initTime = resp.result.initTime;
                    this.enableHeaders(false);
                    this._alert.success(SampleAnalysisMessages.coaSuccess);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
                this.btnDisabledReq = false;
            }
            else if (resp.purpose == "getSamplingInfo")
                this.encIoID = resp.result.encIoID;

        })
        this.getSuppCOA();

    }

    getSuppCOA() {
        if (CommonMethods.hasValue(this.appBo.encTranKey) && !CommonMethods.hasValue(this.coaDet.sampledBy)) {
            this._saService.getSupplierCOADetails(this.appBo.encTranKey)
            this._saService.getSamplingInfo(this.appBo.encTranKey);
        }

    }

    enableHeaders(val) {
        this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.btnUpload = val ? ButtonActions.btnUpload : ButtonActions.btnViewFiles;
        this.appBo.showConfirmBtn = !val && CommonMethods.hasValue(this.coaDet.remarks) ? true : false;;
        this.store.dispatch(new analysisActions.UpdateAnalysisAppInfo(this.appBo));

    }

    saveCOADetails() {
        if (this.btnType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);
        this.btnDisabledReq = true;

        var errMsg = this.validations();
        if (CommonMethods.hasValue(errMsg)) {
            this.btnDisabledReq = false;
            return this._alert.warning(errMsg);
        }

        this.coaDet.encSioID = this.appBo.encTranKey;
        this.coaDet.initTime = this.appBo.initTime;
        this.coaDet.encSamAnalysisID = this.headerInfo.encSamAnaID;
        this.coaDet.supRetestExpiryDate = dateParserFormatter.FormatDate(this.testDate, 'date');
        this.isLoaderStart = true;
        this._saService.manageSupplierCOADetails(this.coaDet);
    }

    validations() {
        if (!CommonMethods.hasValue(this.coaDet.sampledBy))
            return SampleAnalysisMessages.sampleBy
        if (!CommonMethods.hasValue(this.coaDet.sampleResult))
            return SampleAnalysisMessages.result;
        if (!CommonMethods.hasValue(this.coaDet.supRetestExpiryTypeValue))
            return SampleAnalysisMessages.type;
        if (!CommonMethods.hasValue(this.testDate))
            return SampleAnalysisMessages.date;
        if (!CommonMethods.hasValue(this.coaDet.remarks))
            return SampleAnalysisMessages.remarks;
    }

    Uploadfiles() {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.sampleAnalysis, 0, 'COASAMANA', this.headerInfo.encSamAnaID, [], 'MEDICAL_LIMS', this.appBo.referenceNumber);
        modal.componentInstance.mode = this.pageType == 'MNG' ? this.btnUpload == ButtonActions.btnViewFiles ? 'VIEW' : 'MANAGE' : 'VIEW';
    }

    UploadfilesPreInsp() {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload('MATIN', 0, 'PREINSP', this.encIoID, [], 'MEDICALLIMS');
        modal.componentInstance.mode = 'VIEW';
    }

    allowAlphabets(evt) {
        return CommonMethods.allowAlphabets(evt);
    }

    globalIcons(type: string) {
        if (type == 'UPLOAD')
            return this._global.icnUpload;
        else if (type == 'VIEW')
            return this._global.icnView;
        else if (type == 'SAVE')
            return this._global.icnSave;
    }

    openChecklist() {
        const modal = this._matDailog.open(checklistComponent, { width: '80%' });
        modal.disableClose = true;
        modal.componentInstance.encEntityActID = this.appBo.encTranKey;
        modal.componentInstance.categoryCode = this.headerInfo.checkListCategory;
        modal.componentInstance.type = this.pageType == 'MNG' && this.btnType == ButtonActions.btnSave ? 'MANAGE' : 'VIEW';
        modal.componentInstance.entityCode = EntityCodes.sampleAnalysis;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}