import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LIMSHttpService } from '../../common/services/limsHttp.service';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { InvalidationsServiceUrl } from './invalidationsServiceUrl';
import { SearchInvalidationsBO, ManageInvalidationBO, ManageInvalidationManualInfo } from '../model/invalidationsModel';
import { ServiceUrls } from 'src/app/common/services/utilities/serviceurls';
import { mobilePhaseServiceUrl } from 'src/app/mobilePhase/services/mobilePhaseServiceUrl';
import { SampleAnalysisServiceUrl } from 'src/app/sampleAnalysis/service/sampleAnalysisServiceUrl';

@Injectable()

export class InvalidationsService {

    invalidationsSubject: Subject<any> = new Subject();

    constructor(private _limsHttpService: LIMSHttpService) { }

    searchInvalidations(obj: SearchInvalidationsBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(InvalidationsServiceUrl.searchInvalidations, []), obj).subscribe(resp => {
            this.invalidationsSubject.next({ result: resp, purpose: 'searchInvalidations' })
        })
    }

    getCategoryItemsByCatCode(code,type:string="MNG") {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.GetCatItemsByCatCode, [code,type])).subscribe(resp => {
            this.invalidationsSubject.next({ result: resp, purpose: code });
        });
    }

    getInvalidationData(encID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(InvalidationsServiceUrl.getInvalidationData, [encID])).subscribe(resp => {
            this.invalidationsSubject.next({ result: resp, purpose: "getInvalidationData" });
        });
    }

    manageInvalidationInfo(obj: ManageInvalidationBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(InvalidationsServiceUrl.manageInvalidationInfo, []), obj).subscribe(resp => {
            this.invalidationsSubject.next({ result: resp, purpose: obj.type });
        });
    }

    getStatuslist(entityCode) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getStatusList, [entityCode])).subscribe(resp => {
            this.invalidationsSubject.next({ result: resp, purpose: "getStatuslist" });
        });
    }

    getInvTypesInsTypes(){
        this._limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getInvTypesInsTypes, [])).subscribe(resp => {
            this.invalidationsSubject.next({ result: resp, purpose: "getInvTypesInsTypes" });
        });
    }

    getPreviousInvalidations(encID : string){
        this._limsHttpService.getDataFromService(CommonMethods.formatString(InvalidationsServiceUrl.getPreviousInvalidations, [encID])).subscribe(resp => {
            this.invalidationsSubject.next({ result: resp, purpose: "getPreviousInvalidations" });
        });
    }

    getAnalysisTypes() {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getAnalysisTypes, [])).subscribe(resp => {
            this.invalidationsSubject.next({ result: resp, purpose: "getAnalysisTypes" });
        });
    }

    getCatItemsByCatCodeList(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.getCatItemsByCatCodeList, []), obj).subscribe(resp => {
            this.invalidationsSubject.next({ result: resp, purpose: "getCatItemsByCatCodeList" })
        })
    }

    manageInvalidationManualInfo(obj: ManageInvalidationManualInfo) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(InvalidationsServiceUrl.manageInvalidationManualInfo, []), obj).subscribe(resp => {
            this.invalidationsSubject.next({ result: resp, purpose: "manageInvalidationManualInfo" });
        });
    }
}