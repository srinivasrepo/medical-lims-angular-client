import { Component, ViewChild } from "@angular/core";
import { MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { LookupComponent } from '../../limsHelpers/component/lookup';
import { LookupInfo, LookUpDisplayField, GridActionFilterBOList } from '../../limsHelpers/entity/limsGrid';
import { CommonMethods, dateParserFormatter } from '../services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from '../../limsHelpers/entity/lookupTitles';
import { LookupCodes, GridActions, LimsRespMessages, ActionMessages, ButtonActions, EntityCodes } from '../services/utilities/constants';
import { PrepareOccupancyBO, ManageOccupancy } from '../services/utilities/commonModels';
import { CommonMessages } from '../messages/commonMessages';
import { AlertService } from '../services/alert.service';
import { CommonService } from '../services/commonServices';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService } from '../../limsHelpers/component/confirmationService';
import { PageTitle } from '../services/utilities/pagetitle';
import { GlobalButtonIconsService } from '../services/globalButtonIcons.service';

@Component({
    selector: 'lims-manageOcc',
    templateUrl: '../html/manageOccupancy.html'
})

export class ManageOccupancyComponent {

    occuFormGroup: FormGroup;
    get f() { return this.occuFormGroup.controls; }
    headersData: any;
    dataSource: any;
    action: Array<any> = [GridActions.edit, GridActions.Invalid];

    getDate: Date = new Date();
    pageType: string = 'MNG';
    occupancyBO: PrepareOccupancyBO;
    buttonType: string = ButtonActions.btnSave;
    eqpOthOccID: string;
    actionType: string;
    condition: string;
    isChanged: boolean = false;
    occupancyRequired: string = 'Y';
    equipmentInfo: LookupInfo;
    dateFieldType: string = 'BTN';
    occReqDispaly: boolean = true;
    entityCode: string;
    usrActions: GridActionFilterBOList;
    isAppPrimaryOcc: boolean = false;
    isRefEqpOcc: boolean = false;
    disableDateFromIcon: boolean;
    disableDateToIcon: boolean;
    @ViewChild('equipment', { static: false }) equipment: LookupComponent;

    refOccuInfo: LookupInfo;
    @ViewChild('refOccu', { static: false }) refOccu: LookupComponent;

    pageTitle: string = PageTitle.manageOccupancy;
    occCount: number = 0;
    comment: string;
    subscription: Subscription = new Subscription();
    removeActions = { headerName: 'statusCode', EDIT: 'INVALID', INVALID: 'INVALID', extraField: 'INVALID' };
    isLoaderStart: boolean = false;

    constructor(private _actMatDailog: MatDialogRef<ManageOccupancyComponent>, private _notify: AlertService,
        private _common: CommonService, private _fb: FormBuilder, private _confirm: ConfirmationService, public _global: GlobalButtonIconsService
    ) {
        this.occuFormGroup = _fb.group({
            occType: [''],
            dateFrom: ['', [Validators.required]],
            dateTo: ['', [Validators.required]],
            remarks: ['', [Validators.required]]
        })
    }

