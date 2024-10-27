import { Component } from '@angular/core';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { Subscription } from 'rxjs';
import { SampleDestructionService } from '../service/sampleDestruction.service';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { GetCatItemsByCatCodeModel, ManageDestructionSamplesModel, ContainerDataModel } from '../model/sampleDestructionModel';
import { AlertService } from 'src/app/common/services/alert.service';
import { SampleDestructionMessages } from '../messages/sampleDestructionMessages';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { MatDialog } from '@angular/material';
import { ApprovalComponent } from 'src/app/approvalProcess/component/approvalProcess.component';
import { AppBO, GetCategoryBO, CategoryItemList, CategoryItem } from 'src/app/common/services/utilities/commonModels';
import { Router, ActivatedRoute } from '@angular/router';
import { PageUrls, ButtonActions, ActionMessages, CategoryCodeList, EntityCodes } from 'src/app/common/services/utilities/constants';

@Component({
    selector: 'manageDestruction',
    templateUrl: '../html/manageSampleDestruction.html'
})

export class ManageSampleDestructionComponent {

    pageTitle: string = PageTitle.manageSampleDestruction;
    backUrl: string = PageUrls.homeUrl;
    headers: Array<any> = [];
    dataSource: any = [];
    encDestructionID: string;
    destructionSourceList: Array<GetCatItemsByCatCodeModel> = [];
    typeOfWasteList: Array<GetCatItemsByCatCodeModel> = [];
    typeOfNatureList: Array<GetCatItemsByCatCodeModel> = [];
    modeOfDestructionList: Array<GetCatItemsByCatCodeModel> = [];
    manageDestructionObj: ManageDestructionSamplesModel = new ManageDestructionSamplesModel();
    buttonType: string = ButtonActions.btnSave;
    status: string;
    refNo: string;
    isEnableCheckbox: boolean = false;
    allCheckboxSelected: boolean = false;
    viewHistoryVisible: boolean;
    viewHistory: any;
    appBO: AppBO = new AppBO();
    entityCode: string = EntityCodes.sampleDestruction
    subscription: Subscription = new Subscription();
    isLoaderStart: boolean = false;
    isLoaderStartIcn: boolean = false;
    totalCatItemList: CategoryItemList;
    assignCatItemList: CategoryItemList = [];

    constructor(public _global: GlobalButtonIconsService, private _sampleDestructionService: SampleDestructionService,
        private _notify: AlertService, private _matDailog: MatDialog,
        private _router: Router, private _activatedRoute: ActivatedRoute) {
    }

