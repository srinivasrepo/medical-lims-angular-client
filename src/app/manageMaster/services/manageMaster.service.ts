import { Injectable } from '@angular/core';
import { ManageMasterUrl } from './manageMasterUrl';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { Subject } from 'rxjs';
import { ManageMaster, UpdateSysConfiguration } from '../model/mngMaster';
import { LIMSHttpService } from '../../common/services/limsHttp.service';
import { ServiceUrls } from 'src/app/common/services/utilities/serviceurls';
import { mobilePhaseServiceUrl } from 'src/app/mobilePhase/services/mobilePhaseServiceUrl';

@Injectable()

export class ManageMasterService {

    mngMasterSubject: Subject<any> = new Subject();

    constructor(private _limsHttpService: LIMSHttpService) { }

    getCategoryMasters(entityType: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(ManageMasterUrl.getCategoryMasters, [entityType])).subscribe(resp => {
            this.mngMasterSubject.next({ "result": resp, "purpose": "getCategoryMaster" });
        })
    }

    searchCategory(obj: ManageMaster) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(ManageMasterUrl.searchCatItemsDetails, []), obj).subscribe(resp => {
            this.mngMasterSubject.next({ "result": resp, "purpose": "searchCatItemsDetails" });
        })
    }

    insertCategoryItems(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(ManageMasterUrl.insertCategoryItems, []), obj).subscribe(resp => {
            this.mngMasterSubject.next({ "result": resp, "purpose": "insertCategoryItems" });
        })
    }

    changeCatagoryItemStatus(catagoryItemID) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(ManageMasterUrl.changeCatagoryItemStatus, [catagoryItemID]),
            null).subscribe(resp => {
                this.mngMasterSubject.next({ "result": resp, "purpose": "changeCatagoryItemStatus" })
            })
    }

    getAuditPlaceholders(auditType: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(ManageMasterUrl.getAuditPlaceholders, [auditType])).subscribe(resp => {
            this.mngMasterSubject.next({ 'result': resp, 'purpose': 'getAuditPlaceholders' })
        });
    }

    getCategoryItemsByCatCode(code,type : string = "MNG") {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.GetCatItemsByCatCode, [code,type])).subscribe(resp => {
            this.mngMasterSubject.next({ result: resp, purpose: code });
        });
    }

    getValidityEntities(entityType) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(ManageMasterUrl.getValidityEntities, [entityType])).subscribe(resp => {
            this.mngMasterSubject.next({ result: resp, purpose: "getValidityEntities" });
        });
    }

    addValidityPeriods(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(ManageMasterUrl.addValidityPeriods, []), obj).subscribe(resp => {
            this.mngMasterSubject.next({ result: resp, purpose: "addValidityPeriods" });
        });
    }

    getValidityPeriods(entityCode) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getValidityPeriods, [entityCode])).subscribe(resp => {
            this.mngMasterSubject.next({ result: resp, purpose: 'getValidityPeriods' });
        });
    }

    getSysConfigurationData() {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(ManageMasterUrl.getSysConfigurationData, [])).subscribe(resp => {
            this.mngMasterSubject.next({ result: resp, purpose: 'getSysConfigurationData' });
        });
    }

    updateSysConfiguration(obj : UpdateSysConfiguration) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(ManageMasterUrl.updateSysConfiguration, []),obj).subscribe(resp => {
            this.mngMasterSubject.next({ result: resp, purpose: 'updateSysConfiguration' });
        });
    }
}