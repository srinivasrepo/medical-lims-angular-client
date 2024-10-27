import { Component, OnDestroy, Input, Output, EventEmitter } from "@angular/core";
import { Subscription } from 'rxjs';
import * as analysisActions from '../state/analysis/analysis.action';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import { Store, select } from '@ngrx/store';
import { GetArdsHeadersBO, FormulaData } from '../model/sampleAnalysisModel';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { AlertService } from 'src/app/common/services/alert.service';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { ActionMessages, PageTypeSection, DCActionCode, EntityCodes } from 'src/app/common/services/utilities/constants';
import { MatDialog } from '@angular/material';
import { ArdsCommonDataMapping } from './ArdsMappingCommonData.component';
import { InvalidateBO } from 'src/app/volumetricSolution/model/volumetricSolModel';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { VolumetricSolMessages } from 'src/app/volumetricSolution/messages/volumetricSolMessages';

@Component({
    selector: 'app-rawData',
    templateUrl: '../html/rawDataHeader.html'
})
export class RawDataHeaderComponent implements OnDestroy {

    @Input() encSamAnalysisTestID: string;
    @Output() hideRawDataEmitter: EventEmitter<any> = new EventEmitter();
    @Input() entityCode: string;
    @Input() sourceCode: string;
    @Input() pageType: string = 'MNG';
    @Input() analysisMode: string;
    @Input() refNo: string;
    @Input() updTestStatus: string;

    getArdsInputsInfo: GetArdsHeadersBO = new GetArdsHeadersBO();
    getTestInfo: any;

    subscription: Subscription = new Subscription();
    occSub: boolean;

    isInvalidated: string;
    showHidePageType: PageTypeSection = PageTypeSection.ARDS;


    constructor(private store: Store<fromAnalysisOptions.AnalysisState>, public _global: GlobalButtonIconsService, private _alert: AlertService, private _service: SampleAnalysisService,
        private _matDialog: MatDialog, private _confirService: ConfirmationService) { }

    ngOnInit() {
        this.store
            .pipe(select(fromAnalysisOptions.getArdsHeaderDataInfo))
            .subscribe(getArdsInputsInfo => {
                this.getArdsInputsInfo = getArdsInputsInfo;
            });
        this.store
            .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
            .subscribe(getTestInfo => {
                this.getTestInfo = getTestInfo
                if (this.getTestInfo.length > 0) {
                    var obj = this.getTestInfo.filter(x => x.samAnaTestID == this.encSamAnalysisTestID)
                    if (obj && obj.length > 0)
                        this.occSub = obj[0].hasOccSubmitted;
                }
            });

        this.store
            .pipe(select(fromAnalysisOptions.GetAnalysisPageTypeAction))
            .subscribe(pageType => {
                this.showHidePageType = pageType;
            });

        this.store
            .pipe(select(fromAnalysisOptions.GetArdsTabInfo))
            .subscribe(pageType => {
                this.isInvalidated = localStorage.getItem('IS_INVALIDATED');
            });

        this.isInvalidated = localStorage.getItem('IS_INVALIDATED');

    }

