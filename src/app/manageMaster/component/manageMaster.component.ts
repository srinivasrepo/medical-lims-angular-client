import { Component } from "@angular/core";
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { Subscription } from 'rxjs';
import { ManageMasterService } from '../services/manageMaster.service';
import { ManageMaster } from '../model/mngMaster';
import { CommonMethods, SearchBoSessions } from 'src/app/common/services/utilities/commonmethods';
import { MngMasterMessage } from '../model/mngMasterMessage';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { LIMSContextServices } from '../../common/services/limsContext.service';
import { ConfirmationService } from '../../limsHelpers/component/confirmationService';
import { AlertService } from '../../common/services/alert.service';
import { LimsRespMessages, ActionMessages, CapabilityActions, EntityCodes } from '../../common/services/utilities/constants';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { MatDialog } from '@angular/material';
import { manageValidityPeriods } from './manageValidityPeriods.component';

@Component({
    selector: 'ams-master',
    templateUrl: '../html/manageMaster.html'
})

export class ManageMasterComponent {

    ddlCategory: any;
    dataSource: any;
    headerData: any = [];
    totalRecords: number;
    manageData: any = { categoryID: "", catItemCode: "", catItem: "" };
    hasCreateCap: boolean = false;
    actions: any = [];
    currentSelectedIndex: number = 0;
    pageTitle: string;
    entityType: string = this._limsContext.getEntityType();
    subscription: Subscription = new Subscription();

    constructor(private _limsContext: LIMSContextServices, private _catService: ManageMasterService,
        private route: Router, private _notify: AlertService, private _confirm: ConfirmationService,
        public _global: GlobalButtonIconsService, private _modal: MatDialog
    ) {
        this.pageTitle = PageTitle.manageMaster;
    }

    ngAfterContentInit() {

        this.subscription = this._catService.mngMasterSubject.subscribe(resp => {
            if (resp.purpose == "getCategoryMaster") {
                this.ddlCategory = resp.result;
            }
            else if (resp.purpose == "searchCatItemsDetails") {
                this.totalRecords = resp.result.totalNumberOfRows;
                this.dataSource = CommonMethods.bindMaterialGridData(resp.result.searchList);
                this.prepareHeaders();
            }
            else if (resp.purpose == "insertCategoryItems") {
                if (resp.result == "OK") {
                    this._notify.success(LimsRespMessages.saved);
                    this.clear();
                    this.filterTypes('search', 'Y');
                }
                else
                    this._notify.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == "changeCatagoryItemStatus") {
                if (resp.result == "SUCCESS") {
                    this._notify.success(LimsRespMessages.changeStatusSuccess);
                    this.filterTypes('search', 'Y');
                } else
                    this._notify.error(ActionMessages.GetMessageByCode(resp.result));
            }
        })

        this.filterTypes('search', 'Y');
        this._catService.getCategoryMasters(this._limsContext.getEntityType());

        var capActions: CapabilityActions = this._limsContext.getSearchActinsByEntityCode(EntityCodes.master);
        this.actions = capActions.actionList;
        this.hasCreateCap = capActions.createCap;

    }

    prepareHeaders() {
        this.headerData = [];
        this.headerData.push({ "columnDef": 'catItemCode', "header": "Item Code", cell: (element: any) => `${element.catItemCode}` });
        this.headerData.push({ "columnDef": 'catItem', "header": "Item Name", cell: (element: any) => `${element.catItem}` });
        this.headerData.push({ "columnDef": 'category', "header": "Category", cell: (element: any) => `${element.category}` });
        this.headerData.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}` });
    }

    chngCategory() {
        if (CommonMethods.hasValue(this.manageData.categoryID)) {
            var retVal = this.ddlCategory.filter(x => x.categoryID === this.manageData.categoryID);
            return (!retVal[0].isSysMaster)
        }
    }

    onPageIndexClicked(val) {
        this.currentSelectedIndex = val;
        environment.pageIndex = val;
        this.filterTypes('search', 'I');
    }

    filterTypes(type: string, init: string = 'N') {
        if (type == 'create') {
            var obj: ManageMaster = this.formData();
            var retVal = this.controlValidate(obj);

            if (CommonMethods.hasValue(retVal))
                return this._notify.warning(retVal);

            return this._catService.insertCategoryItems(obj);
        }
        else {
            var obj: ManageMaster = new ManageMaster();
            var key: string = SearchBoSessions['masterBO_' + this._limsContext.getEntityType()];

            if (SearchBoSessions.checkSessionVal(key) && init == 'Y') {
                obj = SearchBoSessions.getSearchAuditBO(key);
                this.manageData.categoryID = obj.categoryID;
                this.manageData.catItem = obj.catItem;
                this.manageData.catItemCode = obj.catItemCode;
                this.currentSelectedIndex = Number(obj.pageIndex);
                environment.pageIndex = obj.pageIndex;
            }
            else {

                if (type == "searchAll")
                    this.manageData = { categoryID: "", catItemCode: "", catItem: "" };
                else if (!this.validateFields(type) && init == 'N') {
                    type == 'search' ? this._notify.warning(LimsRespMessages.chooseOne) : "";
                    return true;
                }

                if (init != 'I') {
                    this.currentSelectedIndex = 0;
                    environment.pageIndex = '0';
                }

                obj.pageIndex = environment.pageIndex;
                obj.categoryID = this.manageData.categoryID;
                obj.catItem = this.manageData.catItem;
                obj.catItemCode = this.manageData.catItemCode;
                obj.entityType = this._limsContext.getEntityType();
                SearchBoSessions.setSearchAuditBO(key, obj);
            }

            this._catService.searchCategory(obj);
        }
    }

    validateFields(type: string) {
        var isVal: boolean = true;
        if (!CommonMethods.hasValue(this.manageData.categoryID) && !CommonMethods.hasValue(this.manageData.catItemCode) && !CommonMethods.hasValue(this.manageData.catItem))
            isVal = false;

        if ((isVal && type == 'searchAll') || (type == 'searchAll' && environment.pageIndex != '0')) {
            environment.pageIndex = '0';
            isVal = true;
        }

        return isVal;
    }

    formData() {
        var obj: ManageMaster = new ManageMaster();
        obj.categoryID = this.manageData.categoryID;
        obj.catItemCode = this.manageData.catItemCode;
        obj.catItem = this.manageData.catItem;
        return obj;
    }

    controlValidate(obj: ManageMaster) {
        if (!CommonMethods.hasValue(obj.categoryID))
            return MngMasterMessage.categoryId;
        else if (!CommonMethods.hasValue(obj.catItemCode))
            return MngMasterMessage.catItemCode;
        else if (!CommonMethods.hasValue(obj.catItem))
            return MngMasterMessage.catItem;

    }

    /* Grid Action */
    onActionClicked(evt) {
        if (evt.action == "CHGSTAT") {
            this._confirm.confirm(MngMasterMessage.confirmChangeStatus).subscribe((confirmed) => {
                if (confirmed)
                    this._catService.changeCatagoryItemStatus(evt.val.catItemID);
            })
        }
    }

    syncMaster() {
        this.route.navigateByUrl('/lims/syncMaster');
    }

    clear() {
        environment.pageIndex = '0';
        this.manageData = { categoryID: "", catItemCode: "", catItem: "" };
    }

    addValidityPeriods() {
        const modal = this._modal.open(manageValidityPeriods, { width: '50vw' });
        modal.disableClose = true;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}