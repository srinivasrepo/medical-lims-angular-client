import { Injectable } from '@angular/core'
import { LIMSContext } from './utilities/limsContext';
import { PageTitle } from './utilities/pagetitle';
import { CommonMethods, CustomLocalStorage, LOCALSTORAGE_KEYS } from './utilities/commonmethods';
import { Constants, CapabilityActions } from './utilities/constants';

@Injectable()

export class LIMSContextServices {

    limsContext: LIMSContext = new LIMSContext();
    pageTitle: string = PageTitle.title;
    status: string;
    refNo: string;
    viewHistory: any;
    viewHistoryVisible: boolean = false;
    entityType: string;

    constructor() {
        if (sessionStorage.getItem("limsContext")) {
            this.limsContext = JSON.parse(sessionStorage.getItem("limsContext"));
        }

        if (sessionStorage.getItem("entitytype"))
            this.entityType = sessionStorage.getItem("entitytype");
    }

    setSession() {
        sessionStorage.setItem("limsContext", JSON.stringify(this.limsContext));
    }

    clearSession() {
        sessionStorage.clear();
        this.limsContext = new LIMSContext();
        CommonMethods.removeLocalItems(Constants.entityKey);
    }

    getEntityType() {
        return sessionStorage.getItem("entitytype");
    }

    hasCapability(entityCode: string, capCode: string) {
        if (this.limsContext.capabilities != undefined) {
            var index = this.limsContext.capabilities.findIndex(objData => objData.entityCode == entityCode && objData.capabilityCode == capCode)
            return (index > -1)
        }
        else
            return false;

    }

    getSearchActinsByEntityCode(entityCode: string, hasEditCap: boolean = true, createCapa: string = 'CRE', rs232ntegrationCapa: string = null) {
        var actions: Array<any> = [];
        var obj = new CapabilityActions();

        if (this.limsContext.capabilities != undefined) {
            this.limsContext.capabilities.filter(objData => objData.entityCode == entityCode && objData.capabilityCode != 'CRE' && objData.capabilityCode != "EXP" && objData.capabilityCode != "MNG_CAPA" &&
                (objData.capabilityCode != 'UPD' || (objData.capabilityCode == 'UPD' && hasEditCap))).forEach((item) => {
                    actions.push(item.capabilityCode);
                });
        }

        obj.actionList = actions;
        obj.createCap = this.hasCapability(entityCode, createCapa);
        obj.exportCap = this.hasCapability(entityCode, "EXP");
        if (entityCode == 'ROLE_MGMT')
            obj.manageCapability = this.hasCapability(entityCode, 'MNG_CAPA')

        if (rs232ntegrationCapa)
            obj.manageCapability = this.hasCapability(entityCode, rs232ntegrationCapa)
        else
            obj.actionList = this.removeRS232IntegrationAction(actions);
        return obj;
    }

    // REMOVED RS232 ACTION FROM SEARCH GRID TABLE

    private removeRS232IntegrationAction(actions: Array<any> = []): Array<any> {
        if (actions.findIndex(x => x == "RS232_INTEGRATION") > -1)
            actions.splice(actions.findIndex(x => x == "RS232_INTEGRATION"), 1);

        return actions;
    }

    isLogged() {
        return CustomLocalStorage.getSession(LOCALSTORAGE_KEYS.limsContext);
    }
}