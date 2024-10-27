import { Component, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { RolePermissionService } from "../service/rolePermission.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ManageAppLevel, Condition, ManageTemplateRoles, ApprovalData, GetApprovalTemplateDetails } from "../model/rolePermissionModel";
import { RolePermissionMessages } from "../messages/rolePermissionMessages";
import { ManageApprovalLevelRoles } from "./manageAppLevelRoles.component";
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { MatDialog } from '@angular/material';
import { GridActions, PageUrls, LimsRespMessages, LookupCodes } from '../../common/services/utilities/constants';
import { AlertService } from '../../common/services/alert.service';
import { ConfirmationService } from '../../limsHelpers/component/confirmationService';
import { LookupInfo, LookUpDisplayField } from '../../limsHelpers/entity/limsGrid';
import { LookupComponent } from '../../limsHelpers/component/lookup';
import { LKPTitles, LkpPurpose, LKPDisplayNames, LKPPlaceholders } from '../../limsHelpers/entity/lookupTitles';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ManageStatusComponent } from './manageStatus.component';
import { ManageActionProvisionComponent } from './manageActionProvision.component';

@Component({
    selector: 'manage-applevel',
    templateUrl: '../html/manageAppLevel.html'
})

export class ManageAppLevelComponent {

    appLevelForm: FormGroup;
    appLevelDetails: any = {};

    templatedID: string;
    statusList: any;
    actionsList: any;
    appLevelList: Array<any> = [];

    checkedList: Array<any> = [];
    dataSource: any;
    headersData: Array<any> = [];

    actions: Array<any> = [GridActions.assign, GridActions.delete];
    // removeAction:any = {headerName : "MANAGE_APPLEVEL",ASSIGN:'VIEW',compareField :"operationType"};
    config: CommonMethods = new CommonMethods();
    actionChkboxselected: Array<any> = [];
    bindEmptyChkboxValue: boolean = false;
    subscription: Subscription = new Subscription();
    isDisplay: boolean = false;
    pageTitle: string;
    status: string;
    encEntityActID: string;
    backUrl: string = PageUrls.searchRolePer;
    notes: Array<any> = [];
    statusInfo: LookupInfo;
    @ViewChild('lkpStatus', { static: false }) lkpStatus: LookupComponent;
    componentInfo: LookupInfo;
    @ViewChild('lkpComponent', { static: false }) lkpComponent: LookupComponent;
    conditionCode: string;
    condition: string = "1=2";

    constructor(private _fb: FormBuilder, private _activatedRoute: ActivatedRoute,
        private _rolePermissionService: RolePermissionService, private _router: Router,
        private _notify: AlertService, private _modal: MatDialog,
        private _confirm: ConfirmationService, public _global: GlobalButtonIconsService
    ) {
        this.pageTitle = PageTitle.manageAppLevel;

        this.appLevelForm = this._fb.group({
            appLevelID: ['', [Validators.required]],
            statusID: [0, [Validators.required]],
            appType: ['S', [Validators.required]],
            action: ['', [Validators.required]],
            respectiveDept: [false],
            respectivePlant: [false],
            operationType: ['MANAGE']
        })
    }

