import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { LIMSHttpService } from 'src/app/common/services/limsHttp.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ServiceUrls } from 'src/app/common/services/utilities/serviceurls';
import { mobilePhaseServiceUrl } from './mobilePhaseServiceUrl';
import { solventsPreparation, MobilePhasePrep, MobilePhaseOutput, searchBo, CommentsBO } from '../model/mobilePhaseModel';
import { SingleCodeBO } from 'src/app/common/services/utilities/commonModels';
import { ManageRS232IntegrationFieldsBO } from 'src/app/limsHelpers/entity/limsGrid';

@Injectable()

export class mobilePhaseService {
    mobilephaseSubject: Subject<any> = new Subject();
    constructor(private limsHttpService: LIMSHttpService) { }

    getCategoryItemsByCatCode(code, type: string = "MNG") {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.GetCatItemsByCatCode, [code, type])).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: code });
        });
    }

    getCatItemsByCatCodeList(obj) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.getCatItemsByCatCodeList, []), obj).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: 'getCatItemsByCatCodeList' });
        });
    }

    manageMobilePhase(obj) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(mobilePhaseServiceUrl.manageMobilePhase, []), obj).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: 'manageMobilePhase' });
        });
    }

    getMobilePreparationData(encPreparationID: string) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getMobilePhaseData, [encPreparationID])).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: 'getMobilephaseData' });
        });
    }

    getConvertableUOMByMatID(matID) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getConvertableUOMByMatID, [matID])).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: 'getConvertableUOMByMatID' });
        });
    }

    manageMobilePhaseSolventsPreparation(obj: solventsPreparation) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(mobilePhaseServiceUrl.manageMobilePhaseSolventsPreparation, []), obj).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: "manageMobilePhaseSolventsPreparation" });
        });
    }

    manageMobilePhasePrepComments(obj: MobilePhasePrep) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(mobilePhaseServiceUrl.manageMobilePhasePrepComments, []), obj).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: "manageMobilePhasePrepComments" });
        });
    }

    getValidityPeriods(entityCode) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getValidityPeriods, [entityCode])).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: 'getValidityPeriods' });
        });
    }

    managePhaseOutput(obj: MobilePhaseOutput) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(mobilePhaseServiceUrl.managePhaseOutput, []), obj).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: "managePhaseOutput" });
        });
    }

    getSearchMobilePhaseData(obj: searchBo) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(mobilePhaseServiceUrl.getSearchMobilePhaseData, []), obj).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: "getSearchMobilePhaseData" });
        });
    }

    getStatuslist(entityCode) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getStatusList, [entityCode])).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: "getStatuslist" });
        });
    }

    viewMobilePhaseData(phaseID: string) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.viewMobilePhaseData, [phaseID])).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: "viewMobilePhaseData" });
        });
    }

    getPreparationDetails(phaseID: string) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getPreparationDetails, [phaseID])).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: "getPreparationDetails" });
        })
    }

    getCalibrationParameters() {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getCalibrationParameters, [])).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: "getCalibrationParameters" });
        });
    }

    manageDiscardCommnets(obj: CommentsBO) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(mobilePhaseServiceUrl.manageDiscardCommnets, []), obj).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: "manageDiscardCommnets" });
        });
    }

    getProductStageDetailsByMaterialID(materialID: number) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getProductStageDetailsByMaterialID, [materialID.toString()])).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: "getProductStageDetailsByMaterialID" });
        });
    }

    getAllMaterialCategories() {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getAllMaterialCategories, [])).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: "getAllMaterialCategories" });
        });
    }

    managePreparationMasterData(obj) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(mobilePhaseServiceUrl.managePreparationMasterData, []), obj).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: 'managePreparationMasterData', type: obj.type });
        });
    }

    getMaterialDetailsBySpecID(specID) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getMaterialDetailsBySpecID, [specID])).subscribe(resp => {
            this.mobilephaseSubject.next({ result: resp, purpose: "getMaterialDetailsBySpecID" });
        });
    }





}