import { Component, OnDestroy, AfterContentInit, ViewChild } from "@angular/core";
import { Subscription } from 'rxjs';
import { QCCalibrationsService } from '../services/qcCalibrations.service';
import { ActivatedRoute } from '@angular/router';
import { GridActions, EntityCodes, PageUrls, ActionMessages, LookupCodes } from 'src/app/common/services/utilities/constants';
import { MatDialog } from '@angular/material';
import { QCCalibTestResultComponent } from './testResult.component';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { GetQCCalibrationDetailsBO, ManageSTPGroupTestBO } from '../models/qcCalibrationsModel';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { AlertService } from 'src/app/common/services/alert.service';
import { QCCalibrationMessages } from '../messages/qcCalibrationMessages';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';

@Component({
    selector: 'app-qcCalib-view',
    templateUrl: '../html/viewQCCalibrations.html'
})
export class ViewQCCalibrationsComponent implements AfterContentInit, OnDestroy {

    encCalibParamID: string;
    entityCode : string = EntityCodes.calibParamSet;
    qcCalibBO: GetQCCalibrationDetailsBO = new GetQCCalibrationDetailsBO();
    viewHistory: TransHistoryBo = new TransHistoryBo();

    templateInfo: LookupInfo;
    @ViewChild('template', { static: false }) template: LookupComponent;


    headersData: any;
    dataSource: any;
    actions: Array<string> = [GridActions.view, GridActions.PDF]
    pageType: string = 'VIEW';

    subscription: Subscription = new Subscription();

    constructor(private _service: QCCalibrationsService, private _actRoute: ActivatedRoute,
        private _matDailog: MatDialog, private _global: GlobalButtonIconsService, private _alert: AlertService
    ) { }


    ngAfterContentInit() {

        this._actRoute.queryParams.subscribe(param => this.encCalibParamID = param['id']);

        this.subscription = this._service.qcCalibrationsSubject.subscribe(resp => {
            if (resp.purpose == "viewCalibrationDetailsByID") {

                if (this.pageType != 'VIEW') {

                    resp.result.list.forEach((item) => {
                        if (item.rowType != 'TEST')
                            item['isSelected'] = this.pageType == 'ASSIGN_STP' ? false : item.isGroupTest;
                    })

                    this.actions = [];
                }

                this.dataSource = CommonMethods.bindMaterialGridData(resp.result.list);
                this.qcCalibBO = resp.result.headersInfo;

                if (this.template)
                    this.template.clear();

            }
            else if (resp.purpose == "manageAssignSTPGroupTest") {
                if (resp.result.returnFlag == "SUCCESS") {
                    if (this.pageType == 'ASSIGN_STP')
                        this._alert.success(QCCalibrationMessages.savedSTPAssigned);
                    else
                        this._alert.success(QCCalibrationMessages.savedGroupTechAssigned);

                    this.qcCalibBO.initTime = resp.result.initTime;

                    this._service.viewCalibrationDetailsByID(this.encCalibParamID);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag))

            }
        })

        this.pageType = this.getPageTypeCode();

        if (this.pageType == "ASSIGN_STP")
            this.prepareStdInfo();

