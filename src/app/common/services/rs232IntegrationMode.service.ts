import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LIMSHttpService } from './limsHttp.service';
import { RS232IntegrationBO } from './utilities/commonModels';
import { CommonMethods, CustomLocalStorage, LOCALSTORAGE_KEYS, LOCALSTORAGE_VALUES } from './utilities/commonmethods';
import { ServiceUrls } from './utilities/serviceurls';
import { CapabilityActions, EntityCodes } from './utilities/constants';
import { LIMSContextServices } from './limsContext.service';

@Injectable({
    providedIn: 'root'
})

export class RS232IntegrationModeService {

    reqCode: string = 'OFF';
    type: string;

    subject: Subject<any> = new Subject();

    constructor(private _http: LIMSHttpService, private _context: LIMSContextServices) {
        this.subscription();
    }

    manageRS232Status(obj: RS232IntegrationBO) {

        if (obj.type != 'GET')
            obj.reqCode = this.reqCode == 'ON' ? 'OFF' : 'ON';

        obj.conditionCode = localStorage.getItem('conditionCode');
        this.type = obj.type;

        obj.sectionCode = CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE);


        this._http.postDataToService(CommonMethods.formatString(ServiceUrls.manageRS232RequestMode, []), obj).subscribe(resp => {
            this.subject.next({ purpose: "manageRS232Status", result: resp, reqCode: obj.reqCode, isClicked: obj.isClicked });
        })
    }


    getRSIntegrationStatus() {

        var obj: CapabilityActions = new CapabilityActions();

        var entityCode: string = localStorage.getItem('entityCode');

        obj = this._context.getSearchActinsByEntityCode(entityCode, false, null, EntityCodes.rs232_INTEGRATION);

        var mainObj: CapabilityActions = new CapabilityActions();
        mainObj = this._context.getSearchActinsByEntityCode(EntityCodes.rs232StatusMain);

        return mainObj.actionList.length > 0 && mainObj.actionList[0] == "ON" && obj.manageCapability;



        // if (obj.actionList.length > 0)
        //     return obj.actionList[0] == "ON";
        // else
        //     return false;

    }

    getRS232IntegrationValidation() {
        var mainObj: CapabilityActions = new CapabilityActions();
        mainObj = this._context.getSearchActinsByEntityCode(EntityCodes.rs232StatusMain);

        return mainObj.actionList.length > 0 && mainObj.actionList[0] == "ON";

    }

    getRSIntegrationReqStatus() {
        return this.reqCode == 'ON';
    }

    subscription() {
        this.subject.subscribe(resp => {
            if (resp.purpose == "manageRS232Status") {
                if (this.type == 'GET')
                    this.reqCode = !resp.result ? this.reqCode : resp.result;
                else if (this.type != 'GET')
                    this.reqCode = resp.reqCode;

                CustomLocalStorage.dynamicValSetItem(LOCALSTORAGE_KEYS.RS232_STATUS, this.reqCode);

                if (resp.isClicked)
                    CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.IS_RS232_IS_CLICKED, LOCALSTORAGE_VALUES.ON);
            }
        })
    }

}   