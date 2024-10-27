import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';
import { LIMSHttpService } from 'src/app/common/services/limsHttp.service';
import { ManageQcInvtDetails, OpenPackDetails, GetPackDetailsBO, BatchSplitBO, GetBlockList } from '../model/QCInventorymodel';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { QCInvtServiceUrls } from './QCInvServiceUrls';
import { ServiceUrls } from 'src/app/common/services/utilities/serviceurls';
import { LimsHelperUrl } from 'src/app/limsHelpers/services/limsHelpersServiceUrl';
import { CommentsBO } from 'src/app/mobilePhase/model/mobilePhaseModel';
import { UomDenominationObj } from 'src/app/limsHelpers/entity/limsGrid';


@Injectable()

export class QCInventoryService {

    QCInventSubject: Subject<any> = new Subject();
    constructor(private _qcinvtService: LIMSHttpService) { }

    getQCInventoryDetails(encInvSourceID: string) {
        this._qcinvtService.getDataFromService(CommonMethods.formatString(QCInvtServiceUrls.getQCInventoryDetails, [encInvSourceID])).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "getQCInventoryDetails" });
        });
    }

    getQCInvPackDetails(invID) {
        this._qcinvtService.getDataFromService(CommonMethods.formatString(QCInvtServiceUrls.getQCInvPackDetails, [invID])).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "getQCInvPackDetails" });
        });
    }

    manageQCInvPackDetails(obj) {
        this._qcinvtService.postDataToService(CommonMethods.formatString(QCInvtServiceUrls.manageQCInvPackDetails, []), obj).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "manageQCInvPackDetails" });
        });
    }


    getBlocks(DeptCode: string) {
        this._qcinvtService.getDataFromService(CommonMethods.formatString(QCInvtServiceUrls.getBlocks, [DeptCode])).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: 'getBlocks' });
        });
    }

    getCategoryItemsByCatCode(code,type:string = "MNG") {
        this._qcinvtService.getDataFromService(CommonMethods.formatString(ServiceUrls.GetCatItemsByCatCode, [code,type])).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: code });
        });
    }

    getCatItemsByCatCodeList(obj) {
        this._qcinvtService.postDataToService(CommonMethods.formatString(ServiceUrls.getCatItemsByCatCodeList, []), obj).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: 'getCatItemsByCatCodeList' });
        });
    }

    manageQCBatchDetails(obj) {
        this._qcinvtService.postDataToService(CommonMethods.formatString(QCInvtServiceUrls.manageQCBatchDetails, []), obj).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "manageQCBatchDetails" });
        });
    }

    manageQcInventory(obj: ManageQcInvtDetails) {
        this._qcinvtService.postDataToService(CommonMethods.formatString(QCInvtServiceUrls.manageQcInvt, []), obj).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "manageQcInvt" });
        });
    }

    getMaterialDetailsByID(matID: number) {
        this._qcinvtService.getDataFromService(CommonMethods.formatString(QCInvtServiceUrls.getMaterialDetailsByID, [matID.toString()])).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "getMaterialDetailsByID" });
        });
    }

    viewInvtDetailsByInvID(obj: GetPackDetailsBO) {
        this._qcinvtService.postDataToService(CommonMethods.formatString(QCInvtServiceUrls.viewInvtDetailsByInvID, []), obj).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "viewInvtDetailsByInvID" });
        });
    }

    searchQCInventory(obj) {
        this._qcinvtService.postDataToService(CommonMethods.formatString(QCInvtServiceUrls.searchQCInventory, []), obj)
            .subscribe(resp => {
                this.QCInventSubject.next({ "result": resp, "purpose": "searchQCInventory" });
            })
    }

    getStatusList(code: string) {
        this._qcinvtService.getDataFromService(CommonMethods.formatString(QCInvtServiceUrls.getStatusList, [code]))
            .subscribe(resp => {
                this.QCInventSubject.next({ "result": resp, "purpose": "getStatusList" });
            })
    }

    getValidityPeriods(code: string) {
        this._qcinvtService.getDataFromService(CommonMethods.formatString(QCInvtServiceUrls.getValidityPeriods, [code]))
            .subscribe(resp => {
                this.QCInventSubject.next({ "result": resp, "purpose": "getValidityPeriods" });
            })
    }

    getMaterialUOMConvertions(baseUOM: string) {
        this._qcinvtService.getDataFromService(CommonMethods.formatString(LimsHelperUrl.getMaterialUOMConvertions, [baseUOM])).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "getMaterialUOMConvertions" });
        });
    }

    getMiscConsumptionDetails(packInvID) {
        this._qcinvtService.getDataFromService(CommonMethods.formatString(QCInvtServiceUrls.getMiscConsumptionDetails, [packInvID])).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "getMiscConsumptionDetails" });
        });
    }

    manageMiscConsumptionData(obj) {
        this._qcinvtService.postDataToService(CommonMethods.formatString(QCInvtServiceUrls.manageMiscConsumptionData, []), obj).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "manageMiscConsumptionData" });
        });
    }

    openPack(obj: OpenPackDetails) {
        this._qcinvtService.postDataToService(CommonMethods.formatString(QCInvtServiceUrls.openPack, []), obj)
            .subscribe(resp =>
                this.QCInventSubject.next({ "result": resp, "purpose": "openPack" }));
    }

    manageDiscardCommnets(obj: CommentsBO) {
        this._qcinvtService.postDataToService(CommonMethods.formatString(QCInvtServiceUrls.manageDiscardCommnets, []), obj)
            .subscribe(resp => {
                this.QCInventSubject.next({ result: resp, purpose: "manageDiscardCommnets" });
            });
    }

    getUOMConvertionDenomination(obj: UomDenominationObj) {
        this._qcinvtService.postDataToService(CommonMethods.formatString(LimsHelperUrl.getUOMConvertionDenomination, []), obj).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "getUOMConvertionDenomination" });
        });
    }

    getPackInvReserDetails(encPackInvID: string) {
        this._qcinvtService.getDataFromService(CommonMethods.formatString(QCInvtServiceUrls.getPackInvReserDetails, [encPackInvID])).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "getPackInvReserDetails" });
        });
    }

    getQCInventorySources() {
        this._qcinvtService.getDataFromService(CommonMethods.formatString(QCInvtServiceUrls.getQCInventorySources, [])).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "getQCInventorySources" });
        })
    }

    generateNewBatchSplit(obj: BatchSplitBO) {
        this._qcinvtService.postDataToService(CommonMethods.formatString(QCInvtServiceUrls.generateNewBatchSplit, []), obj).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "generateNewBatchSplit" });
        });
    }

    deleteInvBatchSplit(encInvID: string) {
        this._qcinvtService.getDataFromService(CommonMethods.formatString(QCInvtServiceUrls.deleteNewBatchSplit, [encInvID])).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "deleteNewBatchSplit" });
        })
    }

    sendBatchForSample(invID: string) {
        this._qcinvtService.getDataFromService(CommonMethods.formatString(QCInvtServiceUrls.sendBatchForSample, [invID])).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "sendBatchForSample" });
        })
    }

    getBlockByPlantID(obj :GetBlockList) {
        this._qcinvtService.postDataToService(CommonMethods.formatString(QCInvtServiceUrls.getBlockByPlantID,[]),obj).subscribe(resp => {
            this.QCInventSubject.next({ result: resp, purpose: "getBlockByPlantID" });
        })
    }


}
