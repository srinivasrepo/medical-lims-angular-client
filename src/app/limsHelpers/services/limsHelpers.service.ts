import { Subject } from "rxjs";
import { Injectable } from "@angular/core";
import { LIMSHttpService } from '../../common/services/limsHttp.service';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { LimsHelperUrl } from './limsHelpersServiceUrl';
import { ManageMasterUrl } from 'src/app/manageMaster/services/manageMasterUrl';
import { OtherFieldsBOList, solventsPreparation } from 'src/app/mobilePhase/model/mobilePhaseModel';
import { mobilePhaseServiceUrl } from 'src/app/mobilePhase/services/mobilePhaseServiceUrl';
import { SolventQntyPreparation, UomDenominationObj, RS232IntegrationModelBO, ManageRS232IntegrationFieldsBO } from '../entity/limsGrid';
import { ServiceUrls } from 'src/app/common/services/utilities/serviceurls';
import { SampleAnalysisServiceUrl } from 'src/app/sampleAnalysis/service/sampleAnalysisServiceUrl';

@Injectable()

export class LimsHelperService {

    limsHelperSubject: Subject<any> = new Subject();

    constructor(private _limsHttpService: LIMSHttpService) { }

    getLookupData(lookupCode: string, condition: string, searchText: string, purpose: string) {
        this._limsHttpService
            .getDataFromService(CommonMethods.formatString(LimsHelperUrl.getLookupData, [lookupCode, condition, searchText, purpose]))
            .subscribe(resp => {
                this.limsHelperSubject.next({ "result": resp, "purpose": "lookupData" });
            })
    }

    getStages(id) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.getStages, [id])).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: "getStages" });
        });
    }

    getMaterialCategories() {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.getMaterialCategories, [])).subscribe(resp => {
            this.limsHelperSubject.next({ "result": resp, "purpose": "getMaterialCategories" });
        })
    }

    getMaterialSubCategories(code) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.getMaterialSubCategories, [code])).subscribe(resp => {
            this.limsHelperSubject.next({ "result": resp, "purpose": "getMaterialSubCategories" });
        })
    }

    getMaterialDetailsByMatID(matID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.getMaterialDetailsByMatID, [matID])).subscribe(resp => {
            this.limsHelperSubject.next({ "result": resp, "purpose": "getMaterialDetailsByMatID" });
        })
    }


    getConvertableUOMByMatID(matID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getConvertableUOMByMatID, [matID])).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: 'getConvertableUOMByMatID' });
        });
    }

    manageMobilePhaseSolventsPreparation(obj: solventsPreparation) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(mobilePhaseServiceUrl.manageMobilePhaseSolventsPreparation, []), obj).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: "manageMobilePhaseSolventsPreparation" + obj.encEntityActID });
        });
    }

    manageSolventQuantityPreparation(obj: SolventQntyPreparation) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(LimsHelperUrl.manageSolventQuantityPreparation, []), obj).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: "manageSolventQuantityPreparation" + obj.encEntityActID });
        });
    }

    getUomDetailsByMaterialID(materialID: number) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.getUomDetailsByMaterialID, [materialID.toString()])).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: "getUomDetailsByMaterialID" });
        });
    }

    getPreparationDetails(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(LimsHelperUrl.getPreparationDetails, []), obj).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: "getPreparationDetails" });
        });
    }

    getMaterialUomList(materialID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.getMaterialUomList, [materialID])).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: "getMaterialUomList" });
        });
    }

    getMaterialUOMConvertions(baseUOM: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.getMaterialUOMConvertions, [baseUOM])).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: "getMaterialUOMConvertions" });
        });
    }

    getUOMConvertionDenomination(obj: UomDenominationObj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(LimsHelperUrl.getUOMConvertionDenomination, []), obj).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: "getUOMConvertionDenomination" });
        });
    }

    getChemicalBatchDetailsByPackInvID(pacInvID, refPackID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.getChemicalBatchDetailsByPackInvID, [pacInvID, refPackID])).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: "getChemicalBatchDetailsByPackInvID" });
        });
    }

    discardPreparationBatch(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(LimsHelperUrl.discardPreparationBatch, []), obj).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: 'discardPreparationBatch' });
        });
    }

    manageRs232Integration(obj: RS232IntegrationModelBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(LimsHelperUrl.manageRs232Integration, []), obj).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: "manageRs232Integration" });
        });
    }

    getRs232Integration(obj: RS232IntegrationModelBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(LimsHelperUrl.getRs232Integration, []), obj).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: 'getRs232Integration' });
        });
    }

    eQPUpdateToDateTime(encOccupancyID: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.eQPUpdateToDateTime, [encOccupancyID])).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: 'eQPUpdateToDateTime' });
        });
    }

    getRS232IntegrationOther(obj: ManageRS232IntegrationFieldsBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.getRS232IntegrationOther, []), obj)
            .subscribe(resp => {
                this.limsHelperSubject.next({ "result": resp, "purpose": "getRS232IntegrationOther" })
            })
    }

    resetRs232EqpOtherOcc(encRSIntegrationID: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.resetRs232EqpOtherOcc, [encRSIntegrationID])).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: 'resetRs232EqpOtherOcc' });
        });
    }

    getCategoryItemsByCatCode(code, type: string = "MNG") {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.GetCatItemsByCatCode, [code, type])).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: code });
        });
    }

    manageRS232OtherFieldsValues(list: OtherFieldsBOList) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.manageRS232OtherFieldsValues, []), list)
            .subscribe(resp => {
                this.limsHelperSubject.next({ "result": resp, "purpose": "manageRS232OtherFieldsValues" })
            })
    }

    getMappingInfo(obj: any) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getMappingInfo, []), obj).subscribe(resp => {
            this.limsHelperSubject.next({ result: resp, purpose: 'getsdmsDetails' });
        });
    }
}