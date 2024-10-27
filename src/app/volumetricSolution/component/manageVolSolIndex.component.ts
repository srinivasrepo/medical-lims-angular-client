import { Component, ViewChild, Input } from "@angular/core";
import { PageTitle } from '../../common/services/utilities/pagetitle';
import { FormGroup, FormBuilder, Validators } from '../../../../node_modules/@angular/forms';
import { Subscription } from '../../../../node_modules/rxjs';
import { LookupInfo, LookUpDisplayField, GridActionFilterBOList } from '../../limsHelpers/entity/limsGrid';
import { LookupComponent } from '../../limsHelpers/component/lookup';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from '../../limsHelpers/entity/lookupTitles';
import { LookupCodes, MaterialCategories, GridActions, LimsRespMessages, ActionMessages, PageUrls, ButtonActions, EntityCodes } from '../../common/services/utilities/constants';
import { VolumetricSolService } from '../service/volumetricSol.service';
import { MatDialog } from '../../../../node_modules/@angular/material';
import { AddNewMaterialComponent } from '../../common/component/addNewMaterial.component';
import { GetVolumetricSolIndex } from '../model/volumetricSolModel';
import { VolumetricSolMessages } from '../messages/volumetricSolMessages';
import { AlertService } from '../../common/services/alert.service';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { MngMasterMessage } from 'src/app/manageMaster/model/mngMasterMessage';
import { addCommentComponent } from 'src/app/common/component/addComment.component';
import { ManageStandardProcedure } from './standardizationProcedure.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ManageAssignFormulaeComponent } from './manageAssignFormulae.component';
import { Router } from '@angular/router';

@Component({
    selector: 'lims-volIndex',
    templateUrl: '../html/manageVolSolIndex.html'
})

export class ManageVolSolIndexComponent {

    encIndexID: string;
    pageTitle: string = PageTitle.mngvolSolutionIndex;
    subCategoryID: number;
    subCategories: Array<any> = [];

    volFormGroup: FormGroup;
    materialInfo: LookupInfo;
    psMaterialInfo: LookupInfo;
    @ViewChild('material', { static: true }) material: LookupComponent;
    @ViewChild('psMaterial', { static: true }) psMaterial: LookupComponent;
    @Input() hideCategory: boolean;
    @Input() hideSubCategory: boolean;

    get f() { return this.volFormGroup.controls; }

    buttonType: string = ButtonActions.btnAdd;

    condition: string;

    headerData: any;
    dataSource: any;
    action: Array<string> = [GridActions.changeStatus, GridActions.mngPro, GridActions.assignFormulae, GridActions.view];
    removeActions: any = { headerName: 'isActive', 'CHGSTAT': -1, 'MNG_PRO': -1, extraField: 'SINGLE_ACT' }
    backUrl: string = PageUrls.volmetricSol;
    usrActions: GridActionFilterBOList = new GridActionFilterBOList();    
    subscription: Subscription = new Subscription();
    isLoaderStart: boolean;
    totalRecords: number;

    constructor(private _fb: FormBuilder, private _service: VolumetricSolService, private _confirm: ConfirmationService,
        private _matDailog: MatDialog, private _alert: AlertService, public _global: GlobalButtonIconsService,
        private _router:Router) {
        this.volFormGroup = _fb.group({
            subCategoryID: ['', [Validators.required]],
            molecularWeight: ['', [Validators.required]],
            formulaType: ['', [Validators.required]],
            status:['',[Validators.required]]

        })
    }

