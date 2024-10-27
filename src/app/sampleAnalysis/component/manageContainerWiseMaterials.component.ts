import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { materialCatInfo } from 'src/app/limsHelpers/entity/limsGrid';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { EntityCodes, GridActions, ActionMessages, PageUrls } from 'src/app/common/services/utilities/constants';
import { ManageContainerWiseChemicals, GetContainerWiseMaterials } from '../model/sampleAnalysisModel';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { MatDialog } from '@angular/material';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { MngMasterMessage } from 'src/app/manageMaster/model/mngMasterMessage';
import { materialCategoryComponent } from 'src/app/limsHelpers/component/materialCategory.component';

@Component({
    selector: 'mng-con',
    templateUrl: '../html/manageContainerWiseMaterials.html'
})

export class ManageContainerWiseMaterialsComponent {

    pageTitle: string = PageTitle.containerWiseMaterials;
    backUrl: string = PageUrls.searchSampleAnalysis;

    entityCode: string = EntityCodes.sampleAnalysis;
    analysisTypeList: any;
    sourceList: any;
    headers: any = [];
    dataSource: any = [];
    actions: any = [GridActions.changeStatus];
    removeAction: any = { headerName: 'isActive', action: 'CHGSTAT', compareField: 'status', }
    totalNoOfRows: number;


    materialInfo: materialCatInfo = new materialCatInfo();
    manageObj: ManageContainerWiseChemicals = new ManageContainerWiseChemicals();
    getObj: GetContainerWiseMaterials = new GetContainerWiseMaterials();

    @ViewChild('materialCategory', { static: true }) materialCategory: materialCategoryComponent;
    subscription: Subscription = new Subscription();

    constructor(private _samAnService: SampleAnalysisService, private _alert: AlertService, public _global: GlobalButtonIconsService,
        private _confirm: ConfirmationService, private _matDailog: MatDialog) {
        this.materialInfo.isCategoryShow = true;
        this.materialInfo.category = "Material Category";
        this.materialInfo.categoryList = [{ catCode: 'RAW_MAT' }, { catCode: 'INTER_MAT' }, { catCode: 'FIN_MAT' }]
        this.materialInfo.isSubCategoryShow = false;
    }

    ngAfterViewInit() {
        this.subscription = this._samAnService.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getAnalysisTypes")
                this.analysisTypeList = resp.result;
            else if (resp.purpose == "getSampleSources")
                this.sourceList = resp.result;
            else if (resp.purpose == "containerWiseMaterials") {
                if (resp.type == 'ADD') {
                    if (resp.result.resultFlag == "SUCCESS") {
                        this.materialCategory.clear();
                        this._alert.success(SampleAnalysisMessages.containerSuccess);
                        this.materialInfo.categoryCode = this.manageObj.analysisTypeID = this.manageObj.sampleSourceCode = null;
                    }
                    else
                        this._alert.error(ActionMessages.GetMessageByCode(resp.result.resultFlag));
                }
                else if (resp.type == "CHNGSTATUS") {
                    this._alert.success(SampleAnalysisMessages.statusChanged);
                }
                if (resp.result.resultFlag == "SUCCESS") {
                    this.totalNoOfRows = resp.result.list.totalNumberOfRows;
                    sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                    this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.list.searchList,
                        "filterTwiceCol", ["effectiveFrom", "effectiveTo"]));
                }
            }
        })

        this.prepareHeaders();
        this._samAnService.getSampleSources();
        this._samAnService.containerWiseMaterials(this.manageObj);
    }


    materialData(event) {
        this.manageObj.materialCategoryID = event.categoryID;
        this.materialInfo.materialID = this.manageObj.materialID = event.materialID;
        if (CommonMethods.hasValue(event.categoryID))
            this._samAnService.getAnalysisTypesByID(event.categoryID);
        else
            this.manageObj.sampleSourceCode = null;
    }

    addMaterials(type: string, init: string = 'B') {
        if (type == "ADD") {
            var errMsg: string = this.validation();
            if (CommonMethods.hasValue(errMsg)) {
                return this._alert.warning(errMsg);
            }
        }
        else if (type == "SEARCH" && init == 'B') {
            var seMsg: string = this.validateForSearch();
            if (CommonMethods.hasValue(seMsg))
                return this._alert.warning(seMsg);
        }

        if (init != 'P')
            this.manageObj.pageIndex = 0;
        this.manageObj.type = type;
        this._samAnService.containerWiseMaterials(this.manageObj);
    }

    onActionClicked(evt) {
        if (evt.action == GridActions.changeStatus) {
            this._confirm.confirm(MngMasterMessage.confirmChangeStatus).subscribe(result => {
                if (result) {
                    this.manageObj.type = 'CHNGSTATUS';
                    this.manageObj.containerWiseMatID = evt.val.containerWiseMatID;
                    this._samAnService.containerWiseMaterials(this.manageObj);
                }
            })
        }
    }

    validation() {
        if (!CommonMethods.hasValue(this.manageObj.materialCategoryID))
            return SampleAnalysisMessages.materialCategory;
        if (!CommonMethods.hasValue(this.manageObj.materialID))
            return SampleAnalysisMessages.materialID;
        if (!CommonMethods.hasValue(this.manageObj.analysisTypeID))
            return SampleAnalysisMessages.analysis;
        if (!CommonMethods.hasValue(this.manageObj.sampleSourceCode))
            return SampleAnalysisMessages.sampleSource;
    }

    validateForSearch() {
        if (!CommonMethods.hasValue(this.manageObj.materialCategoryID))
            return SampleAnalysisMessages.materialCategorySearch;
        if (!CommonMethods.hasValue(this.manageObj.materialID))
            return SampleAnalysisMessages.materialIDSearch;
    }


    prepareHeaders() {
        this.headers.push({ columnDef: 'materialName', header: 'Material / Product Name', cell: (element: any) => `${element.materialName}`, width: "maxWidth-35per" });
        this.headers.push({ columnDef: 'analysisType', header: 'Analysis Type', cell: (element: any) => `${element.analysisType}`, width: "maxWidth-10per" });
        this.headers.push({ columnDef: 'sampleSource', header: 'Sample Source', cell: (element: any) => `${element.sampleSource}`, width: "maxWidth-15per" })
        this.headers.push({ columnDef: 'effectiveFrom', header: 'Effective From', cell: (element: any) => `${element.effectiveFrom}`, width: "maxWidth-15per" });
        this.headers.push({ columnDef: 'effectiveTo', header: 'Effective To', cell: (element: any) => `${element.effectiveTo}`, width: "maxWidth-10per" });
        this.headers.push({ columnDef: 'status', header: 'Status', cell: (element: any) => `${element.status}`, width: "maxWidth-10per" })
    }

    onPage(evt) {
        this.manageObj.pageIndex = evt;
        this.addMaterials('SEARCH', 'P');
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}