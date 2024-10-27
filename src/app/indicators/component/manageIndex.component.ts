import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { IndicatorsService } from '../service/indicators.service';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, MaterialCategories, PageUrls, ButtonActions, GridActions, LimsRespMessages, ActionMessages, EntityCodes } from 'src/app/common/services/utilities/constants';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { MatDialog } from '@angular/material';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { MngMasterMessage } from 'src/app/manageMaster/model/mngMasterMessage';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { addCommentComponent } from 'src/app/common/component/addComment.component';
import { GetVolumetricSolIndex } from 'src/app/volumetricSolution/model/volumetricSolModel';
import { VolumetricSolMessages } from 'src/app/volumetricSolution/messages/volumetricSolMessages';
import { AddMaterialLables } from 'src/app/common/model/commonModel';
import { AddNewMaterialComponent } from '../../common/component/addNewMaterial.component';
import { IndicatorMessages } from '../messages/indicatorsMessages';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: "appInd-index",
    templateUrl: '../html/manageIndex.html'
})

export class ManageTestSolutionIndexComponent {

    encIndexID: string;
    pageTitle: string = PageTitle.mngTestSolutionIndex;
    backUrl: string = PageUrls.searchIndicator;

    materialInfo: LookupInfo;
    @ViewChild('material', { static: true }) material: LookupComponent;
    condition: string = "1=2";
    subCategories: Array<any>;
    // objInd: ManageTestSolutionObj = new ManageTestSolutionObj();
    stpRefNumber: string;
    status: string;
    subCatID: number;
    entityCode: string = localStorage.getItem("entityCode");
    buttonType: string = ButtonActions.btnSave;
    headerData: any;
    dataSource: any;
    action: Array<string> = [GridActions.changeStatus];
    removeActions: any = { headerName: 'isActive', 'CHGSTAT': -1 }
    totalRecords: number;
    subscription: Subscription = new Subscription();
    isLoaderOn: boolean = false;

    constructor(private _service: IndicatorsService, private _matDailog: MatDialog,
        private _alert: AlertService, private _confirm: ConfirmationService,
        public _global: GlobalButtonIconsService, private _actRoute: ActivatedRoute) { }


    ngAfterContentInit() {
        this.subscription = this._service.indicatorsSubject.subscribe(resp => {
            if (resp.purpose == "getMaterialSubCategories") {
                this.subCategories = resp.result;
                if (this.entityCode == EntityCodes.indicators)
                    this.subCatID = this.subCategories.filter(x => x.caT_ITEM_CODE == 'TEST_SOLUTIONS_INDICATORS')[0].caT_ITEMID;
                else if (this.entityCode == EntityCodes.stockSolution)
                    this.subCatID = this.subCategories.filter(x => x.caT_ITEM_CODE == 'STOCK_SOLUTION')[0].caT_ITEMID;
                this.prepareLKP();
                this.prepareHeaders();
            }
            else if (resp.purpose == "manageTestSolutionIndex") {
                this.isLoaderOn = false;
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                if (CommonMethods.hasValue(resp.result.resultFlag)) {
                    if (resp.result.resultFlag == 'SUCCESS') {
                        if (resp.type == 'MNG') {
                            this._alert.success(LimsRespMessages.saved);
                            this.clear();
                        }
                        else if (resp.type == 'CHNGSTATUS') {
                            this._alert.success(VolumetricSolMessages.statusChanged);
                        }
                    }
                    else
                        return this._alert.warning(ActionMessages.GetMessageByCode(resp.result.resultFlag));
                }

                this.prepareHeaders();
                this.dataSource = CommonMethods.bindMaterialGridData(resp.result.list);
                this.totalRecords = resp.result.totalRecords;
            }
        })

        if (this.entityCode == EntityCodes.stockSolution) {
            this.pageTitle = PageTitle.mngStockSolutionIndex;
            this.backUrl = PageUrls.searchStockSolution;
        }
        this._service.getMaterialSubCategories(MaterialCategories.GetMaterialCategoryCode("LAB_MAT"));
        this.getVolSolIndex('GET');
        this.prepareLKP();
    }

    prepareHeaders() {
        this.headerData = [];
        this.headerData.push({ "columnDef": 'matName', "header": "Solution Name", cell: (element: any) => `${element.matName}`, width: 'minWidth-40per' });
        this.headerData.push({ "columnDef": 'stpRefNumber', "header": "Ref. Number", cell: (element: any) => `${element.stpRefNumber}`, width: 'minWidth-10per' });
        this.headerData.push({ "columnDef": "status", "header": "Status", cell: (element: any) => `${element.status}`, width: "maxWidth-10per" });
    }

