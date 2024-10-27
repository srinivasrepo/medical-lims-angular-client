import { Injectable } from "@angular/core";
import { LIMSHttpService } from 'src/app/common/services/limsHttp.service';
import { Subject } from 'rxjs';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { QCCalibrationsServiceUrl } from './qcCalibrationsServiceUrl';
import { LimsSubscription, QCCalibHeadersInfoBO, ManageQCCalibrationBO, QCSPECDeleteTestMethodsBO, SearchQCCalibrationsBO, ManageSTPGroupTestBO, AssignPlant, AssignInstrc, ManageArdsDocuments, ManualRefNumber } from '../models/qcCalibrationsModel';
import { ServiceUrls } from 'src/app/common/services/utilities/serviceurls';
import { CommentsBO } from 'src/app/mobilePhase/model/mobilePhaseModel';

@Injectable()

export class QCCalibrationsService {

    qcCalibrationsSubject: Subject<any> = new Subject();

    constructor(private _httpService: LIMSHttpService) { }


    getCalibrationHeaderDetails(encCalibParamID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(QCCalibrationsServiceUrl.getCalibrationHeaderDetails, [encCalibParamID])).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: 'getCalibrationHeaderDetails' })
        })
    }

    manageCalibrationHeadersInfo(obj: QCCalibHeadersInfoBO) {
        this._httpService.postDataToService(CommonMethods.formatString(QCCalibrationsServiceUrl.manageCalibrationHeadersInfo, []), obj).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: 'manageCalibrationHeadersInfo' })
        })
    }

    addNewSpecCategory(obj: ManageQCCalibrationBO) {
        this._httpService.postDataToService(CommonMethods.formatString(QCCalibrationsServiceUrl.addNewSpecCategory, []), obj).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: 'addNewSpecCategory' })
        })
    }

    addNewSpecSubCategory(obj: ManageQCCalibrationBO) {
        this._httpService.postDataToService(CommonMethods.formatString(QCCalibrationsServiceUrl.addNewSpecSubCategory, []), obj).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: 'addNewSpecSubCategory' })
        })
    }

    qcUpdateSingleTestMethodInstrumentData(obj: ManageQCCalibrationBO) {
        this._httpService.postDataToService(CommonMethods.formatString(QCCalibrationsServiceUrl.qcUpdateSingleTestMethodInstrumentData, []), obj).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: 'qcUpdateSingleTestMethodInstrumentData' })
        })
    }

    getCalibrationTests(encCalibParamID: string, specID) {
        this._httpService.getDataFromService(CommonMethods.formatString(QCCalibrationsServiceUrl.getCalibrationTests, [encCalibParamID, specID])).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: 'getCalibrationTests' })
        })
    }

    getCalibrationTestDetailsByID(encSpecTestID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(QCCalibrationsServiceUrl.getCalibrationTestDetailsByID, [encSpecTestID])).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: 'getCalibrationTestDetailsByID' })
        })
    }

    getTestResultByID(encSpecCatID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(QCCalibrationsServiceUrl.getTestResultByID, [encSpecCatID])).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: 'getTestResultByID' })
        })
    }

    qcSPECDeleteTestMethods(obj: QCSPECDeleteTestMethodsBO) {
        this._httpService.postDataToService(CommonMethods.formatString(QCCalibrationsServiceUrl.qcSPECDeleteTestMethods, []), obj).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: 'qcSPECDeleteTestMethods' })
        })
    }

    viewCalibrationDetailsByID(encCalibParamID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(QCCalibrationsServiceUrl.viewCalibrationDetailsByID, [encCalibParamID])).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: 'viewCalibrationDetailsByID' })
        })
    }

    searchQCCalibrations(obj: SearchQCCalibrationsBO) {
        this._httpService.postDataToService(CommonMethods.formatString(QCCalibrationsServiceUrl.searchQCCalibrations, []), obj).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: 'searchQCCalibrations' })
        })
    }

    getStatuslist(entityCode: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getStatusList, [entityCode])).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: "getStatuslist" });
        });
    }

    manageAssignSTPGroupTest(obj: ManageSTPGroupTestBO) {
        this._httpService.postDataToService(CommonMethods.formatString(QCCalibrationsServiceUrl.manageAssignSTPGroupTest, []), obj).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: 'manageAssignSTPGroupTest' })
        })
    }

    getInstrumentsByType(equipCode: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(QCCalibrationsServiceUrl.getInstrumentsByType, [equipCode])).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: "getInstrumentsByType" });
        });

    }

    newVersionCalibParamset(encCalibParamID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(QCCalibrationsServiceUrl.newVersionCalibParamset, [encCalibParamID])).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: "newVersionCalibParamset" });
        });

    }

    calibrationChangeStatusComments(obj: CommentsBO) {
        this._httpService.postDataToService(CommonMethods.formatString(QCCalibrationsServiceUrl.obsoluteComments, []), obj).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: 'calibrationChangeStatusComments' })
        })
    }

    assignInstrumentDetails(obj: AssignInstrc) {
        this._httpService.postDataToService(CommonMethods.formatString(QCCalibrationsServiceUrl.manageAssignInstrumentDetails, []), obj).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: obj.type });
        })
    }

    getCategoryItemsByCatCode(code, type: string = "MNG") {
        this._httpService.getDataFromService(CommonMethods.formatString(ServiceUrls.GetCatItemsByCatCode, [code, type])).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: code });
        });
    }

    getCatItemsByCatCodeList(obj) {
        this._httpService.postDataToService(CommonMethods.formatString(ServiceUrls.getCatItemsByCatCodeList, []), obj).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: 'getCatItemsByCatCodeList' });
        });
    }

    assignPlant(obj: AssignPlant) {
        this._httpService.postDataToService(CommonMethods.formatString(QCCalibrationsServiceUrl.assignPlant, []), obj).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: obj.type })
        })
    }

    manageArdsDocuments(obj: ManageArdsDocuments) {
        this._httpService.postDataToService(CommonMethods.formatString(QCCalibrationsServiceUrl.manageArdsDocuments, []), obj).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: "manageArdsDocuments", mode: obj.mode })
        })
    }

    cloneCalibrationParamSet(encCalibParamID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(QCCalibrationsServiceUrl.cloneCalibrationParamSet, [encCalibParamID])).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: "cloneCalibrationParamSet" });
        });
    }


    getManualReferenceNumber(obj: ManualRefNumber) {
        this._httpService.postDataToService(CommonMethods.formatString(QCCalibrationsServiceUrl.getManualReferenceNumber, []),obj).subscribe(resp => {
            this.qcCalibrationsSubject.next({ result: resp, purpose: "getManualReferenceNumber" });
        });
    }
}
