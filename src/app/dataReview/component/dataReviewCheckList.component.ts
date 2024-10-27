import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataReviewService } from '../services/dataReview.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ActivatedRoute } from '@angular/router';
import { checklistComponent } from 'src/app/common/component/checklist.component';
import { MatDialog } from '@angular/material';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { GridActions, EntityCodes, ButtonActions, CategoryCodeList } from 'src/app/common/services/utilities/constants';
import { ManageDataReview } from '../modal/dataReviewModal';
import { DataReviewMessages } from '../messages/dataReviewMessages';
import { AppBO, GetCategoryBO, CategoryItemList, CategoryItem } from 'src/app/common/services/utilities/commonModels';

@Component({
    selector: 'data-chk',
    templateUrl: '../html/dataReviewCheckList.html'
})

export class DataReviewCheckListComponent {

    headers: any;
    dataSource: any;
    actions: any = [];
    list: any;
    remarks: string;
    saveBtn: string = ButtonActions.btnSave;
    appBO: AppBO = new AppBO();
    hideView: boolean;
    checklistTypeID: number;
    checklistType: string;
    checklistTypeCode: string;
    typeOfReview: string;
    selectedPacks: string;
    isLoaderStart: boolean;
    totalCatItemList: CategoryItemList;
    assignCatItemList: CategoryItemList = [];

    manageReviewObj: ManageDataReview = new ManageDataReview();

    subscription: Subscription = new Subscription();

    constructor(private _service: DataReviewService, private _alert: AlertService,
        public _global: GlobalButtonIconsService, private _actRoute: ActivatedRoute,
        private modal: MatDialog, private _actrouter: ActivatedRoute) { }

