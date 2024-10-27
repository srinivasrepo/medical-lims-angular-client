import { Component, AfterContentInit, OnDestroy, ViewChildren, ViewChild } from "@angular/core";
import { Subscription } from 'rxjs';
import { LimsHelperService } from '../services/limsHelpers.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { MatDialogRef } from '@angular/material';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { LookupInfo, LookUpDisplayField, RS232IntegrationModelBO, GetRs232IntegrationDetailsBO } from '../entity/limsGrid';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from '../entity/lookupTitles';
import { LookupCodes, EntityCodes, ActionMessages, LimsRespMessages } from 'src/app/common/services/utilities/constants';
import { LimsHelperMessages } from '../messages/limsMessages';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { LookupComponent } from './lookup';
import { ConfirmationService } from "./confirmationService";
import { CommonMessages } from "src/app/common/messages/commonMessages";

@Component({
    selector: 'app-rs232',
    templateUrl: '../html/rs232Integration.html'
})

export class RS232IntergrationComponent implements AfterContentInit, OnDestroy {

    rsObj: RS232IntegrationModelBO = new RS232IntegrationModelBO();
    equipmentInfo: LookupInfo;
    @ViewChild('equipment', { static: false }) equipment: LookupComponent;
    entityCode: string;
    condition: string = 'EQP_CAT_CODE =\'QCINST_TYPE\'';

    rsObjDetails: GetRs232IntegrationDetailsBO = new GetRs232IntegrationDetailsBO();
    pageType: string = "MNG";
    btnType: string = 'MNG';
    isRefEqpOcc: boolean;

    subscription: Subscription = new Subscription();

    rs232IntSDMSBOList: Array<any> = [];
    filteredDetailsList: Array<any> = [];
    singleMapDetailsBO: Array<any> = [];

    sdmsID: number;
    singleVal: number;
    tempValue: string;

    dynamicDataSource: any;
    dynamicColumns: any;
    dynamicDisplayedColumns: any;
    objectInfo: any = {};


    sdmsInfo: LookupInfo;
    @ViewChildren('sdmsData') sdmsData: LookupComponent;
    refOccuInfo: LookupInfo;
    @ViewChild('refOccu', { static: false }) refOccu: LookupComponent;

    integrationID: number;

    // new 
    objectHeaders: Array<any> = [];
    dataSourceData: any;
    dataPrepared: boolean = false;

    isLoaderStart: boolean;

    constructor(private _service: LimsHelperService, private _alert: AlertService,
        private _matDailogRef: MatDialogRef<RS232IntergrationComponent>, public _global: GlobalButtonIconsService,
        private _confirm: ConfirmationService) {

    }