        this.tranHistory();
        this.prepareHeaders();
        this._service.viewCalibrationDetailsByID(this.encCalibParamID);

    }

    prepareStdInfo() {
        this.templateInfo = CommonMethods.PrepareLookupInfo(LKPTitles.stdProcedure, LookupCodes.standardTestProc, LKPDisplayNames.stpTitle, LKPDisplayNames.templateNo, LookUpDisplayField.header, LKPPlaceholders.stpTitle, "STP_TYPE = 'C' AND STATUS_CODE = 'ACT'");
    }

    getPageTypeCode() {
        return localStorage.getItem('SEARCH_CALIB_ACT')
    }

    prepareHeaders() {
        this.headersData = [];

        if (this.pageType != 'VIEW')
            this.headersData.push({ "columnDef": 'isSelected', "header": "", cell: (element: any) => `${element.isSelected}`, width: "maxWidth-5per" });

        this.headersData.push({ "columnDef": 'srNum', "header": "S.No.", cell: (element: any) => `${element.srNum}`, width: "maxWidth-5per" });
        this.headersData.push({ "columnDef": 'testNameCode', "header": "Parameter Name(Parameter ID)", cell: (element: any) => `${element.testNameCode}`, width: this.pageType != 'MANAGE_GP_TECH' ? "maxWidth-30per" : "minWidth-10per" });
        this.headersData.push({ "columnDef": 'specDesc', "header": "Acceptance Criteria", cell: (element: any) => `${element.specDesc}`, width: this.pageType != 'MANAGE_GP_TECH' ? "minWidth-15per " : "" });
        this.headersData.push({ "columnDef": 'limitResult', "header": "Limit for Results", cell: (element: any) => `${element.limitResult}`, width: this.pageType != 'MANAGE_GP_TECH' ? "minWidth-15per" : "" });

        if (this.pageType != 'MANAGE_GP_TECH')
            this.headersData.push({ "columnDef": 'stpTitle', "header": "STP Title", cell: (element: any) => `${element.stpTitle}`, width: "maxWidth-22per" });

        if (this.pageType != 'MANAGE_GP_TECH')
            this.headersData.push({ "columnDef": 'isGroupTest', "header": "Group Technique", cell: (element: any) => `${element.isGroupTest}`, width: "maxWidth-15per" });

    }

    getHeaderInfo(type: string) {
        if (type == 'TITLE')
            return this.pageType == 'VIEW' ? PageTitle.viewQCCalibrations : this.pageType == 'MANAGE_GP_TECH' ? PageTitle.manageGroupQCCalibrations : this.pageType == 'ASSIGN_STP' ? PageTitle.manageAssignStp : null;
        else if (type == 'BACKURL')
            return PageUrls.searchQCCalib;
        else if (type == 'STATUS')
            return this.qcCalibBO.status;
        else if (type == 'REFNUM')
            return this.qcCalibBO.requestCode;
        else if (type == 'SAVE_ICON')
            return this._global.icnSave;
        else if (type == 'UPLOAD')
            return this._global.icnViewFiles;

    }

    onActionClicked(evt: any, type: string) {
        if (evt.action == "PDF") {
            const modal = this._matDailog.open(QCCalibTestResultComponent, CommonMethods.modalFullWidth);
            modal.componentInstance.encSpecCatID = evt.val.encSpecCatID;
            modal.afterClosed();
        }
        else if (evt.action == 'VIEW_METHOD')
            this.Uploadfiles('METHOD', evt.val.encSpecCatID);
        else if (evt.action == 'VIEW')
            this.Uploadfiles('FILE', evt.val.encSpecCatID);
    }

    Uploadfiles(type: string, val: any = this.encCalibParamID) {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.calibParamSet, 0, type == 'FILE' ? 'CALIB_PARAM_FILE' : type == 'METHOD' ? 'CALIB_PARAM_METHOD' : type == 'HEADER_UPLOAD' ? 'CALIB_PARAM_REQ' : null, val, [], 'MEDICAL_LIMS');
        modal.componentInstance.mode = 'VIEW';
        modal.componentInstance.uploadTitle = type == 'METHOD' ? 'View Method' : type == 'FILE' ? 'View Files' : modal.componentInstance.uploadTitle;
        modal.afterClosed().subscribe((resu) => { })
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encCalibParamID;
        obj.code = 'CAL_PARAM_SET';
        this.viewHistory = obj;
    }


    save() {

        var obj: ManageSTPGroupTestBO = new ManageSTPGroupTestBO();
        obj.encCalibParamID = this.encCalibParamID;
        obj.initTime = this.qcCalibBO.initTime;

        var index = this.dataSource.data.findIndex(x => x.isSelected);

        if (this.pageType == 'ASSIGN_STP') {
            if (index < 0)
                return this._alert.warning(QCCalibrationMessages.selectOneTest);
            else if (!CommonMethods.hasValue(this.template.selectedId))
                return this._alert.warning(QCCalibrationMessages.selectTemplate);

            obj.templateID = this.template.selectedId;
        }
        else if (index < 0)
            return this._alert.warning(QCCalibrationMessages.selectOneGroupTechnique);

        obj.list = this.dataSource.data;

        this._service.manageAssignSTPGroupTest(obj);
    }

    // totalTest() {
    //     return this.dataSource && this.dataSource.data.filter(x => x.rowType == 'TEST').length;
    // }


    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}