    ngAfterViewInit() {
        this._actrouter.queryParams.subscribe(resp => { this.manageReviewObj.encReviewID = resp['id'] });
        this.manageReviewObj.entityCode = localStorage.getItem('entityCode');

        this.subscription = this._service.dataReviewSubject.subscribe(resp => {
            if (resp.purpose == "getDataReviewData") {
                this.appBO = resp.result.act;
                this.selectedPacks = resp.result.selectedPacks;
                this.manageReviewObj = resp.result;
                if (CommonMethods.hasValue(this.appBO)) {
                    this.manageReviewObj.encReviewID = this.appBO.encTranKey;
                    this.manageReviewObj.initTime = this.appBO.initTime;
                }
                this.manageReviewObj.entityCode = localStorage.getItem('entityCode');
                this.list = (resp.result.reviewLst.filter(x => CommonMethods.hasValue(x.reviewItemID)));
                if (this.list.length > 0) {
                    this.checklistTypeID = this.list[0].checklistTypeID;
                    this.checklistType = this.list[0].checklistType;
                    this.checklistTypeCode = this.list[0].checklistCode;
                }
                this.typeOfReview = resp.result.typeOfReview;
                this.dataSource = CommonMethods.bindMaterialGridData(this.list);
                if (CommonMethods.hasValue(this.manageReviewObj.observations) || CommonMethods.hasValue(this.manageReviewObj.remarks))
                    this.saveBtn = ButtonActions.btnUpdate;
                if (this.typeOfReview != "PARTIAL_QC")
                    this.actions = [GridActions.checkList];
                else if (!CommonMethods.hasValue(this.manageReviewObj.applicationSoftware))
                    this.manageReviewObj.applicationSoftware = this.manageReviewObj.dataFileNo = this.manageReviewObj.observations = this.manageReviewObj.recommendations  = "N / A";

                this.prepareHeaders();

                if (this.manageReviewObj.entityCode == EntityCodes.analyticalDataReview) {
                    var obj: CategoryItem = new CategoryItem();
                    obj.catItem = this.checklistType;
                    obj.catItemID = this.checklistTypeID;
                    obj.catItemCode = this.checklistTypeCode;
                    obj.category = 'CHK_CTRL_TYPE';
                    this.prepareAssignCatList(obj);

                    this.totalCatItemList = CommonMethods.prepareCategoryItemsList(this.totalCatItemList, this.assignCatItemList);
                }
            }
            else if (resp.purpose == "manageDataReviewData") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == 'SUCCESS') {
                    this._alert.success(DataReviewMessages.successData);
                    this.saveBtn = ButtonActions.btnUpdate;
                }
            }
            else if (resp.purpose == "getCatItemsByCatCodeList")
                this.totalCatItemList = resp.result;
        })

        if (this.manageReviewObj.entityCode == EntityCodes.analyticalDataReview) {
            var obj: GetCategoryBO = new GetCategoryBO();
            obj.list = CategoryCodeList.GetManageDataReviewCategories();
            obj.type = 'MNG';
            this._service.getCatItemsByCatCodeList(obj);
        }
        // this._service.getCategoryItemsByCatCode("CHK_CTRL_TYPE");
        this.hideViewPage();
        // this.remarks = this.manageReviewObj.entityCode == EntityCodes.dataReview ? "Is the results (or) pattern as per regular trend" : "Remarks"
        this.prepareHeaders();
    }


    prepareHeaders() {
        this.headers = [];
        this.headers.push({ "columnDef": 'sno', "header": "S.No.", cell: (element: any) => `${element.srNum}`, width: 'maxWidth-10per' });
        this.headers.push({ "columnDef": 'testName', "header": "Test/Parameter Name", cell: (element: any) => `${element.testName}`, width: 'maxWidth-100per' });
    }

    onActionCLicked(evt) {
        const modal = this.modal.open(checklistComponent, { width: '80%' });
        modal.disableClose = true;
        modal.componentInstance.encEntityActID = evt.val.reviewItemID;
        modal.componentInstance.categoryCode = this.manageReviewObj.entityCode == EntityCodes.dataReview ? "DATA_REVIEW_CHK" : evt.val.checklistCode;
        modal.componentInstance.type = this.saveBtn == ButtonActions.btnSave && !this.hideView ? 'MANAGE' : 'VIEW';
        modal.componentInstance.remarksMandatory = true;
        modal.componentInstance.entityCode = this.manageReviewObj.entityCode;
    }

    saveDataReview() {
        if (this.saveBtn == ButtonActions.btnUpdate) {
            this.saveBtn = ButtonActions.btnSave;
            this.prepareHeaders();
            return;
        }

        var errMsg: string = this.validate();
        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg);

        this.isLoaderStart = true;
        this._service.manageDataReviewData(this.manageReviewObj);
    }

    validate() {

        if (this.manageReviewObj.entityCode == EntityCodes.dataReview) {
            if (!CommonMethods.hasValue(this.manageReviewObj.applicationSoftware))
                return DataReviewMessages.applicationSoftware;
            else if (!CommonMethods.hasValue(this.manageReviewObj.dataFileNo))
                return DataReviewMessages.dataFileNo;
            else if (!CommonMethods.hasValue(this.manageReviewObj.observations))
                return DataReviewMessages.observations;
            else if (!CommonMethods.hasValue(this.manageReviewObj.recommendations))
                return DataReviewMessages.recommendations
        }
        if (!CommonMethods.hasValue(this.manageReviewObj.remarks) && this.manageReviewObj.entityCode == EntityCodes.analyticalDataReview)
            return DataReviewMessages.remarks;
    }

    hideViewPage() {
        if (CommonMethods.hasValue(localStorage.getItem("DATA_REVIEW_PAGE")))
            this.hideView = true;
        else
            this.hideView = false;
    }

    getCatItemList(categoryCode: string) {
        if (this.totalCatItemList && this.totalCatItemList.length > 1)
            return this.totalCatItemList.filter(x => x.category == categoryCode);
        else
            return null;
    }

    prepareAssignCatList(obj: CategoryItem) {
        if (obj.catItemID) {
            this.assignCatItemList.push(obj);
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}