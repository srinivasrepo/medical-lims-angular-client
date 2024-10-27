import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LIMSHttpService } from '../../common/services/limsHttp.service';
import { SearchIndicatorsBO, ManageIndicatorBO } from '../model/indicatorsModel';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { IndicatorsServiceUrl } from './indicatorsServiceUrl';
import { mobilePhaseServiceUrl } from '../../mobilePhase/services/mobilePhaseServiceUrl';
import { ServiceUrls } from '../../common/services/utilities/serviceurls';
import { CommentsBO } from 'src/app/mobilePhase/model/mobilePhaseModel';
import { LimsHelperUrl } from 'src/app/limsHelpers/services/limsHelpersServiceUrl';
import { GetVolumetricSolIndex } from 'src/app/volumetricSolution/model/volumetricSolModel';

@Injectable()

export class IndicatorsService {

    indicatorsSubject: Subject<any> = new Subject();

    constructor(private _limsHttpService: LIMSHttpService) { }

    searchIndicators(obj: SearchIndicatorsBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(IndicatorsServiceUrl.searchIndicators, []), obj).subscribe(resp => {
            this.indicatorsSubject.next({ result: resp, purpose: 'searchIndicators' })
        })
    }

    getStatuslist(entityCode) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getStatusList, [entityCode])).subscribe(resp => {
            this.indicatorsSubject.next({ result: resp, purpose: "getStatuslist" });
        });
    }

    getCatItemsByCatCodeList(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.getCatItemsByCatCodeList, []), obj).subscribe(resp => {
            this.indicatorsSubject.next({ result: resp, purpose: 'getCatItemsByCatCodeList' });
        });
    }

    getCategoryItemsByCatCode(code,type:string = "MNG") {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.GetCatItemsByCatCode, [code,type])).subscribe(resp => {
            this.indicatorsSubject.next({ result: resp, purpose: code });
        });
    }

    getIndicatorsInfo(encIndicatorID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(IndicatorsServiceUrl.getIndicatorsInfo, [encIndicatorID])).subscribe(resp => {
            this.indicatorsSubject.next({ result: resp, purpose: 'getIndicatorsInfo' });
        });
    }

    manageIndicatorsInfo(obj: ManageIndicatorBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(IndicatorsServiceUrl.manageIndicatorsInfo, []), obj).subscribe(resp => {
            this.indicatorsSubject.next({ result: resp, purpose: 'manageIndicatorsInfo' })
        })
    }

    viewIndicatorInfo(encIndicatorID: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(IndicatorsServiceUrl.viewIndicatorInfo, [encIndicatorID])).subscribe(resp => {
            this.indicatorsSubject.next({ result: resp, purpose: 'viewIndicatorInfo' });
        });
    }

    manageDiscardCommnets(obj: CommentsBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(mobilePhaseServiceUrl.manageDiscardCommnets, []), obj).subscribe(resp => {
            this.indicatorsSubject.next({ result: resp, purpose: "manageDiscardCommnets" });
        });
    }

    getValidityPeriods(entityCode) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getValidityPeriods, [entityCode])).subscribe(resp => {
            this.indicatorsSubject.next({ result: resp, purpose: 'getValidityPeriods' });
        });
    }

    manageIndicatorMasterData(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(IndicatorsServiceUrl.manageIndicatorMasterData, []), obj).subscribe(resp => {
            this.indicatorsSubject.next({ result: resp, purpose: 'manageIndicatorMasterData', type: obj.type });
        });
    }

    getMaterialSubCategories(code) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.getMaterialSubCategories, [code])).subscribe(resp => {
            this.indicatorsSubject.next({ "result": resp, "purpose": "getMaterialSubCategories" });
        })
    }

    getTestSolutionIndexByID(encIndexID: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(IndicatorsServiceUrl.getTestSolutionIndexByID, [encIndexID])).subscribe(resp => {
            this.indicatorsSubject.next({ "result": resp, "purpose": "getTestSolutionIndexByID" });
        })
    }

    manageTestSolutionIndex(obj: GetVolumetricSolIndex) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(IndicatorsServiceUrl.manageTestSolutionIndex, []), obj).subscribe(resp => {
            this.indicatorsSubject.next({ "result": resp, "purpose": "manageTestSolutionIndex", type: obj.type });
        })
    }


}