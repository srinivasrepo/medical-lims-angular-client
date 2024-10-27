import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { LIMSHttpService } from './limsHttp.service';
import { CommonMethods } from './utilities/commonmethods';
import { ServiceUrls } from './utilities/serviceurls';
import { ManageOccupancy, ExportBO } from './utilities/commonModels';
import { LimsHelperUrl } from '../../limsHelpers/services/limsHelpersServiceUrl';
import { AddMaterial, ParamMasterObj, CAPAInsertUpdateCAPA, GetCAPAActionsBySourceRefType } from '../model/commonModel';
import { TestComment } from 'src/app/login/model/login';
import { SampleAnalysisServiceUrl } from "src/app/sampleAnalysis/service/sampleAnalysisServiceUrl";

@Injectable({
    providedIn: 'root'
})

export class CommonService {

    commonSubject: Subject<any> = new Subject();

    constructor(private limsHttpService: LIMSHttpService) { }

    getCategoryItemsByCatCode(catCode: string) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getCatItems, [catCode]))
            .subscribe(resp => {
                this.commonSubject.next({ "item": resp, "catCode": catCode });
            })
    }

    getCategoryItems(catCode: string, type: string = "MNG") {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.GetCatItemsByCatCode, [catCode, type]))
            .subscribe(resp => {
                this.commonSubject.next({ "result": resp, "purpose": catCode });
            })
    }

    GetToDoListByCondition(conditionID: number) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getToDoListByCondition, [conditionID.toString()]))
            .subscribe(resp => {
                this.commonSubject.next({ "result": resp, "purpose": "todoList", "conditionID": conditionID.toString() });
            })
    }

    GetToDoListCounts(entityType: string) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getToDoListCounts, [entityType]))
            .subscribe(resp => {
                this.commonSubject.next({ "result": resp, "purpose": "todoCount" });
            })
    }

    ViewHistory(encEntActD, conditionCode) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.viewHistory, [encEntActD, conditionCode]))
            .subscribe(resp => {
                this.commonSubject.next({ "result": resp, "purpose": "ViewHistory" });
            })
    }

    manageOccupancy(obj: ManageOccupancy) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.manageOccupancy, []), obj)
            .subscribe(resp => {
                this.commonSubject.next({ "result": resp, "purpose": "manageOccupancy" });
            })
    }

    getChecklistItemsByCategory(encEntActD, catCode, entityCode) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getChecklistItemsByCategory, [encEntActD, catCode, entityCode])).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: "getChecklistItemsByCategory" });
        });
    }

    mangeChecklistAnswers(obj) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.mangeChecklistAnswers, []), obj).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: "mangeChecklistAnswers" });
        });
    }

    getMaterialCategories() {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.getMaterialCategories, [])).subscribe(resp => {
            this.commonSubject.next({ "result": resp, "purpose": "getMaterialCategories" });
        })
    }

    getMaterialSubCategories(code) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.getMaterialSubCategories, [code])).subscribe(resp => {
            this.commonSubject.next({ "result": resp, "purpose": "getMaterialSubCategories" });
        })
    }

    getParamMasterData(obj: ParamMasterObj, code) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.getParamMasterData, []), obj)
            .subscribe(resp => {
                this.commonSubject.next({ "result": resp, "purpose": code });
            })
    }

    addNewMaterial(obj: AddMaterial) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.addNewMaterial, []), obj)
            .subscribe(resp => {
                this.commonSubject.next({ "result": resp, "purpose": "addNewMaterial" });
            })
    }

    getPendingActivities() {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getPendingActivities, [])).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: "getPendingActivities" });
        });
    }

    addCommentForCompletedTask(obj: TestComment) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.addCommentForCompletedTask, []), obj).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: "addCommentForCompletedTask" });
        });
    }


    getAllSamplePlanAssignedAnalysts() {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getAllSamplePlanAssignedAnalysts, [])).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: "getAllSamplePlanAssignedAnalysts" });
        });
    }

    getCurrentDateTime(type) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getCurrentDateTime, [])).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: type });
        });
    }

    getRefEqpOthInfo(eqpOthID: any) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getRefEqpOthInfo, [eqpOthID])).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: "getRefEqpOthInfo" });
        });
    }
    // material uom converion

    getUomsToConvert(materialID) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getUomsToConvert, [materialID])).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: 'getUomsToConvert' });
        });

    }

    getMaterialUOMConvertions() {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.getMaterialUOMConvertions, [])).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: "getMaterialUOMConvertions" });
        });
    }

    getMaterialUomDetails(materialID) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getMaterialUomDetails, [materialID])).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: 'getMaterialUomDetails' });
        });
    }

    addMaterialConvertData(obj: any) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.addMaterialConvertData, []), obj).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: 'addMaterialConvertData' });
        });
    }

    changeUomConvertionStatus(convertedID) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.changeUomConvertionStatus, [convertedID])).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: "changeUomConvertionStatus" });
        });
    }

    getDeviationDescription(entityCode, dcActionCode) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getDeviationDescription, [entityCode, dcActionCode])).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: 'getDeviationDescription' });
        });
    }

    getSDMSDetails() {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getSDMSDetails, [])).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: 'getSDMSDetails' });
        });
    }

    getExportColumns(entityCode) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getExportColumns, [entityCode])).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: 'getExportColumns' });
        });
    }

    exportData(obj: ExportBO) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.exportData, []), obj).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: 'exportData' });
        });
    }

    getSpecHeaderInfo(encSpecID: string, encCalibID: string) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.getSpecHeaderInfo, [encSpecID, encCalibID])).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: 'getSpecHeaderInfo' });
        });
    }

    CAPAGetCAPAActionsBySourceRefType(obj: GetCAPAActionsBySourceRefType) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.CAPAGetCAPAActionsBySourceRefType, []), obj).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: "CAPAGetCAPAActionsBySourceRefType" + obj.capaType })
        });
    }

    CAPAInsertUpdateCAPA(obj: CAPAInsertUpdateCAPA) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.CAPAInsertUpdateCAPA, []), obj).subscribe(resp => {
            this.commonSubject.next({ result: resp, purpose: "CAPAInsertUpdateCAPA" })
        });
    }
}