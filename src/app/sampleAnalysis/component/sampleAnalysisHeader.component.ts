import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { AnalysisHeaderBO } from '../model/sampleAnalysisModel';
import { Store, select } from '@ngrx/store';
import * as analysisActions from '../state/analysis/analysis.action';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { EntityCodes } from 'src/app/common/services/utilities/constants';

@Component({
    selector: 'analy-header',
    templateUrl: '../html/sampleAnalysisHeader.html'
})

export class SampleAnalysisHeaderComponent {

    subscription: Subscription = new Subscription();
    @Input('headerInfo') headerInfo: AnalysisHeaderBO = new AnalysisHeaderBO();
    @Input('screenCode') screenCode: string;
    @Input('entityCode') entityCode: string = EntityCodes.sampleAnalysis;

    constructor(private _saService: SampleAnalysisService, private store: Store<fromAnalysisOptions.AnalysisState>) { }
    ngOnInit() {
        this.store
            .pipe(select(fromAnalysisOptions.getAnalysisInfo))
            .subscribe(analysis => {
                if (this.entityCode == EntityCodes.sampleAnalysis) {
                    this.headerInfo = analysis;
                    this.screenCode = this.headerInfo.screenCode;
                }
            });
    }

    getBatchQty() {
        return CommonMethods.hasValue(this.headerInfo.batchQty) ? this.headerInfo.batchQty + ' ' + this.headerInfo.uom : 'N / A';
    }

    showHideFields(code: string) {

        if (code == 'BATCH_MFG_DATE')
            return this.screenCode != 'WAT' && this.screenCode != 'IUNIT';
        else if (code == 'BATCH_QNTY')
            return this.screenCode != 'WAT' && this.screenCode != 'IUNIT';
        else if (code == 'PROJECT')
            return this.screenCode != 'WAT' && this.screenCode != 'IUNIT';
        else if (code == 'PRODUCT')
            return this.screenCode == 'PRO' || this.screenCode == 'STB' || this.screenCode == "HTS" || this.screenCode == "RES";
        else if (code == 'STAGE')
            return this.screenCode == "PRO" || this.screenCode == "STB" || this.screenCode == "HTS" || this.screenCode == "RES"
        else if (code == 'NOOF_DRUMS')
            return this.screenCode == 'RAW' || this.screenCode == "PRO"
        else if (code == 'AR_NUM')
            return this.screenCode == "IUNIT" || this.screenCode == "WAT"
        else if (code == 'SAM_QNTY')
            return this.screenCode == "IUNIT" || this.screenCode == "STB" || this.screenCode == "HTS";

        else if (this.screenCode == 'RAW')
            return code == 'MRR_NUMB' || code == 'MRR_DATE' || code == "MIXED";
        else if (this.screenCode == "STB" || this.screenCode == "HTS")
            return code == 'FREQ' || code == 'CONDITION'
        else if (this.screenCode == "IUNIT")
            return code == 'SOUCE_UNIT' || code == 'DATE_OF_REQ' || code == 'SAM_TYPE'
        else if (this.screenCode == "WAT")
            return code == 'SAMPLE_POINT';
        // else if (this.screenCode == "RES")
        //     return code == 'STAGE'; // || code == 'SAM_QNTY' || code == 'SAM_EXP_DATE' || code == 'SAM_PACK'
    }

    getFrequency(val) {
        return CommonMethods.hasValue(val) ? val + ' Months' : val == '0' ? 'Initial' : 'N / A';
    }

    getSampleUom() {
        return CommonMethods.hasValue(this.headerInfo.sampleQty) ? this.headerInfo.sampleQty + ' ' + this.headerInfo.sampleUom : 'N / A';
    }

    getBatchDate() {
        //headerInfo.inwardType == 'SUP' ? headerInfo.SupSamMfgDate : headerInfo.mfgDate |  date: 'dd-MMM-yyyy' || 'N / A'
        if (this.headerInfo.inwardType == 'SUP')
            return CommonMethods.hasValue(this.headerInfo.supSamMfgDate) ? dateParserFormatter.FormatDate(this.headerInfo.supSamMfgDate, 'dateMonth') : 'N / A';
        else
            return CommonMethods.hasValue(this.headerInfo.mfgDate) ? dateParserFormatter.FormatDate(this.headerInfo.mfgDate, 'dateMonth') : 'N / A';

    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}