import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LIMSHttpService } from 'src/app/common/services/limsHttp.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { CalibrationArdsServiceUrls } from './calibrationArdsServiceUrl';
import { SearchEquipmentMaintenance, GetEquipmentType, EQUPMAINInsertNewRequest } from '../modal/calibrationArdsModal';
import { SampleAnalysisServiceUrl } from 'src/app/sampleAnalysis/service/sampleAnalysisServiceUrl';

@Injectable()

export class CalibrationArdsService {
    calibrationArdsSubject: Subject<any> = new Subject;
    constructor(private _limsService: LIMSHttpService) { }

    getStatusList(code: string) {
        this._limsService.getDataFromService(CommonMethods.formatString(CalibrationArdsServiceUrls.getStatusList, [code]))
            .subscribe(resp => {
                this.calibrationArdsSubject.next({ "result": resp, "purpose": "getStatusList" });
            })
    }

    searchEquipmentMaintenance(obj: SearchEquipmentMaintenance) {
        this._limsService.postDataToService(CommonMethods.formatString(CalibrationArdsServiceUrls.searchEquipmentMaintenance, []), obj).subscribe(resp => {
            this.calibrationArdsSubject.next({ "result": resp, "purpose": "searchEquipmentMaintenance" });
        })
    }

    getEquipmentCategories() {
        this._limsService.getDataFromService(CommonMethods.formatString(CalibrationArdsServiceUrls.getEquipmentCategories, []))
            .subscribe(resp => {
                this.calibrationArdsSubject.next({ "result": resp, "purpose": "getEquipmentCategories" });
            })
    }

    getEquipmentTypesByCategory(obj: GetEquipmentType) {
        this._limsService.postDataToService(CommonMethods.formatString(CalibrationArdsServiceUrls.getEquipmentTypesByCategory, []), obj).subscribe(resp => {
            this.calibrationArdsSubject.next({ "result": resp, "purpose": "getEquipmentTypesByCategory" });
        })
    }

    getScheduleTypesByDeptCode() {
        this._limsService.getDataFromService(CommonMethods.formatString(CalibrationArdsServiceUrls.getScheduleTypesByDeptCode, [])).subscribe(resp => {
            this.calibrationArdsSubject.next({ "result": resp, "purpose": "getScheduleTypesByDeptCode" });
        })
    }

    runCalibration(obj) {
        this._limsService.postDataToService(CommonMethods.formatString(CalibrationArdsServiceUrls.runCalibration, []), obj).subscribe(resp => {
            this.calibrationArdsSubject.next({ "result": resp, "purpose": "runCalibration" });
        });
    }

    generateNewRequest(obj : EQUPMAINInsertNewRequest ) {
        this._limsService.postDataToService(CommonMethods.formatString(CalibrationArdsServiceUrls.generateNewRequest,[]),obj).subscribe(resp => {
            this.calibrationArdsSubject.next({ result: resp, purpose: 'generateNewRequest' });
        });
    }

    raiseDeviation(obj) {
        this._limsService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.raiseDeviation, []), obj).subscribe(resp => {
            this.calibrationArdsSubject.next({ result: resp, purpose: obj.dcActionCode });
        });
    }
}