    ngAfterViewInit() {
        this._activatedRoute.queryParams.subscribe(params => this.encDestructionID = params['id']);

        this.subscription = this._sampleDestructionService.sampleDestructionSubject.subscribe(resp => {
            if (resp.purpose == "getCatItemsByCatCodeList")
                this.totalCatItemList = resp.result;
            else if (resp.purpose == "getDestructionSamples") {
                this.refNo = resp.result.getManageDestructionDetails.requestCode;
                this.status = resp.result.getManageDestructionDetails.status;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.getDestructionDetailsList, "arrayDateTimeFormat", 'requestRaisedOn'));
                if (CommonMethods.hasValue(this.encDestructionID)) {
                    this.manageDestructionObj = resp.result.getManageDestructionDetails;
                    resp.result.getDestructionDetailsList.filter(x => {
                        return this.allCheckboxSelected = x.isSelected;
                    })
                    this.appBO = resp.result.recordActionResults;
                    this.enableField(false);
                    this.showHistory();

                    var desSourceObj: CategoryItem = new CategoryItem();
                    desSourceObj.catItem = this.manageDestructionObj.destructionSourceName;
                    desSourceObj.catItemID = this.manageDestructionObj.destructionSource;
                    desSourceObj.catItemCode = this.manageDestructionObj.destructionSourceCode;
                    desSourceObj.category = 'SAM_DEST_SOURCE';
                    this.prepareAssignCatList(desSourceObj);

                    var typOfWasteObj: CategoryItem = new CategoryItem();
                    typOfWasteObj.catItem = this.manageDestructionObj.typeOfWasteName;
                    typOfWasteObj.catItemID = this.manageDestructionObj.typeOfWaste;
                    typOfWasteObj.catItemCode = this.manageDestructionObj.typeOfWasteCode;
                    typOfWasteObj.category = 'SAM_DEST_TYPE';
                    this.prepareAssignCatList(typOfWasteObj);

                    if (CommonMethods.hasValue(this.manageDestructionObj.natureOfWaste)) {
                        var natureOfWasteObj: CategoryItem = new CategoryItem();
                        natureOfWasteObj.catItem = this.manageDestructionObj.natureOfWasteName;
                        natureOfWasteObj.catItemID = this.manageDestructionObj.natureOfWaste;
                        natureOfWasteObj.catItemCode = this.manageDestructionObj.natureOfWasteCode;
                        natureOfWasteObj.category = 'SAM_DEST_NATURE';
                        this.prepareAssignCatList(natureOfWasteObj);
                    }
                    if (CommonMethods.hasValue(this.manageDestructionObj.modeOfDestruction)) {
                        var modeOfWasteObj: CategoryItem = new CategoryItem();
                        modeOfWasteObj.catItem = this.manageDestructionObj.modeOfDestructionName;
                        modeOfWasteObj.catItemID = this.manageDestructionObj.modeOfDestruction;
                        modeOfWasteObj.catItemCode = this.manageDestructionObj.modeOfDestructionCode;
                        modeOfWasteObj.category = 'SAM_DEST_MODE';
                        this.prepareAssignCatList(modeOfWasteObj);
                    }

                    this.totalCatItemList = CommonMethods.prepareCategoryItemsList(this.totalCatItemList, this.assignCatItemList);

                }
            }
            else if (resp.purpose == "discardSamples") {
                this.isLoaderStartIcn = false;
                if (resp.result.retcode == "OK") {
                    this._notify.success(SampleDestructionMessages.discard);
                    this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.getDestructionDetailsList, "arrayDateTimeFormat", 'requestRaisedOn'));
                }
                else
                    this._notify.error(ActionMessages.GetMessageByCode(resp.result.retcode));
            }
            else if (resp.purpose == "manageDestructionSamples") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == "SUCCESS") {
                    this._notify.success(SampleDestructionMessages.destDataSave);
                    this.enableField(false);
                    this.encDestructionID = resp.result.encTranKey;
                    this.appBO = resp.result;
                    this._sampleDestructionService.getDestructionSamples(this.encDestructionID);
                    this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.getDestructionDetailsList, "arrayDateTimeFormat", 'requestRaisedOn'));
                }
                else
                    this._notify.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
        })
        var obj: GetCategoryBO = new GetCategoryBO();
        obj.list = CategoryCodeList.GetManageSampleDestructionCategories();
        obj.type = 'MNG';
        this._sampleDestructionService.getCatItemsByCatCodeList(obj);
        this._sampleDestructionService.getDestructionSamples(this.encDestructionID);
        this.prepareHeaders();
    }

    enableField(value: boolean) {
        this.buttonType = value ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.isEnableCheckbox = (this.buttonType == ButtonActions.btnUpdate);
    }

    container() {
        var containerList: Array<ContainerDataModel> = [];
        this.dataSource.data.filter(x => x.isSelected == true).forEach(element => {
            var containerDataObj: ContainerDataModel = new ContainerDataModel();
            containerDataObj.containerID = element.containerID;
            containerList.push(containerDataObj);
        });
        return containerList;
    }

    save() {
        if (this.buttonType == ButtonActions.btnUpdate) {
            this.enableField(true);
            return;
        }

        var retVal = this.controlValidate();
        if (CommonMethods.hasValue(retVal))
            return this._notify.warning(retVal);

        this.manageDestructionObj.list = [];

        if (this.manageDestructionObj.destructionSourceCode == "DS")
            this.manageDestructionObj.list = this.container();

        var destructionID = this.totalCatItemList.filter(x => x.catItemCode == this.manageDestructionObj.destructionSourceCode)[0].catItemID;
        this.manageDestructionObj.destructionSource = destructionID;
        this.manageDestructionObj.encDestructionID = this.encDestructionID;

        this.isLoaderStart = true;
        this._sampleDestructionService.manageDestructionSamples(this.manageDestructionObj);
    }

    discard() {
        var retVal = this.validateDiscard();
        if (CommonMethods.hasValue(retVal))
            return this._notify.warning(retVal);

        this.manageDestructionObj.list = [];
        this.manageDestructionObj.list = this.container();

        this.isLoaderStartIcn = true;
        this._sampleDestructionService.discardSamples(this.manageDestructionObj);
    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encDestructionID;
        obj.code = 'SAMPLE_DESTRUCTION';
        const modal = this._matDailog.open(ApprovalComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.encDestructionID,"",this.appBO.appLevel,this.appBO.initTime);
        modal.componentInstance.transHis = obj;
        modal.afterClosed().subscribe((obj) => {
            if (obj == "OK")
                this._router.navigateByUrl(PageUrls.homeUrl);
        });
    }

    prepareHeaders() {
        this.headers.push({ "columnDef": 'isSelected', "header": "", cell: (element: any) => `${element.isSelected}`, width: 'maxWidth-5per' })
        this.headers.push({ "columnDef": 'requestRaisedOn', "header": "Date", cell: (element: any) => `${element.requestRaisedOn}`, width: 'maxWidth-11per' })
        this.headers.push({ "columnDef": 'sampleSource', "header": "Source", cell: (element: any) => `${element.sampleSource}`, width: 'maxWidth-10per' })
        this.headers.push({ "columnDef": 'chemicalName', "header": "Chemical/Solution Name", cell: (element: any) => `${element.chemicalName}`, width: 'minWidth-35per' })
        this.headers.push({ "columnDef": 'batchNumber', "header": "Batch (Pack No.)", cell: (element: any) => `${element.batchNumber}`, width: 'maxWidth-20per' })
        this.headers.push({ "columnDef": 'sourceReferenceNumber', "header": "System Code", cell: (element: any) => `${element.sourceReferenceNumber}`, width: 'maxWidth-10per' })
        this.headers.push({ "columnDef": 'destructionQuantity', "header": "Quantity", cell: (element: any) => `${element.destructionQuantity}`, width: 'maxWidth-10per' })
    }

    controlValidate() {
        if (!(CommonMethods.hasValue(this.manageDestructionObj.destructionSourceCode)))
            return SampleDestructionMessages.destSrc;
        if (!(CommonMethods.hasValue(this.manageDestructionObj.typeOfWaste)))
            return SampleDestructionMessages.typeOfWst;
        if (!(CommonMethods.hasValue(this.manageDestructionObj.natureOfWaste)))
            return SampleDestructionMessages.natOfWst;
        if (!(CommonMethods.hasValue(this.manageDestructionObj.modeOfDestruction)))
            return SampleDestructionMessages.modeOfDest;
        if (!(CommonMethods.hasValue(this.manageDestructionObj.quantity)))
            return SampleDestructionMessages.qty;
        if (this.manageDestructionObj.destructionSourceCode == "DS")
            return this.validateDiscard();
    }

    validateDiscard() {
        if (!(CommonMethods.hasValue(this.container())))
            return SampleDestructionMessages.chkBx;
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encDestructionID;
        obj.code = 'SAMPLE_DESTRUCTION';
        this.viewHistory = obj;
    }

    showHistory() {
        if (CommonMethods.hasValue(this.encDestructionID)) {
            this.viewHistoryVisible = true;
            this.tranHistory();
        }
        else
            this.viewHistoryVisible = false;
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
