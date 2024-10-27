import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LIMSHttpService } from 'src/app/common/services/limsHttp.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { SampleDestructionServiceUrl } from './sampleDestructionServiceUrl';
import { GetSampleDestruction, SaveSampleDestruction, SearchSampleDestruction } from '../model/sampleDestructionModel';
import { ManageDestructionSamplesModel } from '../model/sampleDestructionModel';
import { ServiceUrls } from 'src/app/common/services/utilities/serviceurls';

@Injectable()

export class SampleDestructionService {

    sampleDestructionSubject: Subject<any> = new Subject();

    constructor(private _limsHttpService: LIMSHttpService) { }

    getDestructionSamples(encDestructionID: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleDestructionServiceUrl.getDestructionSamples, [encDestructionID]))
            .subscribe(resp => {
                this.sampleDestructionSubject.next({ result: resp, purpose: "getDestructionSamples" });
            });
    }

    getCatItemsByCatCodeList(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.getCatItemsByCatCodeList, []), obj).subscribe(resp => {
            this.sampleDestructionSubject.next({ result: resp, purpose: 'getCatItemsByCatCodeList' });
        });
    }

    getCatItemsByCatCode(catCode: string,type:string= "MNG") {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleDestructionServiceUrl.getCatItemsByCatCode, [catCode,type]))
            .subscribe(resp => {
                this.sampleDestructionSubject.next({ result: resp, purpose: catCode });
            });
    }

    manageDestructionSamples(obj: ManageDestructionSamplesModel) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleDestructionServiceUrl.manageDestructionSamples, []), obj)
            .subscribe(resp => {
                this.sampleDestructionSubject.next({ result: resp, purpose: "manageDestructionSamples" });
            });
    }

    discardSamples(obj: ManageDestructionSamplesModel) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleDestructionServiceUrl.discardSamples, []), obj)
            .subscribe(resp => {
                this.sampleDestructionSubject.next({ result: resp, purpose: "discardSamples" });
            });
    }

    getSamplePackDestructionDetails(obj: GetSampleDestruction) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleDestructionServiceUrl.getSamplePackDestruction, []), obj)
            .subscribe(resp => {
                this.sampleDestructionSubject.next({ result: resp, purpose: "getSamplePackDestruction" });
            });
    }

    savePackDestructionDetails(obj: SaveSampleDestruction) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleDestructionServiceUrl.saveSamplePackDestruction, []), obj)
            .subscribe(resp => {
                this.sampleDestructionSubject.next({ result: resp, purpose: "saveSamplePackDestruction" });
            });
    }

    getSampleDestructionDetailsForView(encDestructionID: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleDestructionServiceUrl.getSampleDestructionDetailsForView, [encDestructionID]))
            .subscribe(resp => {
                this.sampleDestructionSubject.next({ result: resp, purpose: "getSampleDestructionDetailsForView" });
            });
    }

    searchSampleDestructionDetails(obj: SearchSampleDestruction) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleDestructionServiceUrl.searchSampleDestruction, []), obj)
            .subscribe(resp => {
                this.sampleDestructionSubject.next({ result: resp, purpose: "searchSampleDestruction" });
            });
    }

    getStatusDetails(code: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleDestructionServiceUrl.getStatusList, [code]))
            .subscribe(resp => {
                this.sampleDestructionSubject.next({ result: resp, purpose: 'getStatusList' });
            });
    }

    getRequestSourceDetails(code: string,type: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleDestructionServiceUrl.getRequestSource, [code,type]))
            .subscribe(resp => {
                this.sampleDestructionSubject.next({ result: resp, purpose: 'getRequestSource' });
            });
    }

}