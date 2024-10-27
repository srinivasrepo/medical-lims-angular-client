import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LIMSHttpService } from 'src/app/common/services/limsHttp.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ServiceUrls } from 'src/app/common/services/utilities/serviceurls';
import { SpecValidationsServiceUrls } from './specValidationsServiceUrl';
import { mobilePhaseServiceUrl } from 'src/app/mobilePhase/services/mobilePhaseServiceUrl';
import { QCCalibrationsServiceUrl } from 'src/app/qcCalibrations/services/qcCalibrationsServiceUrl';
import { ManageSTPGroupTestBO } from 'src/app/qcCalibrations/models/qcCalibrationsModel';
import { SampleAnalysisServiceUrl } from 'src/app/sampleAnalysis/service/sampleAnalysisServiceUrl';
import { ManageSTP } from '../model/specValidations';

@Injectable()

export class SpecValidationsService {
    specValidSubject: Subject<any> = new Subject();
    constructor(private _limsHttpService: LIMSHttpService) { }

    getCatItemsByCatCode(catCode: string, type: string = "MNG") {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.GetCatItemsByCatCode, [catCode, type])).subscribe(resp => {
            this.specValidSubject.next({ result: resp, purpose: catCode });
        });
    }

    getCatItemsByCatCodeList(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.getCatItemsByCatCodeList, []), obj).subscribe(resp => {
            this.specValidSubject.next({ result: resp, purpose: 'getCatItemsByCatCodeList' });
        });
    }

    manageSpecValidationsDetails(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SpecValidationsServiceUrls.manageSpecValidationsDetails, []), obj).subscribe(resp => {
            this.specValidSubject.next({ result: resp, purpose: "manageSpecValidationsDetails" });
        });
    }

    getSpecValidationDetails(encSpecValidID, entityCode) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SpecValidationsServiceUrls.GetSpecValidationDetails, [encSpecValidID, entityCode])).subscribe(resp => {
            this.specValidSubject.next({ result: resp, purpose: 'getSpecValidationDetails' });
        });
    }

    manageCycleDetails(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SpecValidationsServiceUrls.manageCycleDetails, []), obj).subscribe(resp => {
            this.specValidSubject.next({ result: resp, purpose: "manageCycleDetails", type: obj.type, cycleID: obj.specValidCycleID });
        });
    }

    searchResultSpecValidations(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SpecValidationsServiceUrls.searchResultSpecValidations, []), obj).subscribe(resp => {
            this.specValidSubject.next({ result: resp, purpose: 'searchResultSpecValidations' })
        })
    }

    getStatuslist(entityCode) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getStatusList, [entityCode])).subscribe(resp => {
            this.specValidSubject.next({ result: resp, purpose: "getStatuslist" });
        });
    }

    validateTest(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SpecValidationsServiceUrls.validateTest, []), obj).subscribe(resp => {
            this.specValidSubject.next({ result: resp, purpose: "validateTest" });
        });
    }


    getCalibrationTests(encCalibParamID: string, specID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SpecValidationsServiceUrls.getCalibrationTests, [encCalibParamID, specID])).subscribe(resp => {
            this.specValidSubject.next({ result: resp, purpose: 'getCalibrationTests' })
        })
    }

    manageAssignSTPGroupTest(obj: ManageSTPGroupTestBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(QCCalibrationsServiceUrl.manageAssignSTPGroupTest, []), obj).subscribe(resp => {
            this.specValidSubject.next({ result: resp, purpose: 'manageAssignSTPGroupTest' })
        })
    }

    getParamMasterData(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SpecValidationsServiceUrls.getParamMasterData, []), obj).subscribe(resp => {
            this.specValidSubject.next({ result: resp, purpose: "getParamMasterData" });
        });
    }

    viewARDSMasterDocument(documnetID: any) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.viewARDSMasterDocument, [documnetID])).subscribe(resp => {
            this.specValidSubject.next({ result: resp, purpose: "viewARDSMasterDocument" });
        });
    }

    getSpecificationTestToAssignSTP(specID: any, calibID: any) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SpecValidationsServiceUrls.getSpecificationTestToAssignSTP, [specID, calibID])).subscribe(resp => {
            this.specValidSubject.next({ result: resp, purpose: "getSpecificationTestToAssignSTP" });
        });
    }

    assignSTPToTest(obj: ManageSTP) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SpecValidationsServiceUrls.assignSTPToTest, []), obj).subscribe(resp => {
            this.specValidSubject.next({ result: resp, purpose: "assignSTPToTest", type: obj.type });
        });
    }

    testSTPHistory(id) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SpecValidationsServiceUrls.testSTPHistory, [id])).subscribe(resp => {
            this.specValidSubject.next({ result: resp, purpose: 'testSTPHistory' });
        });
    }
}