    ngAfterContentInit() {

        this.subscription = this._service.VolumetricSubject.subscribe(resp => {
            if (resp.purpose == "getMaterialSubCategories") {
                this.subCategories = resp.result;
                var obj = this.subCategories.filter(x => x.caT_ITEM_CODE == 'VOLUMETRIC_SOL');
                this.f.subCategoryID.setValue(obj[0].caT_ITEMID);
                this.f.subCategoryID.disable();
                this.prepareLKP();
            }
            else if (resp.purpose == "getVolumetricSolIndex") {
                this.isLoaderStart = false;
                if (CommonMethods.hasValue(resp.result.resultFlag)) {
                    if (resp.result.resultFlag == 'SUCCESS') {
                        if (resp.type == 'MNG') {
                            this._alert.success(LimsRespMessages.saved);
                            this.clear();
                        }
                        else if (resp.type == 'CHNGSTATUS')
                            this._alert.success(VolumetricSolMessages.statusChanged);
                    }
                    else
                        return this._alert.warning(ActionMessages.GetMessageByCode(resp.result.resultFlag));
                }

                this.prepareHeaders();
                this.usrActions = new GridActionFilterBOList();
                this.dataSource = CommonMethods.bindMaterialGridData(resp.result.list);
                this.totalRecords = resp.result.totalRecords;

            }
            else if (resp.purpose == "getVolumetricSolIndexByID") {
                this.material.setRow(resp.result.materialID, resp.result.matName);
                this.psMaterial.setRow(resp.result.psMaterialID, resp.result.psMatName);
                this.f.molecularWeight.setValue(resp.result.molecularWeight);
                this.f.formulaType.setValue(resp.result.formulaType);
                this.enableHeaders(false);
            }
        })

        this._service.getMaterialSubCategories(MaterialCategories.GetMaterialCategoryCode("LAB_MAT"));
        this.getVolSolIndex('GET');
        this.prepareLKP();

    }

    getVolSolIndex(type: string) {
        if(type == "SEARCH" && !CommonMethods.hasValue(this.material.selectedId) && !CommonMethods.hasValue(this.psMaterial.selectedId)
        && !CommonMethods.hasValue(this.f.formulaType.value) && !CommonMethods.hasValue(this.f.status.value))
        return this._alert.warning(LimsRespMessages.chooseOne);
        else if(type == "SEARCHALL"){
            this.material.clear();
            this.psMaterial.clear()
            this.f.formulaType.setValue('');
            this.f.status.setValue('');
        }

        var obj: GetVolumetricSolIndex = new GetVolumetricSolIndex();
        obj.type = type;
        obj.encIndexID = this.encIndexID;
        obj.formulaType = this.f.formulaType.value;
        obj.materialID = this.material.selectedId;
        obj.molecularWeight = this.f.molecularWeight.value;
        obj.psMaterialID = this.psMaterial.selectedId;
        obj.status = this.f.status.value;

       if(type == 'MNG')
         this.isLoaderStart = true;
        this._service.getVolumetricSolIndex(obj);
    }

    prepareHeaders() {
        this.headerData = [];
        this.headerData.push({ "columnDef": 'matName', "header": "Solution", cell: (element: any) => `${element.matName}`, width: 'minWidth-10per' });
        // this.headerData.push({ "columnDef": 'matCode', "header": "Material Code", cell: (element: any) => `${element.matCode}` });
        this.headerData.push({ "columnDef": 'psMatName', "header": "PS Material", cell: (element: any) => `${element.psMatName}`, width: 'minWidth-10per' });
        // this.headerData.push({ "columnDef": 'psMatCode', "header": "PS Material Code", cell: (element: any) => `${element.psMatCode}` });
        // this.headerData.push({ "columnDef": 'molecularWeight', "header": "Primary Standard Molecular Weight", cell: (element: any) => `${element.molecularWeight}`, width: 'maxWidth-15per' });
        this.headerData.push({ "columnDef": 'formulaType', "header": "Formula Type", cell: (element: any) => `${element.formulaType}`, width: 'maxWidth-10per' });
        this.headerData.push({ "columnDef": "status", "header": "Status", cell: (element: any) => `${element.status}`, width: "maxWidth-10per" });
    }

