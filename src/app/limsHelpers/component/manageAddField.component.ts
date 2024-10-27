import { AfterContentInit, Component, Input, OnDestroy } from "@angular/core";
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { RS232IntegrationModeService } from 'src/app/common/services/rs232IntegrationMode.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ButtonActions } from 'src/app/common/services/utilities/constants';
import { ManageRS232IntegrationFieldsBO, RS232IntegrationModelBO } from '../entity/limsGrid';
import { LimsHelperMessages } from '../messages/limsMessages';
import { LimsHelperService } from '../services/limsHelpers.service';

@Component({
    selector: 'manage-add-field',
    templateUrl: '../html/manageAddField.html'
})
export class ManageAddFieldComponent extends GlobalButtonIconsService implements AfterContentInit, OnDestroy {

    /**
     * REMOVE  @param pageAction, 
     *         @param disableAll
     */

    @Input() pageAction: string = 'MNG';
    @Input() disableAll: boolean = false;
    @Input() sectionCode: string;

    @Input() obj: ManageRS232IntegrationFieldsBO = new ManageRS232IntegrationFieldsBO();
    @Input() isViewPage: boolean = false;

    otherFieldsList: Array<any> = [];
    isLoaderStart: boolean = false;
    buttonType: string = ButtonActions.btnSave;
    subscription: Subscription = new Subscription();

    constructor(private _service: LimsHelperService, private _alert: AlertService,
        private _rs232Mode: RS232IntegrationModeService) {
        super()
    }

    ngAfterContentInit() {
        this.subscription = this._service.limsHelperSubject.subscribe(resp => {
            if (resp.purpose == "getRS232IntegrationOther") {
                this.otherFieldsList = resp.result;

                if (this.otherFieldsList.length > 0)
                    this.enableFields(false);

            }
            else if (resp.purpose == "manageRS232OtherFieldsValues") {
                this.isLoaderStart = false;
                if (resp.result == "OK") {
                    this._alert.success(LimsHelperMessages.successManageRS232OtherFieldsValues);
                    this.enableFields(false);
                }
            }
        })

    }

    ngOnChanges() {
        // console.log(this.isViewPage);

    }

    enableFields(val: boolean) {
        this.buttonType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
    }

    getRS232IntegrationOther() {
        this._service.getRS232IntegrationOther(this.obj);
    }

    prepareRs232(type: string, item: any, id: string) {

        var obj: RS232IntegrationModelBO = new RS232IntegrationModelBO();
        obj.id = id;
        obj.conditionCode = this.obj.conditionCode;
        obj.reqCode = this.obj.reqCode;
        obj.sourceName = item.keyTitle;
        obj.encEntityActID = item.encIntegrationOtherID;
        obj.chemicalName = type;
        obj.batchNumber = this.obj.batchNumber;
        obj.isComingLabchamical = false;
        obj.sourceCode = 'OTH_FIELD';
        obj.occSource = "Custom Field";
        obj.parentID = this.obj.entityActID;
        obj.sectionCode = this.sectionCode;

        return obj;
    }

    // REMOVE THIS FIELD AFTER IMPLEMENTED IN ALL MODULES //

    withValueFields() {
        return this.otherFieldsList.filter(x => x.keyValue);
    }

    getRS232Values(evt: RS232IntegrationModelBO) {

        if (evt) {
            this.otherFieldsList.filter(x => x.encIntegrationOtherID == evt.encEntityActID).forEach((item) => {
                item.keyValue = evt.keyValue;
                item['keyActualValue'] = evt.keyActualValue;
            })

        }

    }

    allowDecimal(evt) {
        return CommonMethods.allowDecimal(evt, CommonMethods.allowDecimalLength, 5);
    }

    formatValueString(val: any) {
        return CommonMethods.FormatValueString(val);
    }

    saveOtherData() {
        if (this.buttonType == ButtonActions.btnUpdate)
            return this.enableFields(true);

        if (this.withValueFields().length == 0)
            return this._alert.warning(LimsHelperMessages.validateCustomeFieldValues);

        this.isLoaderStart = true;

        this._service.manageRS232OtherFieldsValues(this.withValueFields());
    }

    getRS232IntegrationMode() {
        return this._rs232Mode.getRS232IntegrationValidation() ? this._rs232Mode.getRSIntegrationReqStatus() : false;
    }

    // openOccupancy() {
    //     var obj: PrepareOccupancyBO = new PrepareOccupancyBO();
    //     obj.occupancyCode = 'Eqp_Sam_Ana';
    //     obj.encEntityActID = this.obj.entityActID;
    //     obj.occSource = "OCC_OTH_FIELD";
    //     obj.entityRefNumber = this.obj.reqCode;
    //     obj.batchNumber = this.obj.batchNumber;
    //     obj.conditionCode = CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode);
    //     obj.occSourceName = "Custom Field";

    //     const modal = this._matDailog.open(ManageOccupancyComponent, CommonMethods.modalFullWidth);
    //     modal.componentInstance.occupancyBO = obj;
    //     modal.componentInstance.pageType = (this.buttonType == 'Save' && !this.isViewPage) ? 'MNG' : 'VIEW';
    //     modal.componentInstance.pageTitle = "Instrument Occupancy";

    //     modal.componentInstance.condition = 'EQP_CAT_CODE =\'QCINST_TYPE\'';
    //     modal.componentInstance.entityCode = this.obj.entityCode;

    //     modal.afterClosed().subscribe(count => { })
    // }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}