    ngAfterViewInit() {
        this._activatedRoute.queryParams.subscribe(params => { this.templatedID = params['id']; this.encEntityActID = params['actualID']; });
        this.subscription = this._rolePermissionService.roleSubjectDetails.subscribe(resp => {
            if (resp.purpose == "getmanageAppLevel") {
                this.actionsList = resp.result.actionList;
                this.appLevelDetails = resp.result;
                this.isVisible();
                if (this.appLevelDetails.templateStatus == 'ACT')
                    this.actions = [GridActions.assign]
                else if (this.appLevelDetails.templateStatus == 'OBSE')
                    this.actions = []

                if (this.bindEmptyChkboxValue)
                    this.checkedList = [];

                this.checkedList.forEach((dup, index1) => {
                    this.actionsList.forEach((item, index) => {
                        if (item.actionID == this.checkedList[index1].actionID) {
                            this.actionsList[index].isSelect = true
                        }
                    })
                })

                this.status = resp.result.status;
                this.statusList = resp.result.statusList;
                this.conditionCode = resp.result.conditionCode;
                this.condition = "ConditionCode = '" + this.conditionCode + "'";
                this.prepareLKPComponent();
                this.dataSource = resp.result.manageAppLevel;

                this.dataSource.forEach((item) => {
                    item.appType = item.appType == "S" ? "Sequential" : "Parallel";
                })

                this.applevelIncrementByOne();
                this.bindEmptyChkboxValue = false;

                this.dataSource = CommonMethods.bindMaterialGridData(this.dataSource);
                this.notes = resp.result.notes;
                this.prepareHeaders();
            }

            else if (resp.purpose == "getActionList") {
                this.actionsList = resp.result;
               }
            else if (resp.purpose == "insertApprovalTemplates") {
                if (resp.result == "DUPLICATE")
                    this._notify.error(RolePermissionMessages.alreadyDeptLevelExists);
                else if (resp.result == "SUCCESS") {
                    this._notify.success(RolePermissionMessages.approvalDetails);
                    this.getApprovalTemplateDetails();
                    this.clear();
                }
                else
                    this._notify.error(resp.result);
            }
            else if (resp.purpose == "manageTemplate") {
                if (resp.result == "OK") {
                    this._notify.success(LimsRespMessages.changeStatusSuccess)
                    this._router.navigateByUrl('/lims/rPermission');
                }
                else
                    this._notify.error(RolePermissionMessages.alreadyExists);
            }
            else if (resp.purpose == "deleteApprovalTemplateDetails") {
                if (resp.result == "OK") {
                    this._notify.success(RolePermissionMessages.deleteApprovalDetails);
                    this.getApprovalTemplateDetails();
                }
                else
                    this._notify.error(resp.result);
            }

            else if (resp.purpose == "discardTemplate") {
                if (resp.result == "OK") {
                    this._notify.success(LimsRespMessages.discard);
                    this.status = "Discard";
                    this._router.navigateByUrl('/lims/rPermission');
                    this.isDisplay = false;
                }
                else
                    this._notify.error(resp.result);
            }
        })

        this.prepareLKPStatus();
        this.getApprovalTemplateDetails();
        this.prepareLKPComponent();
    }

    prepareLKPStatus() {
        this.statusInfo = CommonMethods.PrepareLookupInfo(LKPTitles.status, LookupCodes.statusMaster, LKPDisplayNames.Status, LKPDisplayNames.StatusCode, LookUpDisplayField.header, LKPPlaceholders.Status);
    }

    prepareLKPComponent() {
        this.componentInfo = CommonMethods.PrepareLookupInfo(LKPTitles.component, LookupCodes.getComponents, LKPDisplayNames.component, LKPDisplayNames.componentCode, LookUpDisplayField.header, LKPPlaceholders.component, this.condition, "", "IUT", "component");
    }

    getApprovalTemplateDetails() {
        var obj: GetApprovalTemplateDetails = new GetApprovalTemplateDetails();
        obj.encEntityActID = this.encEntityActID;
        obj.encTemplateID = this.templatedID;
        this._rolePermissionService.getManageApplevels(obj);
    }