    ngAfterViewInit() {

        this.subscription = this._common.commonSubject.subscribe(resp => {
            if (resp.purpose == "manageOccupancy") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == "OK") {
                    if (this.actionType == 'MANAGE') {
                        this._notify.success(CommonMessages.manageOccupancy);
                        this.isChanged = true
                    }
                    else if (this.actionType == 'INVALID') {
                        this._notify.success(CommonMessages.invalidOccupancy);
                        this.isChanged = true
                    }

                    if (this.pageType == 'MNG')
                        this.clearControls();

                    this.prepareHeaderes();
                    this.occuFormGroup.enable();
                    if (CommonMethods.hasValue(this.equipment))
                        this.equipment.disableBtn = false;
                    this.disableDateFromIcon = this.disableDateToIcon = false;
                    this.eqpOthOccID = '';
                    this.occupancyRequired = CommonMethods.hasValue(resp.result.isOccRequired) ? resp.result.isOccRequired : 'Y';
                    this.comment = resp.result.comment;
                    if (this.occupancyRequired == 'N')
                        this.enableHeaders(false);
                    this.dataSource = resp.result.occuList;
                    this.usrActions = new GridActionFilterBOList();
                    this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(this.dataSource, 'filterTwiceCol', ['fromTime', 'toTime']));
                    this.occCount = resp.result.occuList.length;
                }
                else
                    this._notify.error(ActionMessages.GetMessageByCode(resp.result.returnFlag))
            }
            else if (resp.purpose == "getOccupancyDetails") {
                this.prepareHeaderes();
                this.dataSource = resp.result.occuList;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(this.dataSource, 'filterTwiceCol', ['fromDate', 'toDate']));
                this.occCount = resp.result.occuList.length;
            }
            else if (resp.purpose == 'dateFrom') {
                this.f.dateFrom.setValue(dateParserFormatter.FormatDate(resp.result, 'datetime'));
                this.f.dateTo.setValue('');
            }
            else if (resp.purpose == 'dateTo')
                this.f.dateTo.setValue(dateParserFormatter.FormatDate(resp.result, 'datetime'));
            else if (resp.purpose == "getRefEqpOthInfo") {
                this.f.dateFrom.setValue(dateParserFormatter.FormatDate(resp.result.fromTime, 'datetime'));
                this.f.dateTo.setValue(dateParserFormatter.FormatDate(resp.result.toTime, 'datetime'));
            }
        })

        if (this.pageType != 'MNG') {
            if (this.pageTitle == "Instrument Occupancy")
                this.pageTitle = "View Instrument Occupancy"
            else
                this.pageTitle = PageTitle.viewOccupancy;
            this.action = [];
        }
        else
            this.prepareEquipment();

        this.getOccupancyDetails();
    }

    getOccupancyDetails() {
        var obj: ManageOccupancy = new ManageOccupancy();
        this.actionType = 'GET';
        obj.type = this.actionType;
        obj.occSource = this.occupancyBO.occSource;
        obj.encEntityActID = this.occupancyBO.encEntityActID;
        obj.conditionCode = this.occupancyBO.conditionCode;
        obj.occSourceName = this.occupancyBO.occSourceName;

        this._common.manageOccupancy(obj);
    }

    prepareEquipment() {
        this.equipmentInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Equipment, LookupCodes.getActiveEquipments, this.entityCode == EntityCodes.mobilePhase ? LKPDisplayNames.EquipmentMP : LKPDisplayNames.Equipment, this.entityCode == EntityCodes.mobilePhase ? LKPDisplayNames.EquipmentCodeMP : LKPDisplayNames.EquipmentCode, LookUpDisplayField.code, LKPPlaceholders.Equipment, this.condition);
    }

    prepareHeaderes() {
        this.headersData = [];
        if (this.isAppPrimaryOcc)
            this.headersData.push({ "columnDef": 'occType', "header": "Occupancy Type", cell: (element: any) => `${element.occType}`, width: 'maxWidth-15per' });

        // this.headersData.push({ "columnDef": 'title', "header": "Instrument Title", cell: (element: any) => `${element.title}`, width: 'maxWidth-12per' });
        this.headersData.push({ "columnDef": 'eqpUserCode', "header": "Instrument ID", cell: (element: any) => `${element.eqpUserCode}`, width: 'maxWidth-15per' });
        // this.headersData.push({ "columnDef": 'eqpCategory', "header": "Instrument Category", cell: (element: any) => `${element.eqpCategory}`, width: 'maxWidth-20per' });
        this.headersData.push({ "columnDef": 'eqpType', "header": "Instrument Type", cell: (element: any) => `${element.eqpType}`, width: 'maxWidth-20per' });
        this.headersData.push({ "columnDef": 'fromTime', "header": "Reserved Date", cell: (element: any) => `${element.fromTime}`, width: 'maxWidth-15per' });
        this.headersData.push({ "columnDef": 'toTime', "header": "Released Date", cell: (element: any) => `${element.toTime}`, width: 'maxWidth-15per' });
        this.headersData.push({ "columnDef": 'duration', "header": "Duration", cell: (element: any) => `${element.duration}`, width: 'maxWidth-15per' });
        this.headersData.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}`, width: 'maxWidth-15per' });
    }

    displayHeaders(code: string) {
        if (code == 'TITLE')
            return this.entityCode == EntityCodes.mobilePhase ? 'Instrument Title' : 'Title';
        else if (code == 'TITLE_CODE')
            return this.entityCode == EntityCodes.mobilePhase ? 'Instrument ID' : 'Instrument Code';
    }

    enableHeaders(val: boolean) {
        this.buttonType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        val ? this.occuFormGroup.enable() : this.occuFormGroup.disable();
        if (CommonMethods.hasValue(this.equipment) && CommonMethods.hasValue(this.equipment.selectedId))
            this.equipment.disableBtn = !val;
    }

    onActionClicked(evt) {
        if (evt.action == "EDIT") {
            this.f.occType.setValue(evt.val.occupancyType);
            this.f.remarks.setValue(evt.val.remarks);
            this.equipment.setRow(evt.val.eqpID, evt.val.eqpUserCode);
            this.isRefEqpOcc = evt.val.isRefEqpOcc;
            this.equipment.disableBtn = CommonMethods.hasValue(this.equipment.selectedId) ? true : false;
            this.prepareRefLkp();

            this.f.dateFrom.setValue(dateParserFormatter.FormatDate(evt.val.fromTime, 'datetime'));
            this.f.dateTo.setValue(dateParserFormatter.FormatDate(evt.val.toTime, 'datetime'));
            if (CommonMethods.hasValue(this.f.dateFrom.value)) {
                this.f.dateFrom.disable();
                this.disableDateFromIcon = true;
            }
            if (CommonMethods.hasValue(this.f.dateTo.value)) {
                this.f.dateTo.disable();
                this.disableDateToIcon = true;
            }
            this.eqpOthOccID = evt.val.encEqpOthOccID;
            if (this.isRefEqpOcc)
                this.refOccu.setRow(evt.val.refEqpOccID, evt.val.refInvBatch);
        }
        else {

            this._confirm.confirm(LimsRespMessages.continue).subscribe(result => {
                if (result) {
                    var obj: ManageOccupancy = new ManageOccupancy();
                    this.actionType = 'INVALID';
                    obj.type = this.actionType;
                    obj.encEqpOthOccID = evt.val.encEqpOthOccID;
                    obj.occSource = this.occupancyBO.occSource;
                    obj.occSourceName = this.occupancyBO.occSourceName;
                    obj.conditionCode = this.occupancyBO.conditionCode;

                    obj.encEntityActID = this.occupancyBO.encEntityActID;
                    this._common.manageOccupancy(obj);
                }
            });
        }
    }

    save() {

        if (this.buttonType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        var retVal = this.validateControls();

        if (CommonMethods.hasValue(retVal))
            return this._notify.warning(retVal);

        this.actionType = 'MANAGE'
        this.prepareData();
    }

    prepareData() {
        var obj: ManageOccupancy = new ManageOccupancy();
        obj.occupancyRequired = this.occupancyRequired;
        obj.invID = this.occupancyBO.invID;
        obj.occupancyCode = this.occupancyBO.occupancyCode;
        obj.encEntityActID = this.occupancyBO.encEntityActID;

        obj.batchNumber = this.occupancyBO.batchNumber;
        obj.type = this.actionType;
        obj.occSource = this.occupancyBO.occSource;
        obj.occSourceName = this.occupancyBO.occSourceName;

        obj.encEqpOthOccID = this.eqpOthOccID;
        obj.entityRefNumber = this.occupancyBO.entityRefNumber;
        obj.conditionCode = this.occupancyBO.conditionCode;


        if (this.occupancyRequired == 'N')
            obj.comment = this.comment
        else {
            obj.occupancyType = this.f.occType.value;
            obj.fromTime = dateParserFormatter.FormatDate(this.f.dateFrom.value, 'datetime');
            obj.toTime = dateParserFormatter.FormatDate(this.f.dateTo.value, 'datetime');
            obj.eqpID = this.equipment.selectedId;
            obj.remarks = this.f.remarks.value;
            if (CommonMethods.hasValue(this.refOccu.selectedId))
                obj.refEqpOccID = this.refOccu.selectedId;

        }

        this.isLoaderStart = true;
        this._common.manageOccupancy(obj);
    }

    validateControls() {
        if (this.occReqDispaly && !CommonMethods.hasValue(this.occupancyRequired))
            return CommonMessages.occReq;
        if (this.occupancyRequired == 'Y' && this.isAppPrimaryOcc && !CommonMethods.hasValue(this.f.occType.value))
            return CommonMessages.occupancyType;
        if ((this.occupancyRequired == 'Y' || !this.occReqDispaly) && !CommonMethods.hasValue(this.equipment.selectedId))
            return CommonMessages.instrument;
        if (this.occupancyRequired == 'Y' && this.isRefEqpOcc && !CommonMethods.hasValue(this.refOccu.selectedId))
            return CommonMessages.refEqpOcc;
        else if ((this.occupancyRequired == 'Y' || !this.occReqDispaly) && !CommonMethods.hasValue(this.f.dateFrom.value))
            return CommonMessages.dateFrom;
        // else if (!CommonMethods.hasValue(this.f.dateTo.value))
        //     return CommonMessages.dateTo;

        else if ((this.occupancyRequired == 'Y' || !this.occReqDispaly) && CommonMethods.hasValue(this.f.dateTo.value) && (new Date(this.f.dateFrom.value).getTime() >= new Date(this.f.dateTo.value).getTime()))
            return CommonMessages.greateethanReserd;
        else if ((!CommonMethods.hasValue(this.f.remarks.value) && (this.occupancyRequired == 'Y' || !this.occReqDispaly)) || !CommonMethods.hasValue(this.comment) && this.occupancyRequired == 'N')
            return CommonMessages.comments;

    }

    onChangeDate(evt, type: string) {
        var date = dateParserFormatter.FormatDate(evt, 'default');
        if (type == 'dateFrom' && (CommonMethods.hasValue(this.f.dateTo.value) && date > this.f.dateTo.value))
            return this.f.dateTo.setValue('');
    }

    close() {
        var obj = { val: this.occCount, isChanged: this.isChanged }
        this._actMatDailog.close(obj);
    }

    clearControls() {
        this.occuFormGroup.reset({ occType: '', dateFrom: ' ', dateTo: ' ', remarks: ' ' });
        if (CommonMethods.hasValue(this.equipment))
            this.equipment.clear();
        if (CommonMethods.hasValue(this.refOccu))
            this.refOccu.clear();
        this.isRefEqpOcc = false;
    }

    isDisabled() {
        if (CommonMethods.hasValue(this.dataSource) && this.dataSource.data.length > 0) {
            var obj = this.dataSource.data.filter(o => o.statusCode != 'INVALID')
            return obj.length > 0 && this.occupancyRequired == 'Y'
        }
        return false;
    }

    getCurrentDateTime(type) {
        if (this.isRefEqpOcc || (type == 'dateFrom' && CommonMethods.hasValue(this.f.dateFrom.value)) || (type == 'dateTo' && CommonMethods.hasValue(this.f.dateTo.value) && this.f.dateTo.value != this.f.dateFrom.value))
            return;
        this._common.getCurrentDateTime(type);
    }

    prepareRefLkp(evt: any = "") {
        if (CommonMethods.hasValue(evt))
            this.isRefEqpOcc = evt.checked;
        if (CommonMethods.hasValue(this.refOccu))
            this.refOccu.clear();
        if (!this.isRefEqpOcc) {
            this.disableDateFromIcon = this.disableDateToIcon = false;
            this.f.dateFrom.enable(); this.f.dateTo.enable();
        }
        var condition: string = "1 = 2";
        if (CommonMethods.hasValue(this.isRefEqpOcc) && CommonMethods.hasValue(this.equipment.selectedId))
            condition = "EquipmentID = " + this.equipment.selectedId;

        this.refOccuInfo = CommonMethods.PrepareLookupInfo(LKPTitles.refEqpOcc, LookupCodes.getRefEqpOthOccupancyDetails, LKPDisplayNames.occSource, LKPDisplayNames.refInvBatch, LookUpDisplayField.code, LKPPlaceholders.refEqpOcc, condition, LKPDisplayNames.entRefNumber);
    }

    getRefEqpOCC(evt) {
        if (CommonMethods.hasValue(this.refOccu) && CommonMethods.hasValue(this.refOccu.selectedId))
            this._common.getRefEqpOthInfo(this.refOccu.selectedId);
        else {
            this.f.dateFrom.setValue(null);
            this.f.dateTo.setValue(null);
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}