    prepareLKP() {
        this.condition = "1 = 2";

        if (CommonMethods.hasValue(this.f.subCategoryID.value))
            this.condition = 'SUBCATID = ' + this.f.subCategoryID.value;

        this.materialInfo = CommonMethods.PrepareLookupInfo(LKPTitles.solution, LookupCodes.getAllMaterials, LKPDisplayNames.solution, LKPDisplayNames.stpNumber, LookUpDisplayField.header, LKPPlaceholders.solution, this.condition);

        this.condition = "1 = 2";

        if (CommonMethods.hasValue(this.f.subCategoryID.value)) {
            // var obj = this.subCategories.filter(x => x.caT_ITEM_CODE == "STANDARDS");
            // this.condition = 'SUBCATID = ' + obj[0].caT_ITEMID + " AND STATUS_CODE = 'ACT' AND CAT_CODE = 'LAB_MAT' AND CAT_ITEM_CODE NOT IN ('MOBILE_PHASE', 'TEST_SOLUTIONS_INDICATORS','VOLUMETRIC_SOL','STOCK_SOLUTION','RINSING_SOLUTION')";
            this.condition = "CAT_CODE = 'LAB_MAT' AND CAT_ITEM_CODE NOT IN ('MOBILE_PHASE', 'TEST_SOLUTIONS_INDICATORS','VOLUMETRIC_SOL','STOCK_SOLUTION','RINSING_SOLUTION') AND STATUS_CODE = 'ACT'";
        }

        this.psMaterialInfo = CommonMethods.PrepareLookupInfo(LKPTitles.psMaterials, LookupCodes.plantMaterials, LKPDisplayNames.psMaterial, LKPDisplayNames.psMaterialCode, LookUpDisplayField.header, LKPPlaceholders.psMaterial, this.condition);
    }

    enableHeaders(val: boolean) {
        this.buttonType = val ? ButtonActions.btnAdd : ButtonActions.btnUpdate;
        val ? this.volFormGroup.enable() : this.volFormGroup.disable();

        if (CommonMethods.hasValue(this.material.selectedData))
            this.material.disableBtn = !val;
        if (CommonMethods.hasValue(this.psMaterial.selectedData))
            this.psMaterial.disableBtn = !val;
    }

    addMaterial() {
        const modal = this._matDailog.open(AddNewMaterialComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.subCategory = this.getCategoryByID();
        modal.componentInstance.entityCode = EntityCodes.volumetricSol;
        modal.componentInstance.pageTitle = 'Solution';
        modal.componentInstance.pageType = this.buttonType == ButtonActions.btnUpdate ? 'VIEW' : 'MNG';
        modal.afterClosed().subscribe(resp => {
            this.prepareLKP();
        })
    }

    getCategoryByID() {
        var obj = this.subCategories.filter(x => x.caT_ITEMID == this.f.subCategoryID.value);

        if (obj.length > 0)
            return obj[0].caT_ITEM_CODE;
        else
            return "";
    }

    addIndex() {

        if (this.buttonType == ButtonActions.btnUpdate)
            return this.enableHeaders(true)

        var retval: string = this.validateControls();

        if (CommonMethods.hasValue(retval))
            return this._alert.warning(retval);

        this.getVolSolIndex('MNG');
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
                            this._service.getVolumetricSolIndex(obj);
                        }
                    })
                }
            });
        }
        else if (evt.action == GridActions.mngPro) {
            const modal = this._matDailog.open(ManageStandardProcedure, { width: '800px' });
            modal.disableClose = true;
            modal.componentInstance.encIndexID = evt.val.encIndexID;
        }
        else if (evt.action == GridActions.assignFormulae) {
            const model = this._matDailog.open(ManageAssignFormulaeComponent, { width: '80%' });
            model.disableClose = true;
            model.componentInstance.encIndexID = evt.val.encIndexID;
        }
        else if(evt.action == GridActions.view)
            this._router.navigate([PageUrls.viewVolSol], { queryParams: { id: evt.val.encIndexID } });            

        // this.encIndexID = evt.val.encIndexID;
        // this._service.getVolumetricSolIndexByID(this.encIndexID);
    }

    allowdecimal(event: any) {
        return CommonMethods.allowDecimal(event, CommonMethods.allowDecimalLength, 3);
    }

    validateControls() {
        if (!CommonMethods.hasValue(this.material.selectedId))
            return VolumetricSolMessages.solution;
        // else if (!CommonMethods.hasValue(this.psMaterial.selectedId))
        //     return VolumetricSolMessages.psMaterial;
        // else if (!CommonMethods.hasValue(this.f.molecularWeight.value))
        //     return VolumetricSolMessages.molecularWeight;
        else if (!CommonMethods.hasValue(this.f.formulaType.value))
            return VolumetricSolMessages.formulaType;
    }

    clear() {
        if (CommonMethods.hasValue(this.material.selectedData))
            this.material.clear();
        if (CommonMethods.hasValue(this.psMaterial.selectedData))
            this.psMaterial.clear();

        this.f.molecularWeight.setValue('');
        this.f.formulaType.setValue('');
        this.encIndexID = '';
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}