import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { SpecValidationsService } from '../service/specValidations.service';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { ButtonActions, PageUrls, LookupCodes, ActionMessages, EntityCodes } from 'src/app/common/services/utilities/constants';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { LKPDisplayNames, LKPTitles, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { GetSpecificationTestToAssignSTP, ManageSTP } from '../model/specValidations';
import { SpecValidationMessages } from '../messages/specValidationsMessages';
import { QCCalibrationMessages } from 'src/app/qcCalibrations/messages/qcCalibrationMessages';
import { MatDialog } from '@angular/material';
import { TestSTPHistoryComponent } from './testSTPHistory.component';

@Component({
    selector: 'app-stp',
    templateUrl: '../html/assignSTP.html'
})

export class AssignSTPComponent {

    pageTitle: string = PageTitle.assignSTP;
    btnText: string = ButtonActions.btnGo;
    backUrl: string = PageUrls.SearchspecValid;
    specificationName: string;
    dataSource: any;
    headersData: any;
    displayedColumns: any;

    getAssignSTPObj: GetSpecificationTestToAssignSTP = new GetSpecificationTestToAssignSTP();
    manageSTPObj: ManageSTP = new ManageSTP();
    entityCode: string;

    specificationsInfo: LookupInfo;
    @ViewChild('specifications', { static: true }) specifications: LookupComponent;
    templateInfo: LookupInfo;
    @ViewChild('tempalte', { static: true }) tempalte: LookupComponent;

    subscription: Subscription = new Subscription();

    constructor(public _global: GlobalButtonIconsService, private _specService: SpecValidationsService,
        private _alert: AlertService, private _modal: MatDialog) { }

    ngOnInit() {
        this.subscription = this._specService.specValidSubject.subscribe(resp => {
            if (resp.purpose == "getSpecificationTestToAssignSTP") {
                this.manageSTPObj = new ManageSTP();
                this.btnText = ButtonActions.btnChange;
                this.dataSource = CommonMethods.bindMaterialGridData(resp.result);
                this.prepareStpLkp();
            }
            else if (resp.purpose == "assignSTPToTest") {
                this.manageSTPObj.list = [];
                if (resp.result == "SUCCESS") {
                    this.tempalte.clear();
                    this._alert.success(resp.type == "ASSIGN" ? SpecValidationMessages.assignStp : SpecValidationMessages.unAssignStp);
                    if (this.entityCode == EntityCodes.specValidation)
                        this._specService.getSpecificationTestToAssignSTP(this.specifications.selectedId, 0);
                    else
                        this._specService.getSpecificationTestToAssignSTP(0, this.specifications.selectedId);
                }
                else
                    this._alert.warning(ActionMessages.GetMessageByCode(resp.result));

            }
        })
        this.entityCode = localStorage.getItem("entityCode");
        this.prepareLkp();
        this.prepareHeaders();
    }

    prepareStpLkp() {
        if (this.entityCode == EntityCodes.specValidation)
            this.templateInfo = CommonMethods.PrepareLookupInfo(LKPTitles.stdProcedure, LookupCodes.standardTestProc, LKPDisplayNames.stpTitle,
                LKPDisplayNames.templateNo, LookUpDisplayField.header, LKPPlaceholders.stpTitle, "STP_TYPE = 'A' AND STATUS_CODE = 'ACT'");
        else
            this.templateInfo = CommonMethods.PrepareLookupInfo(LKPTitles.stdProcedure, LookupCodes.standardTestProc, LKPDisplayNames.stpTitle,
                LKPDisplayNames.templateNo, LookUpDisplayField.header, LKPPlaceholders.stpTitle, "STP_TYPE = 'C' AND STATUS_CODE = 'ACT'");
    }

    goAssignSTP() {
        if (this.btnText == ButtonActions.btnChange)
            return this.btnText = ButtonActions.btnGo;

        if (!CommonMethods.hasValue(this.specifications.selectedId))
            return this._alert.warning(SpecValidationMessages.specification);

        this.specificationName = this.specifications.selectedText;
        if (this.entityCode == EntityCodes.specValidation)
            this._specService.getSpecificationTestToAssignSTP(this.specifications.selectedId, 0);
        else
            this._specService.getSpecificationTestToAssignSTP(0, this.specifications.selectedId);
    }

    prepareLkp() {
        if (this.entityCode == EntityCodes.specValidation)
            this.specificationsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.specifications, LookupCodes.getSpecifications, LKPDisplayNames.specification,
                LKPDisplayNames.specNumber, LookUpDisplayField.code, LKPPlaceholders.specification, "(STATUS_CODE = 'ACT' OR STATUS_CODE = 'FOR_VALID' OR STATUS_CODE = 'VALIDATE_FAILD' )", '', 'LIMS');
        else
            this.specificationsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.calibration, LookupCodes.getCalibrationParameters, LKPDisplayNames.calibInTitle,
                LKPDisplayNames.calibCode, LookUpDisplayField.code, LKPPlaceholders.calibrationParam, "(STATUS_CODE = 'ACT' OR STATUS_CODE = 'FOR_VALID' OR STATUS_CODE = 'VALIDATE_FAILD' )", '', 'LIMS');

    }

    prepareHeaders() {
        this.headersData = [];

        this.headersData.push({ "columnDef": 'isSelected', "header": "", cell: (element: any) => `${element.isSelected}`, width: "maxWidth-5per" })
        this.headersData.push({ "columnDef": 'srNum', "header": "S.No.", cell: (element: any) => `${element.srNum}`, width: "maxWidth-5per" });
        this.headersData.push({ "columnDef": 'testName', "header": "Test Name", cell: (element: any) => `${element.testName}`, width: "minWidth-10per maxWidth-30per" });
        this.headersData.push({ "columnDef": 'specDesc', "header": "Specification Limit", cell: (element: any) => `${element.specDesc}`, width: "minWidth-15per maxWidth-30per" });
        this.headersData.push({ "columnDef": 'templateCode', "header": "Template Code", cell: (element: any) => `${element.templateCode}`, width: "minWidth-15per maxWidth-30per" });
        this.headersData.push({ "columnDef": 'resultStatus', "header": "Result Set Valid?(Yes / No)", cell: (element: any) => `${element.resultStatus}`, width: "minWidth-15per maxWidth-30per" });
        this.headersData.push({ "columnDef": 'validationStatus', "header": "STP Valid?(Yes / No)", cell: (element: any) => `${element.validationStatus}`, width: "minWidth-15per maxWidth-30per" });

        this.displayedColumns = this.headersData.map(c => c.columnDef);
        this.displayedColumns.push('actions');
    }

    showCheckBox() {
        return this.dataSource && this.dataSource.data && this.dataSource.data.length > 0;
    }

    checkboxFields = ['isSelected'];

    isShowCheckBox(columnDef: string, row: any) {

        if (row && row['rowType'] == "TEST" || row['rowType'] == "Group")
            return this.checkboxFields.includes(columnDef) && this.showCheckBox();

        return false;
    }

    selectCheckBox(evt, row) {
        if (evt.checked)
            row['checkboxField'] = true;
    }

    manageSTP(type: string) {
        var selectedList = this.dataSource.data.filter(x => x.checkboxField);

        if (selectedList.length == 0)
            return this._alert.warning(SpecValidationMessages.selectOneSTP);
        var errMsg: string = this.validation(type);
        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg)
        if (this.entityCode == EntityCodes.specValidation)
            this.manageSTPObj.specID = this.specifications.selectedId;
        else
            this.manageSTPObj.calibID = this.specifications.selectedId;
        this.manageSTPObj.type = type;
        this.manageSTPObj.templateID = this.tempalte.selectedId;
        selectedList.forEach(element => { this.manageSTPObj.list.push({ id: element.specCatID }) });
        this._specService.assignSTPToTest(this.manageSTPObj);
    }

    validation(type: string) {
        if (!CommonMethods.hasValue(this.tempalte.selectedId) && type == "ASSIGN")
            return QCCalibrationMessages.selectTemplate;
    }

    formatString(val) {
        return CommonMethods.FormatValueString(val)
    }

    selectNewSpec() {
        this.dataSource = null;
    }

    onActionClick(id) {
        const modal = this._modal.open(TestSTPHistoryComponent, { width: '60%' });
        modal.disableClose = true;
        modal.componentInstance.specCatID = id;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}