    enableHeaders(val: boolean) {
        this.buttonType = val ? ButtonActions.btnAdd : ButtonActions.btnUpdate;

        if (CommonMethods.hasValue(this.material.selectedData))
            this.material.disableBtn = !val;
    }

    prepareLKP() {
        this.condition = "1 = 2";
        if (CommonMethods.hasValue(this.subCatID))
            this.condition = 'SUBCATID = ' + this.subCatID;

        this.materialInfo = CommonMethods.PrepareLookupInfo(LKPTitles.solution, LookupCodes.getAllMaterials, LKPDisplayNames.solution, LKPDisplayNames.solutionCode, LookUpDisplayField.header, LKPPlaceholders.solution, this.condition);
    }

    onActionClicked(evt) {
        if (evt.action == GridActions.changeStatus) {
            this._confirm.confirm(MngMasterMessage.confirmChangeStatus).subscribe(result => {
                if (result) {
                    const model = this._matDailog.open(addCommentComponent, { width: "600px" })
                    model.disableClose = true;
                    model.afterClosed().subscribe(res => {
                        if (res.result) {
                            var obj: GetVolumetricSolIndex = new GetVolumetricSolIndex();
                            obj.type = 'CHNGSTATUS';
                            obj.encIndexID = evt.val.encIndexID;
                            obj.comments = res.val;
                            obj.entityCode = this.entityCode;
                            this._service.manageTestSolutionIndex(obj);
                        }
                    })
                }
            });
        }
        // else if (evt.action == GridActions.mngPro) {
        //     const modal = this._matDailog.open(ManageStandardProcedure, { width: '800px' });
        //     modal.disableClose = true;
        //     modal.componentInstance.encIndexID = evt.val.encIndexID;
        // }

        // this.encIndexID = evt.val.encIndexID;
        // this._service.getVolumetricSolIndexByID(this.encIndexID);
    }

    addMaterial() {
        const modal = this._matDailog.open(AddNewMaterialComponent, CommonMethods.modalFullWidth);
        // modal.componentInstance.subCategory = this.getCategoryByID();
        var obj: AddMaterialLables = new AddMaterialLables();
        obj.material = "Output Solution Name";
        obj.materialType = false;
        obj.isUomDisabled = false;
        obj.uom = "Output Solution UOM";
        obj.refNumber = "Solution Short Name/Code"
        modal.componentInstance.labels = obj;
        modal.componentInstance.pageTitle = 'Solution';
        modal.componentInstance.entityCode = this.entityCode;
        modal.componentInstance.pageType = this.buttonType == ButtonActions.btnUpdate ? ButtonActions.btnView : 'MNG';
        modal.afterClosed().subscribe(resp => {
            this.prepareLKP();
        })
    }

    addIndex() {

        if (this.buttonType == ButtonActions.btnUpdate)
            return this.enableHeaders(true)

        var retval: string = this.validateControls();

        if (CommonMethods.hasValue(retval))
            return this._alert.warning(retval);

        this.getVolSolIndex('MNG');
    }

    getVolSolIndex(type: string) {

        if (type == "SEARCH" && !CommonMethods.hasValue(this.material.selectedId) && !CommonMethods.hasValue(this.stpRefNumber)
            && !CommonMethods.hasValue(this.status))
            return this._alert.warning(IndicatorMessages.searchFilter);
        else if (type == "SEARCHALL") {
            this.material.clear();
            this.stpRefNumber = null;
            this.status = null;
        }

        var obj: GetVolumetricSolIndex = new GetVolumetricSolIndex();
        obj.type = type;
        obj.encIndexID = this.encIndexID;
        obj.materialID = this.material.selectedId;
        obj.stpRefNumber = this.stpRefNumber;
        obj.entityCode = this.entityCode;
        obj.status = this.status;

        if (type == 'MNG')
            this.isLoaderOn = true;
        this._service.manageTestSolutionIndex(obj);
    }

    validateControls() {
        if (!CommonMethods.hasValue(this.material.selectedId))
            return VolumetricSolMessages.solution;
        else if (!CommonMethods.hasValue(this.stpRefNumber))
            return IndicatorMessages.refNum;
    }

    clear() {
        this.material.clear();
        this.encIndexID = this.stpRefNumber = "";
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}