    isVisible() {
        this.isDisplay = this.appLevelDetails.templateStatus == 'INPROG' ? true : false;
    }

    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ "columnDef": 'applevel', "header": "App Level", cell: (element: any) => `${element.applevel}`, width: 'maxWidth-10per' });
        this.headersData.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}`, width: 'maxWidth-10per' });
        this.headersData.push({ "columnDef": 'appType', "header": "App Type", cell: (element: any) => `${element.appType}`, width: 'maxWidth-10per' });
        this.headersData.push({ "columnDef": 'action', "header": "Actions", cell: (element: any) => `${element.action}`, width: 'minWidth-10per' });
        this.headersData.push({ "columnDef": 'respectiveDept', "header": "Respective Dept", cell: (element: any) => `${element.respectiveDept}`, width: 'maxWidth-10per' });
        this.headersData.push({ "columnDef": 'respectivePlant', "header": "Respective Plant", cell: (element: any) => `${element.respectivePlant}`, width: 'maxWidth-10per' });
        if(this.conditionCode == 'CLOSE_SHIFT')
            this.headersData.push({ "columnDef": 'component', "header": "Component", cell: (element: any) => `${element.component}`, width: 'maxWidth-10per' });
        this.headersData.push({ "columnDef": 'operationType', "header": "Operation Type", cell: (element: any) => `${element.operationType}`, width: 'maxWidth-10per' });

    }

    applevelIncrementByOne() {      // Increase Levels In DDL
        this.appLevelList = [];
        for (let i = 0; i <= 10; i++) {
            this.appLevelList.push({ "id": i });
        }
    }

    onSelectcheckBox(val: number, evt) {
        var index = this.checkedList.findIndex((item) => item.actionID == evt.source.value);
        if (index != -1)
            this.checkedList.splice(index, 1);
        else
            this.checkedList.push({ actionID: val });

        // this.actionChkboxselected = this.checkedList;

    }

    add() {
        this.bindEmptyChkboxValue = false;

        var retVal: string = "";
        retVal = this.ValidateControls();

        if (CommonMethods.hasValue(retVal))
            return this._notify.warning(retVal);

        var objData: ManageAppLevel = this.formData();

        this._rolePermissionService.insertApprovalTemplates(objData);
    }

    formData(): ManageAppLevel {
        let bo = new ManageAppLevel();
        bo.appLevel = this.appLevelForm.controls.appLevelID.value;
        bo.statusID = this.lkpStatus.selectedId;
        bo.appType = this.appLevelForm.controls.appType.value;
        bo.actions = this.checkedList;
        bo.encTemplateIDU = this.templatedID;
        bo.respectiveDept = this.appLevelForm.controls.respectiveDept.value;
        bo.respectivePlant = this.appLevelForm.controls.respectivePlant.value;
        bo.componentID = this.lkpComponent.selectedId;
        bo.operationType = this.appLevelForm.controls.operationType.value;
        return bo;
    }

    ValidateControls() {
        if (this.appLevelForm.controls.appLevelID.value === "")
            return RolePermissionMessages.levelMandatory;
        else if (this.lkpStatus.selectedId < 1)
            return RolePermissionMessages.statusMandatory;
        else if (!CommonMethods.hasValue(this.appLevelForm.controls.appType.value))
            return RolePermissionMessages.appTypeMandatory;
        else if (this.checkedList.length < 1)
            return RolePermissionMessages.atleastoneAction;
    }


    onActionClicked(evt) {
        if (evt.action == "ASSIGN") {
            const modalRef = this._modal.open(ManageApprovalLevelRoles, { width: '80vw' });
            var obj: ApprovalData = new ApprovalData();
            obj.encDetailID = evt.val.encDetailID;
            obj.type = 'AppLevelRoles';
            modalRef.componentInstance.data = obj;
            modalRef.componentInstance.encEntityActID = this.encEntityActID;
            modalRef.disableClose = true;

        }
        else if (evt.action == "DELETE") {
            this._confirm.confirm(LimsRespMessages.delete).subscribe(result => {
                if (result) {
                    let bo = new ManageTemplateRoles();
                    bo.encDetailID = evt.val.encDetailID;
                    this._rolePermissionService.deleteApprovalTemplateDetails(bo);
                }
            });

        }
    }

    LevelValidations() {
        var loopcondition = true
        var msg: string = '';
        this.dataSource.data.forEach(obj => {
            if (loopcondition && obj.applevel != 0) {
                var index = this.dataSource.data.findIndex(ob => ob.applevel == obj.applevel - 1)
                loopcondition = (index > -1)
            }
        });
        return loopcondition;
    }

    Confirm() {
        if (!this.LevelValidations()) {
            this._notify.warning(RolePermissionMessages.enterPreviousLevels);
            return;
        }

        this._confirm.confirm(RolePermissionMessages.confirmActive).subscribe(result => {
            if (result) {
                let con = new Condition();
                con.encTemplateIDU = this.templatedID;
                this._rolePermissionService.manageTemplate(con);
            }
        })

    }


    clear() {
        this.bindEmptyChkboxValue = true;

        this.appLevelForm.reset({ appLevelID: '', statusID: 0, appType: '', action: '' });

        this.actionsList.forEach((item) => {
            item.isSelect = false;
        })

        this.lkpStatus.clear();

        this.checkedList = []
    }

    discard() {
        this._confirm.confirm(LimsRespMessages.continue).subscribe(result => {
            if (result)
                this._rolePermissionService.discardTemplate(this.templatedID);
        })
    }

    changeAppLevel() {
        if (this.appLevelForm.controls.appLevelID.value == 0) {
            this.appLevelForm.controls.respectiveDept.setValue(true);
            this.appLevelForm.controls.respectivePlant.setValue(true);
            // this.appLevelForm.controls.respectiveDept.disable();
            //this.appLevelForm.controls.respectivePlant.disable();
        }
        else {
            // this.appLevelForm.controls.respectiveDept.enable();
            //this.appLevelForm.controls.respectivePlant.enable();
            this.appLevelForm.controls.respectiveDept.setValue(false);
            this.appLevelForm.controls.respectivePlant.setValue(false);
        }
    }

    addStatus() {
       this._modal.open(ManageStatusComponent, CommonMethods.modalFullWidth );
    }

    addAction() {
        const model = this._modal.open(ManageActionProvisionComponent, CommonMethods.modalFullWidth );
        model.afterClosed().subscribe((obj) => {
            if (obj)
           this._rolePermissionService.getActionList();
        });
     }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}