    ngAfterContentInit() {
        this.subscription = this._service.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == 'confirmEArds') {
                if (resp.result.returnFlag == 'OK') {
                    var obj = this.getTestInfo.filter(x => x.samAnaTestID == this.encSamAnalysisTestID)
                    if (CommonMethods.hasValue(obj) && obj.length > 0) {
                        obj[0].testInitTime = resp.result.initTime;
                        obj[0].rawdataConfOn = resp.result.rawConfOn;
                        this.store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.getTestInfo));
                        this._alert.success(SampleAnalysisMessages.eardsConfirm);
                        this.close();
                    }
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == DCActionCode.SAMANA_TEST_UPD) {
                if (resp.result == 'OK') {
                    this._alert.success(SampleAnalysisMessages.specReset)
                    this.close();
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
        })

        if (CommonMethods.hasValue(this.encSamAnalysisTestID)) {
            this.store.dispatch(new analysisActions.GetArdsInputsInfo(this.encSamAnalysisTestID, CommonMethods.hasValue(this.sourceCode) ? this.sourceCode : CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode)));
        }
        this.store
            .pipe(select(fromAnalysisOptions.getArdsInputsSectionListInfo))
            .subscribe(getArdsInputsInfo => {
                this.getArdsInputsInfo.sectionList = getArdsInputsInfo
            });

        this.store
            .pipe(select(fromAnalysisOptions.getArdsInputsSectionDetailsListInfo))
            .subscribe(getArdsInputsInfo => {
                this.getArdsInputsInfo.sectionDataList = getArdsInputsInfo
            });

    }

    close() {
        if (this.showHidePageType == PageTypeSection.ARDS)
            this.showHidePageType = PageTypeSection.ANALYSIS;
        else
            this.showHidePageType = PageTypeSection.ARDS;

        this.store.dispatch(new analysisActions.UpdateAnalysisPageTypeAction(this.showHidePageType));
        this.hideRawDataEmitter.emit();
    }

    confirm() {
        var obj = this.getArdsInputsInfo.sectionDataList.filter(x => (!CommonMethods.hasValueWithZero(x.value) && x.inputType != 'MEDICALLIMS' && !CommonMethods.hasValue(x.invalidationID) && (!CommonMethods.hasValue(x.skipType) || x.skipType == 'DG' || x.skipType == 'REG')))
        if (obj.length > 0 && obj[0].inputType != 'FRMLA')
            return this._alert.warning(SampleAnalysisMessages.provideValue + obj[0].inputDescription + "' parameter, to proceed further action");
        else if (obj.length > 0 && obj[0].inputType == 'FRMLA')
            return this._alert.warning(SampleAnalysisMessages.execFormu + obj[0].inputDescription + "' formula, to proceed further action");
        obj = this.getArdsInputsInfo.sectionDataList.filter(x => CommonMethods.hasValue(x.updateFlag) && x.updateFlag == 'UPD' && x.inputType != 'MEDICALLIMS' && !CommonMethods.hasValue(x.invalidationID) && (!CommonMethods.hasValue(x.skipType) || x.skipType == 'DG' || x.skipType == 'REG'))
        if (obj.length > 0)
            return this._alert.warning(SampleAnalysisMessages.provideReExe + obj[0].inputDescription + "' formula, to proceed further action");
        var data: FormulaData = new FormulaData();
        if (!CommonMethods.hasValue(this.sourceCode))
            data.sourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode);
        else
            data.sourceCode = this.sourceCode;
        data.entityCode = this.entityCode
        data.samAnaTestID = Number(this.encSamAnalysisTestID);
        var test = this.getTestInfo.filter(x => x.samAnaTestID == this.encSamAnalysisTestID)
        data.initTime = test[0].testInitTime;
        this._service.confirmEArds(data);
    }

    getDateTime(val) {
        return CommonMethods.hasValue(val) ? dateParserFormatter.FormatDate(val, 'datetime') : 'N / A';
    }

    mappingSDMS() {
        this.showHidePageType = PageTypeSection.MAPPING_ARDS;
        this.store.dispatch(new analysisActions.UpdateAnalysisPageTypeAction(this.showHidePageType));
    }

    commonDataMap() {
        var test = this.getTestInfo.filter(x => x.samAnaTestID == this.encSamAnalysisTestID)
        const dialog = this._matDialog.open(ArdsCommonDataMapping, CommonMethods.modalFullWidth)
        dialog.disableClose = true;
        dialog.componentInstance.entityCode = this.entityCode;
        dialog.componentInstance.initTime = test[0].testInitTime;
        dialog.componentInstance.ardsExecID = this.encSamAnalysisTestID;
        dialog.afterClosed().subscribe(resp => {
            if (resp)
                this.store.dispatch(new analysisActions.GetArdsInputsInfo(this.encSamAnalysisTestID, CommonMethods.hasValue(this.sourceCode) ? this.sourceCode : CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode)));

        })
    }

    raiseInvalidation() {
        var test = this.getTestInfo.filter(x => x.samAnaTestID == this.encSamAnalysisTestID)
        if (CommonMethods.hasValue(test[0].hasOOS))
            return this._alert.warning(SampleAnalysisMessages.oosRaised)
        var obj: InvalidateBO = new InvalidateBO();
        obj.encSolutionID = this.encSamAnalysisTestID;
        obj.stdType = this.entityCode == EntityCodes.sampleAnalysis ? 'INVAL_SAMANA' : this.entityCode == EntityCodes.oosModule ? 'INVAL_OOS' : 'INVAL_CALIB';
        obj.initTime = test[0].testInitTime;

        this._confirService.confirm(VolumetricSolMessages.confirmStndInvalidate).subscribe((confirmed) => {
            if (confirmed)
                this._service.invalidateTest(obj);

        })
    }


    // getMappingDetails() {
    //     this._service.getSDMSDataBySamAnaTestID(this.encSamAnalysisTestID);
    // }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }


}