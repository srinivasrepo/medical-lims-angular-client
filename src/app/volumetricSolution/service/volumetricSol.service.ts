import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';
import { LIMSHttpService } from '../../common/services/limsHttp.service';
import { SearchVolumetricSolBO, GetVolumetricSolIndex, AddSolution, VolumetricStdDetails, ReStand } from '../model/volumetricSolModel';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { VolumetricSolServiceUrl } from './volumetricSolServiceUrl';
import { LimsHelperUrl } from '../../limsHelpers/services/limsHelpersServiceUrl';
import { mobilePhaseServiceUrl } from '../../mobilePhase/services/mobilePhaseServiceUrl';
import { CommentsBO } from 'src/app/mobilePhase/model/mobilePhaseModel';
import { ParamMasterObj } from 'src/app/common/model/commonModel';
import { ServiceUrls } from 'src/app/common/services/utilities/serviceurls';
import { RinsingSolutionsUrls } from 'src/app/rinsingSolutions/services/rinsingSolutionsServiceUrls';

@Injectable()

export class VolumetricSolService {

    VolumetricSubject: Subject<any> = new Subject();

    constructor(private _limsHttpService: LIMSHttpService) { }

    searchVolumetricSol(obj: SearchVolumetricSolBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(VolumetricSolServiceUrl.searchVolumetricSol, []), obj).subscribe(resp => {
            this.VolumetricSubject.next({ result: resp, purpose: 'searchVolumetricSol' });
        })
    }

    getVolumetricSolIndex(obj: GetVolumetricSolIndex) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(VolumetricSolServiceUrl.getVolumetricSolIndex, []), obj).subscribe(resp => {
            this.VolumetricSubject.next({ result: resp, purpose: 'getVolumetricSolIndex', type: obj.type });
        })
    }

    getVolumetricSolIndexByID(encIndexID: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(VolumetricSolServiceUrl.getVolumetricSolIndexByID, [encIndexID])).subscribe(resp => {
            this.VolumetricSubject.next({ result: resp, purpose: 'getVolumetricSolIndexByID' });
        })
    }

    getMaterialSubCategories(code) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.getMaterialSubCategories, [code])).subscribe(resp => {
            this.VolumetricSubject.next({ "result": resp, "purpose": "getMaterialSubCategories" });
        })
    }

    manageVolumetricSol(obj: AddSolution) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(VolumetricSolServiceUrl.manageVolumetricSol, []), obj).subscribe(resp => {
            this.VolumetricSubject.next({ result: resp, purpose: 'manageVolumetricSol' });
        })
    }

    getVolumetricSolutionByID(encSolutionID: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(VolumetricSolServiceUrl.getVolumetricSolutionByID, [encSolutionID])).subscribe(resp => {
            this.VolumetricSubject.next({ "result": resp, "purpose": "getVolumetricSolutionByID" });
        })
    }

    getVolumetricStandardByID(encStandard: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(VolumetricSolServiceUrl.getVolumetricStandardByID, [encStandard])).subscribe(resp => {
            this.VolumetricSubject.next({ "result": resp, "purpose": "getVolumetricStandardByID" });
        })
    }

    manageVolumetricSolStandard(obj: VolumetricStdDetails) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(VolumetricSolServiceUrl.manageVolumetricSolStandard, []), obj).subscribe(resp => {
            this.VolumetricSubject.next({ result: resp, purpose: 'manageVolumetricSolStandard' });
        })
    }

    getStatuslist(entityCode) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getStatusList, [entityCode])).subscribe(resp => {
            this.VolumetricSubject.next({ result: resp, purpose: "getStatuslist" });
        });
    }

    reStandardization(obj: ReStand) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(VolumetricSolServiceUrl.reStandardization, []), obj).subscribe(resp => {
            this.VolumetricSubject.next({ result: resp, purpose: "reStandardization" });
        });
    }

    getRsdValue(obj: any) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(VolumetricSolServiceUrl.getRSDValue, []), obj).subscribe(resp => {
            this.VolumetricSubject.next({ result: resp, purpose: 'getRSDValue' });
        })
    }

    invalStd(obj: ReStand) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(VolumetricSolServiceUrl.InvalidateRequest, []), obj).subscribe(resp => {
            this.VolumetricSubject.next({ result: resp, purpose: "invalidate" });
        });
    }

    manageDiscardCommnets(obj: CommentsBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(mobilePhaseServiceUrl.manageDiscardCommnets, []), obj).subscribe(resp => {
            this.VolumetricSubject.next({ result: resp, purpose: "manageDiscardCommnets" });
        });
    }

    getParamMasterData(obj: ParamMasterObj, code) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.getParamMasterData, []), obj)
            .subscribe(resp => {
                this.VolumetricSubject.next({ "result": resp, "purpose": code });
            })
    }

    manageStandProcedures(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(VolumetricSolServiceUrl.manageStandProcedures, []), obj).subscribe(resp => {
            this.VolumetricSubject.next({ result: resp, purpose: "manageStandProcedures", type: obj.type });
        });
    }

    getSolutionFormulae(encID: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(VolumetricSolServiceUrl.getSolutionFormulae, [encID]))
            .subscribe(resp => {
                this.VolumetricSubject.next({ "result": resp, "purpose": "getSolutionFormulae" });
            });
    }

    manageSolutionFormula(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(VolumetricSolServiceUrl.manageSolutionFormula, []), obj)
            .subscribe(resp => {
                this.VolumetricSubject.next({ "result": resp, "purpose": "manageSolutionFormula", type: obj.type });
            })
    }

    getSolutionFormulaByIndexID(indexID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(VolumetricSolServiceUrl.getSolutionFormulaByIndexID, [indexID]))
            .subscribe(resp => {
                this.VolumetricSubject.next({ "result": resp, "purpose": "getSolutionFormulaByIndexID" });
            })
    }

    getValidityPeriods(entityCode: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(RinsingSolutionsUrls.getValidityPeriods, [entityCode])).subscribe(resp => {
            this.VolumetricSubject.next({ result: resp, purpose: 'getValidityPeriods' });
        });
    }

    getVolViewSolIndexDetailsByID(encIndexID: string){
        this._limsHttpService.getDataFromService(CommonMethods.formatString(VolumetricSolServiceUrl.getVolViewSolIndexDetailsByID, [encIndexID])).subscribe(resp=>{
            this.VolumetricSubject.next({result: resp, purpose: "getVolViewSolIndexDetailsByID"})
        })
    }
}