    ngAfterContentInit() {
        this.subscription = this._service.limsHelperSubject.subscribe(resp => {
            if (resp.purpose == "manageRs232Integration") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == "OK") {
                    this._alert.success(LimsHelperMessages.successInstrPosted);
                    this.rsObjDetails = resp.result;
                    this.managePageControls();
                }
                else if (ActionMessages.GetMessageByCode(resp.result.returnFlag) == resp.result.returnFlag)
                    this._alert.error(LimsHelperMessages.invalidRs232 + resp.result.returnFlag)
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag))
            }
            else if (resp.purpose == "getRs232Integration") {

                this.rsObjDetails = resp.result;
                this.managePageControls();

            }
            else if (resp.purpose == "eQPUpdateToDateTime") {
                if (resp.result == "OK") {
                    this._alert.success(LimsHelperMessages.successUpdateTodate);
                    this.close(true);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == "resetRs232EqpOtherOcc") {
                this.isLoaderStart = false;
                if (resp.result == "OK") {
                    this._alert.success(LimsHelperMessages.successResetRs232integration);
                    this.rsObjDetails = null;
                    this.close(true);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == 'getsdmsDetails') {
                this.dataSourceData = resp.result.dataProcessed;
                this.dynamicTableDetails(resp.result.dataProcessed);
            }
        })

        this.prepareEquipment();
        this.getLatestSDMSDetails();
    }

    prepareRefLkp(evt: any = "") {
        if (CommonMethods.hasValue(evt))
            this.isRefEqpOcc = evt.checked;
        else
            this.isRefEqpOcc = false;

        if (CommonMethods.hasValue(this.refOccu))
            this.refOccu.clear();

        var condition: string = "1 = 2";
        if (CommonMethods.hasValue(this.isRefEqpOcc) && CommonMethods.hasValue(this.equipment.selectedId))
            condition = "EquipmentID = " + this.equipment.selectedId;

        this.refOccuInfo = CommonMethods.PrepareLookupInfo(LKPTitles.refEqpOcc, LookupCodes.getRefEqpOthOccupancyDetails, LKPDisplayNames.occSource, LKPDisplayNames.refInvBatch, LookUpDisplayField.code, LKPPlaceholders.refEqpOcc, condition, LKPDisplayNames.entRefNumber);
    }

    managePageControls() {
        if (this.rsObjDetails.equipment) {
            this.integrationID = this.rsObjDetails.rsIntegrationID;
            this.pageType = "GET";
        }
        this.prepareLKPSDMSDetails();
    }

    prepareLKPSDMSDetails() {
        // this.sdmsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.sdms, LookupCodes.getSDMSDetails, LKPDisplayNames.sdmsTitle, LKPDisplayNames.sdmsCode, LookUpDisplayField.code, LKPPlaceholders.sdms, "SamAnaTestID = " + this.integrationID, null, "LIMS", null, null, LKPDisplayNames.prepRunNo);
        this.sdmsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.sdms, LookupCodes.getSDMSDetails, LKPDisplayNames.sdmsTitle, LKPDisplayNames.sdmsCode, LookUpDisplayField.code, LKPPlaceholders.sdms, "ParentID = [" + this.rsObj.parentID + '] AND SectionCode = ' + "'" + this.rsObj.sectionCode + "'", null, "LIMS", null, null, LKPDisplayNames.prepRunNo);
    }

    getSDMSData(evt) {

        if (evt.val) {
            var obj: any = {};
            obj['isGetARDSExecDetails'] = false;
            obj['sdmsID'] = evt.val.id;

            this._service.getMappingInfo(obj);
        }
        else
            this.dataPrepared = false;
    }

    dynamicTableDetails(val: any) {

        this.dynamicColumns = [];
        this.dynamicDisplayedColumns = [];
        this.dynamicDataSource = [];


        // new start 
        this.objectHeaders = [];

        this.objectInfo = JSON.parse(val);
        var jsonTableList: Array<any> = []

        if (this.objectInfo.DetailsList) {
            this.objectInfo.DetailsList.forEach((item, index) => {
                Object.keys(item).forEach((key) => {
                    if (key == 'Key')
                        this.objectHeaders.push({ key: item[key], field: this.getConvertedFieldName(item[key]), KeyField: 'KEY_VALUE' });
                })
            })
        }

        if (this.objectInfo.jsonTableInfo)
            this.objectInfo.jsonTableInfo.forEach((item, index) => {
                if (index > 0)
                    jsonTableList.concat(item)
                else
                    jsonTableList = JSON.parse(item);
            })

        if (jsonTableList.length > 0)
            this.setKeyColumns(jsonTableList);

        if (jsonTableList.length > 0)
            jsonTableList.forEach((child) => { // dynamic table list
                this.dynamicDataSource.push(child);
            })

        this.setDisplayedColumns();

        this.dynamicDataSource = CommonMethods.bindMaterialGridData(this.dynamicDataSource);

        this.dataPrepared = true;

        // new end




        // var obj = this.rsObjDetails.sdmsList.filter(x => x.sdmsID == this.sdmsID);

        // if (val) {

        //     this.objectInfo = JSON.parse(obj[0].dataProcessed);

        //     this.objectInfo = JSON.parse(val);
        //     var jsonTableList: Array<any> = []

        //     if (this.objectInfo.jsonTableInfo)
        //         this.objectInfo.jsonTableInfo.forEach((item, index) => {
        //             if (index > 0)
        //                 jsonTableList.concat(item)
        //             else
        //                 jsonTableList = JSON.parse(item);
        //         })

        //     if (jsonTableList.length > 0) {
        //         this.setKeyColumns(jsonTableList);

        //         jsonTableList.forEach((child) => { // dynamic table list
        //             this.dynamicDataSource.push(child);
        //         })
        //     }

        //     this.setDisplayedColumns();

        //     this.dynamicDataSource = CommonMethods.bindMaterialGridData(this.dynamicDataSource);

        //     // var obj = JSON.parse(this.singleMapDetailsBO[0].dataProcessed);
        //     this.singleMapDetailsBO = this.objectInfo.DetailsList;

        // }

    }

    setKeyColumns(jsonTableList: any) {

        jsonTableList.forEach((obj) => {
            Object.keys(obj).forEach((item) => {
                if (this.dynamicColumns.length > 0) {
                    var index = this.dynamicColumns.findIndex(x => x.key == item);
                    if (index == -1)
                        this.dynamicColumns.push({ key: item, field: item })
                }
                else
                    this.dynamicColumns.push({ key: item, field: item })
            })
        })

    }

    setDisplayedColumns() {

        this.dynamicColumns.forEach((colunm, index) => {
            colunm.index = index;
            this.dynamicDisplayedColumns[index] = colunm.key;
        });

    }


    Allowdecimal(evt) {
        return CommonMethods.allowDecimal(evt, CommonMethods.allowDecimalLength, 5, 10);
    }

    // changeSDMSDetails() {


    //     this.singleMapDetailsBO = this.rs232IntSDMSBOList.filter(x => x.sdmsID == this.sdmsID)

    //     var obj = JSON.parse(this.singleMapDetailsBO[0].dataProcessed);
    //     this.singleMapDetailsBO = obj.DetailsList;


    //     // var obj = JSON.parse(this.rsObjDetails.sdmsList[0].dataProcessed);
    //     // this.singleMapDetailsBO = obj.DetailsList;


    // }

    drop(event: CdkDragDrop<any[]>) {

        if (event.previousContainer === event.container) {

            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

        } else {

            // Check Same cdk-drop-list 

            if ((event.item.element.nativeElement.id).split('-')[0] == 'Temp') {
                if (event.item.data) {
                    this.tempValue = event.item.data.value.split(' ')[0]
                    if (Number(this.tempValue) > 0) {
                        event.item.data.value = this.tempValue;
                        this.singleVal = parseInt(this.tempValue);
                        this.filteredDetailsList = [];
                        this.filteredDetailsList.push(event.item.data);
                    }
                }
            }
        }
    }


    removeInputValue(item: any) {
        this.filteredDetailsList = [];
    }

    prepareEquipment() {
        this.equipmentInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Equipment, LookupCodes.getActiveEquipments, this.entityCode == EntityCodes.mobilePhase ? LKPDisplayNames.EquipmentMP : LKPDisplayNames.Equipment, this.entityCode == EntityCodes.mobilePhase ? LKPDisplayNames.EquipmentCodeMP : LKPDisplayNames.EquipmentCode, LookUpDisplayField.header, LKPPlaceholders.Equipment, this.condition);
    }

    getLatestSDMSDetails() {
        this._service.getRs232Integration(this.rsObj);
    }

    updateValue() {

        var value: number;

        if (this.filteredDetailsList.length > 0) {
            value = this.filteredDetailsList[0].value

            if (parseInt(this.filteredDetailsList[0].value) != this.singleVal)
                return this._alert.warning(LimsHelperMessages.precisionVal);
        }


        this.singleVal = value;

        if (!this.rsObjDetails.toDate)
            this._service.eQPUpdateToDateTime(this.rsObjDetails.encOccupancyID);
        else
            this.close(true);
        // this._matDailogRef.close(value);
    }

    proceed() {
        if (!CommonMethods.hasValue(this.rsObj.rs232Mode))
            return this._alert.warning(LimsHelperMessages.rs232Mode);

        else if (!CommonMethods.hasValue(this.rsObj.instrumentID))
            return this._alert.warning(LimsHelperMessages.instrumentOne);
        else if (this.isRefEqpOcc && !this.refOccu.selectedId)
            return this._alert.warning(CommonMessages.refEqpOcc);

        this.isLoaderStart = true;

        if (this.isRefEqpOcc)
            this.rsObj.refEqpOccID = this.refOccu.selectedId;

        this._service.manageRs232Integration(this.rsObj);
    }

    changeSelectInstrument(evt) {
        if (evt.val)
            this.rsObj.instrumentID = evt.val.id;
        else
            this.rsObj.instrumentID = null;

        this.prepareRefLkp();
    }

    close(isClose: boolean = false) {
        if (isClose)
            this._matDailogRef.close({ singleVal: this.singleVal, actualVal: this.tempValue });
        else
            this._matDailogRef.close();
    }

    reset() {

        this._confirm.confirm(LimsRespMessages.rsIntegrationReset).subscribe(resp => {
            if (resp) {
                this.isLoaderStart = true;
                this._service.resetRs232EqpOtherOcc(this.rsObjDetails.encRSIntegrationID);
            }

        })
    }

    getConvertedFieldName(key: string) {
        var keyVal = "";

        if (!key)
            return keyVal;

        var i = 0;
        for (let index = 0; index < key.length; index++) {
            if (index == 0)
                keyVal = key[index].toUpperCase()
            else if (key[index].toUpperCase() == key[index] && i == 0) {
                keyVal += ' ' + key[index];
                i++;
            }
            else
                keyVal += key[index];

        }

        return keyVal;
    }

    getObjectDataList(key: string, type: string) {

        if (type == "EX_HEAD_LIST") {
            if (key == 'result' && CommonMethods.hasValue(this.dataSourceData[key]) && CommonMethods.hasValue(this.dataSourceData['resultTo']))
                return this.dataSourceData[key] + ' - ' + this.dataSourceData['resultTo']
            else
                return this.dataSourceData[key];
        }
        else if (type == "EX_OBJ_LIST")
            return this.dataSourceData['obj'][key];
        else if (type == "KEY_VALUE") {

            if (this.objectInfo && this.objectInfo.DetailsList && this.objectInfo.DetailsList.length > 0) {
                var index = this.objectInfo.DetailsList.findIndex(x => x.Key == key);

                if (index > -1)
                    return this.objectInfo.DetailsList[index].Value;
            }
        }

    }



    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}   