import { Component, ViewChild } from '@angular/core';
import { AlertService } from 'src/app/common/services/alert.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { RinisingSolutionsService } from '../services/rinsingSolutions.service';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, CategoryCodeList, PageUrls, ButtonActions, EntityCodes, ActionMessages } from 'src/app/common/services/utilities/constants';
import { LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { SingleCodeBO, SingleIDBO, AppBO, CategoryItemList, CategoryItem, GetCategoryBO, } from 'src/app/common/services/utilities/commonModels';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { ManageRinsingSolution, GetRinsingSolution, ManageOutputRinsingSol } from '../model/rinsingSolutionsModel';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { RinsingSolutionsMessages } from '../messages/rinsingSolutionsMessages';
import { MatDialog } from '@angular/material';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { ApprovalComponent } from 'src/app/approvalProcess/component/approvalProcess.component';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { mobilephaseMessages } from 'src/app/mobilePhase/messages/mobilePhaseMessages';

@Component({
    selector: 'mng-rin',
    templateUrl: '../html/manageRinsingSolutions.html'
})

export class ManageRinsingSolutionsComponent {

    pageTitle: string = PageTitle.manageRinsingSolutions;
    backUrl: string = PageUrls.homeUrl;

    reqBtnType: string = ButtonActions.btnSave;
    prepBtnType: string = ButtonActions.btnSave;
    outBtnType: string = ButtonActions.btnSave;
    btnDisabledPrep: boolean;
    btnDisabledReq: boolean;
    btnDisableOut: boolean;
    btnUpload: string = ButtonActions.btnUpload;
    btnUploadOut: string = ButtonActions.btnUpload;
    disable: boolean = false;
    disablePrep: boolean;
    disableOut: boolean;

    catCodeList: Array<SingleCodeBO> = [];
    validityPeriodList: any;
    materialCategory: number;
    uploadIDs: Array<SingleIDBO> = [];
    entityCode: string = EntityCodes.rinsingSolutions;
    sourceType: string = "RINSING_PRE_BATCH";
    getDate: Date = new Date();
    solventList: any;
    disableAll: boolean;

    manageRinSolObj: ManageRinsingSolution = new ManageRinsingSolution();
    getRinSOl: GetRinsingSolution = new GetRinsingSolution();
    manageOutRinSol: ManageOutputRinsingSol = new ManageOutputRinsingSol();
    appBO: AppBO = new AppBO();

    matInfo: any;
    @ViewChild('materials', { static: true }) materials: LookupComponent;

    hideView: boolean = false;
    viewHistory: any;
    viewHistoryVisible: boolean;
    viewBackUrl: string = PageUrls.searchRinSol;
    viewPageTitle: string = PageTitle.viewRinsingSolutions;

    subscription: Subscription = new Subscription();
    actionDate: Date;
    isLoaderStart: boolean = false;
    isLoaderStartPrep: boolean = false;
    isLoaderStartIcn: boolean = false;
    totalCatItemList: CategoryItemList;
    assignCatItemList: CategoryItemList = [];

    constructor(private _alert: AlertService, private _router: Router,
        private _actrouter: ActivatedRoute, private _rinsingService: RinisingSolutionsService,
        public _global: GlobalButtonIconsService, private _matDailog: MatDialog,
        private _confirmSer: ConfirmationService) { }

    ngAfterContentInit() {
        this._actrouter.queryParams.subscribe(resp => { this.manageRinSolObj.encSolutionID = resp['id'] });
        this.subscription = this._rinsingService.rinsingSolSubject.subscribe(resp => {
            if (resp.purpose == "getAllMaterialCategories")
                this.catCodeList = CommonMethods.getMaterialCategoryFilterData(resp.result, CategoryCodeList.GetMaterialCategories());

            else if (resp.purpose == "getCatItemsByCatCodeList")
                this.totalCatItemList = resp.result;

            else if (resp.purpose == "getValidityPeriods")
                this.validityPeriodList = resp.result;

            else if (resp.purpose == "manageRinsingSolution") {
                this.btnDisabledReq = this.btnDisabledPrep = false;
                this.isLoaderStart = this.isLoaderStartPrep = false;
                if (resp.result.returnFlag == "SUCCESS") {
                    if (this.reqBtnType == ButtonActions.btnSave)
                        this._alert.success(RinsingSolutionsMessages.manageRinsingSolutions);
                    else
                        this._alert.success(RinsingSolutionsMessages.saveRSPreprationDetails);
                    this.uploadIDs = [];
                    this.appBO = resp.result;
                    this.manageRinSolObj.encSolutionID = this.appBO.encTranKey;
                    this.getRinSOl.status = resp.result.status;
                    this.getRinSOl.requestCode = resp.result.referenceNumber;
                    this.showHistory();
                    this._rinsingService.getRinsingSolutionsDetailsByID(this.manageRinSolObj.encSolutionID);
                }
                else {
                    this.btnConfig("PREP", false);
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
                }
            }

            else if (resp.purpose == "getRinsingSolutionsDetailsByID") {
                this.manageRinSolObj = resp.result;
                this.getRinSOl = resp.result;
                this.appBO = resp.result.recordActions;
                this.solventList = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(resp.result.solventsList, "arrayDateTimeFormat", "useBeforeDate")));
                this.manageOutRinSol = resp.result;
                this.manageOutRinSol.useBeforeDate = dateParserFormatter.FormatDate(this.manageOutRinSol.useBeforeDate, 'datetime')
                if (CommonMethods.hasValue(this.manageRinSolObj.briefDescription)) {
                    this.prepBtnType = ButtonActions.btnUpdate;
                    this.btnUpload = ButtonActions.btnViewDocus;
                    this.disablePrep = true;
                }
                if (CommonMethods.hasValue(this.manageOutRinSol.finalVolume)) {
                    this.outBtnType = ButtonActions.btnUpdate;
                    this.btnUploadOut = ButtonActions.btnViewDocus;
                    this.disableOut = true;
                }
                this.btnConfig("REQ", true);
                this.operationTypeDisable();
                this.actionDate = resp.result.actionDate;

                var obj: CategoryItem = new CategoryItem();
                obj.catItem = this.manageRinSolObj.usageType;
                obj.catItemID = this.manageRinSolObj.usageTypeID;
                obj.catItemCode = this.manageRinSolObj.usageTypeCode;
                obj.category = 'USAGE_TYPE';
                this.prepareAssignCatList(obj);

                this.totalCatItemList = CommonMethods.prepareCategoryItemsList(this.totalCatItemList, this.assignCatItemList);

            }

            else if (resp.purpose == "manageRinsingSolutionsOutputDetails") {
                this.btnDisableOut = this.isLoaderStartIcn = false;
                if (resp.result.returnFlag == "SUCCESS") {
                    this.btnConfig('OUT', true);
                    this.appBO = resp.result;
                    this._alert.success(RinsingSolutionsMessages.saveRSOutputDetails);
                }
                else {
                    this.btnConfig("OUT", false);
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
                }
            }

        })

        this.showHistory();
        this._rinsingService.getAllMaterialCategories();
        var obj: GetCategoryBO = new GetCategoryBO();
        obj.list = CategoryCodeList.GetManageRinsingSolutionCategories();
        obj.type = 'MNG';
        this._rinsingService.getCatItemsByCatCodeList(obj);
        this._rinsingService.getValidityPeriods(EntityCodes.rinsingSolutions);
        // this.prepareLKPMaterial();
        this.hideManageView();
        if (CommonMethods.hasValue(this.manageRinSolObj.encSolutionID)) {
            this._rinsingService.getRinsingSolutionsDetailsByID(this.manageRinSolObj.encSolutionID);
        }
    }

    operationTypeDisable() {
        if (this.appBO.operationType == 'VIEW') {
            this.disableAll = true;
            // this.materials.disableBtn = true;
        }
    }

    // prepareLKPMaterial() {

    //     var lkpCondition: string = " ";
    //     if (CommonMethods.hasValue(this.materialCategory))
    //         lkpCondition = "CATEGORY_ID=" + this.materialCategory + " AND STATUS_CODE = 'ACT'";
    //     else
    //         lkpCondition = "1 = 2";

    //     this.matInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Materials, LookupCodes.plantMaterials, LKPDisplayNames.Material,
    //         LKPDisplayNames.MaterialCode, LookUpDisplayField.header, LKPPlaceholders.Material, lkpCondition);
    // }

    // changeMatCat() {
    //     this.prepareLKPMaterial();
    // }

    saveRequest(type: string) {

        if (this.reqBtnType == ButtonActions.btnUpdate && type == "REQ") {
            // if (type == "REQ") {
            //     this._confirmSer.confirm(mobilephaseMessages.confirmMobileUpdate).subscribe((confirmed) => {
            //         if (confirmed)
            return this.btnConfig("REQ", false);
            //     })
            //     return;
            // }
            // this.disable = false;
            // return this.reqBtnType = ButtonActions.btnSave;
        }
        if (this.prepBtnType == ButtonActions.btnUpdate && type == "PREP") {
            this.disablePrep = false;
            this.btnUpload = ButtonActions.btnUpload;
            return this.prepBtnType = ButtonActions.btnSave;
        }

        var errMsg = this.validation(type);
        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg);

        this.manageRinSolObj.uploadedID = this.uploadIDs;
        this.manageRinSolObj.type = type;
        //  type == 'REQ' ? this.btnDisabledReq = true : this.btnDisabledPrep = true;
        type == 'REQ' ? this.isLoaderStart = true : this.isLoaderStartPrep = true;

        this._rinsingService.manageRinsingSolutions(this.manageRinSolObj);


    }

    saveOutput(type: string) {


        if (this.outBtnType == ButtonActions.btnUpdate && type == "OUT") {
            this.disableOut = false;
            this.btnUploadOut = ButtonActions.btnUpload;
            return this.outBtnType = ButtonActions.btnSave;
        }

        var errMsg = this.validation(type);
        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg);

        this.btnUploadOut = ButtonActions.btnViewDocus;
        this.btnDisableOut = true;
        this.manageOutRinSol.encSolutionID = this.manageRinSolObj.encSolutionID;
        this.manageOutRinSol.initTime = this.appBO.initTime;
        this.isLoaderStartIcn = true;
        this._rinsingService.manageRinsingSolutionsOutputDetails(this.manageOutRinSol);


    }

    confirm() {

        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.manageOutRinSol.encSolutionID;
        obj.code = EntityCodes.rinsingSolutions;

        const modal = this._matDailog.open(ApprovalComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.manageOutRinSol.encSolutionID, EntityCodes.rinsingSolutions,this.appBO.appLevel,this.appBO.initTime);
        modal.componentInstance.transHis = obj;
        modal.afterClosed().subscribe((obj) => {
            if (obj == "OK")
                this._router.navigate([PageUrls.homeUrl]);
        });
    }

    Uploadfiles(type: string, section: string) {

        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.rinsingSolutions, 0, section, this.manageRinSolObj.encSolutionID, this.uploadIDs, 'MEDICAL_LIMS',this.appBO.referenceNumber);
        if ((this.btnUpload == ButtonActions.btnViewDocus && type == 'REQ') || (this.btnUploadOut == ButtonActions.btnViewDocus && type == 'OUT') || (type == 'VIEW'))
            modal.componentInstance.mode = 'VIEW';

        else {
            modal.componentInstance.mode = 'MANAGE';
            modal.afterClosed().subscribe(resu => {
                if (CommonMethods.hasValue(resu))
                    this.uploadIDs = resu;
            })
        }
    }

    btnConfig(type: string, val: boolean) {

        if (type == "REQ")
            this.reqBtnType = type == "REQ" && !val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        else if (type == "PREP")
            this.prepBtnType = type == "PREP" && !val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        else if (type == "OUT")
            this.outBtnType = type == "OUT" && !val ? ButtonActions.btnSave : ButtonActions.btnUpdate;

        if (this.prepBtnType == ButtonActions.btnUpdate)
            this.btnUpload = ButtonActions.btnViewDocus;
        else
            this.btnUpload = ButtonActions.btnUpload;

        this.disable = this.reqBtnType == ButtonActions.btnUpdate ? true : false;
        this.disablePrep = this.prepBtnType == ButtonActions.btnUpdate ? true : false;
        this.disableOut = this.outBtnType == ButtonActions.btnUpdate ? true : false;
    }

    validation(type: string) {

        if (type == "REQ") {
            if (!CommonMethods.hasValue(this.manageRinSolObj.solutionName))
                return RinsingSolutionsMessages.solutionName;
            if (!CommonMethods.hasValue(this.manageRinSolObj.usageTypeID))
                return RinsingSolutionsMessages.usageTypeID;
            if (!CommonMethods.hasValue(this.manageRinSolObj.stpNumber))
                return RinsingSolutionsMessages.stpNumber;
        }
        else if (type == "PREP") {
            if (!CommonMethods.hasValue(this.manageRinSolObj.briefDescription))
                return RinsingSolutionsMessages.briefDescription
        }

        else if (type == "OUT") {
            if (!CommonMethods.hasValue(this.manageOutRinSol.finalVolume))
                return RinsingSolutionsMessages.final;
            if (!CommonMethods.hasValue(this.manageOutRinSol.validityPeriodID))
                return RinsingSolutionsMessages.validity;
        }
    }

    clear(type: string) {
        if (type == 'REQ') {
            this.manageRinSolObj.stpNumber = this.manageRinSolObj.usageTypeID = null;
            this.manageRinSolObj.solutionName = "";
        }
        else
            this.manageRinSolObj.briefDescription = this.manageRinSolObj.preparationRemarks = null;
    }


    getValidityDate(id: number) {

        var obj = this.validityPeriodList.filter(x => x.id == id);

        var date: Date;

        if (CommonMethods.hasValue(this.actionDate))
            this.getDate = dateParserFormatter.FormatDate(this.actionDate, 'default');

        if (obj[0].code == 'DAYS')
            date = new Date(this.getDate.getFullYear(), this.getDate.getMonth(), this.getDate.getDate() + obj[0].value, this.getDate.getHours(), this.getDate.getMinutes(), this.getDate.getSeconds());
        else if (obj[0].code == 'HRS')
            date = new Date(this.getDate.getFullYear(), this.getDate.getMonth(), this.getDate.getDate(), this.getDate.getHours() + obj[0].value, this.getDate.getMinutes(), this.getDate.getSeconds());
        else if (obj[0].code == 'MONTHS')
            date = new Date(this.getDate.getFullYear(), this.getDate.getMonth() + obj[0].value, this.getDate.getDate(), this.getDate.getHours(), this.getDate.getMinutes(), this.getDate.getSeconds());
        else if (obj[0].code == 'YEARS')
            date = new Date(this.getDate.getFullYear() + obj[0].value, this.getDate.getMonth(), this.getDate.getDate(), this.getDate.getHours(), this.getDate.getMinutes(), this.getDate.getSeconds());

        this.manageOutRinSol.useBeforeDate = dateParserFormatter.FormatDate(date, 'datetime');
    }

    hideManageView() {
        if (CommonMethods.hasValue(localStorage.getItem("viewRinsingSolution"))) {
            this.hideView = true;
            this._rinsingService.getRinsingSolutionsDetailsByID(localStorage.getItem("viewRinsingSolution"));
            this.tranHistory();
        }
        else
            this.hideView = false;
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.manageRinSolObj.encSolutionID
        obj.code = EntityCodes.rinsingSolutions;
        this.viewHistory = obj;
    }

    showHistory() {
        if (CommonMethods.hasValue(this.manageRinSolObj.encSolutionID)) {
            this.viewHistoryVisible = true;
            this.tranHistory();
        }
        else
            this.viewHistoryVisible = false;
    }

    updateInitTime(initTime: string) {
        this.appBO.initTime = initTime;
    }

    allowdecimal(evt) {
        return CommonMethods.allowDecimal(evt, CommonMethods.allowDecimalLength, 3);
    }

    getFinalVol() {
        return CommonMethods.hasValue(this.manageOutRinSol.finalVolume) ? this.manageOutRinSol.finalVolume + ' ' + this.manageOutRinSol.uom : 'N / A';
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
        localStorage.removeItem("viewRinsingSolution");
        this.subscription.unsubscribe();
    }

}