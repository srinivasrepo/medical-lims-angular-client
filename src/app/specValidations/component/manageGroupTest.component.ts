import { Component, ViewChild } from '@angular/core';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { LookupCodes, ButtonActions, PageUrls, ActionMessages } from 'src/app/common/services/utilities/constants';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { SpecValidationsService } from '../service/specValidations.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { Subscription } from 'rxjs';
import { SpecValidationMessages } from '../messages/specValidationsMessages';
import { QCCalibrationMessages } from 'src/app/qcCalibrations/messages/qcCalibrationMessages';
import { ManageSTPGroupTestBO, ManageQCCalibrationBO } from 'src/app/qcCalibrations/models/qcCalibrationsModel';

@Component({
    selector: 'mng-tst',
    templateUrl: '../html/manageGroupTest.html'
})

export class ManageGroupTestComponent {


    pageTitle: string = PageTitle.manageGroupTest;
    btnText: string = ButtonActions.btnGo;
    backUrl: string = PageUrls.SearchspecValid;
    specificationName: string;

    calibrationHeadersData: any;
    calibrationDatasource: any;

    manageCalibBO: ManageQCCalibrationBO = new ManageQCCalibrationBO();
   
    specificationsInfo: LookupInfo;
    @ViewChild('specifications', { static: true }) specifications: LookupComponent;

    subscription: Subscription = new Subscription();

    constructor(public _global: GlobalButtonIconsService, private _specService: SpecValidationsService,
        private _alert: AlertService) { }

    ngAfterViewInit() {

        this.subscription = this._specService.specValidSubject.subscribe(resp => {
            if (resp.purpose == "getCalibrationTests") {

                resp.result.forEach((item) => {
                    if (item.rowType != 'TEST')
                        item['isSelected'] = item.isGroupTest;
                })

                this.calibrationDatasource = CommonMethods.bindMaterialGridData(resp.result);
                this.btnText = ButtonActions.btnChange;
            }

            else if (resp.purpose == "manageAssignSTPGroupTest") {
                if (resp.result.returnFlag == "SUCCESS") 
                    this._alert.success(QCCalibrationMessages.savedGroupTechAssigned);
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag))

            }
        })
        this.prepareLkp();
        this.prepareHeaders();
    }

    prepareLkp() {
        this.specificationsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.specifications, LookupCodes.getSpecifications, LKPDisplayNames.specification,
            LKPDisplayNames.specNumber, LookUpDisplayField.code, LKPPlaceholders.specification, "(STATUS_CODE = 'ACT' OR STATUS_CODE = 'FOR_VALID' OR STATUS_CODE = 'VALIDATE_FAILD' )", '', 'LIMS');
    }

    prepareHeaders() {
        this.calibrationHeadersData = [];

        this.calibrationHeadersData.push({ "columnDef": 'isSelected', "header": "", cell: (element: any) => `${element.isSelected}`, width: "maxWidth-5per" });
        this.calibrationHeadersData.push({ "columnDef": 'srNum', "header": "S.No.", cell: (element: any) => `${element.srNum}`, width: "maxWidth-5per" });
        this.calibrationHeadersData.push({ "columnDef": 'testNameCode', "header": "Test Name(Test ID)", cell: (element: any) => `${element.testNameCode}`, width: "minWidth-10per maxWidth-30per" });
        this.calibrationHeadersData.push({ "columnDef": 'specDesc', "header": "Acceptance Criteria", cell: (element: any) => `${element.specDesc}`, width: "minWidth-15per maxWidth-30per" });
        this.calibrationHeadersData.push({ "columnDef": 'limitResult', "header": "Limit for Results", cell: (element: any) => `${element.limitResult}`, width: "minWidth-15per maxWidth-30per" });

    }

    getNewSpec(evt){
        this.calibrationDatasource = null;
    }

    goGroupTest() {
        if(this.btnText == ButtonActions.btnChange){
            this.btnText = ButtonActions.btnGo;
            return;
        }

        if (!CommonMethods.hasValue(this.specifications.selectedId))
            return this._alert.warning(SpecValidationMessages.specification);
    
        this.specificationName = this.specifications.selectedText;
        this._specService.getCalibrationTests('', this.specifications.selectedId);
    }

    manageGroupTechnique() {

        var data = this.calibrationDatasource.data.filter(x => x.isSelected);

        if (data.length == 0)
            return this._alert.warning(QCCalibrationMessages.selectOneGroupTechnique);

        var error: string = this.validation(data);
        if (CommonMethods.hasValue(error))
            return this._alert.warning(error);

        var obj: ManageSTPGroupTestBO = new ManageSTPGroupTestBO();
        obj.specID = this.specifications.selectedId;
        obj.list = this.calibrationDatasource.data;
        obj.entityCode = 'QCSPEC';

        this._specService.manageAssignSTPGroupTest(obj);
    }


    validation(obj) {
        var msg: string = "";
        obj.forEach(x => {
            var item = obj.filter(o => o.testCategoryID == x.testCategoryID && o.specCatID != x.specCatID && (!CommonMethods.hasValue(x.testSubCatID) || x.testSubCatID == o.testSubCatID))
            if (item.length > 0)
                msg = SpecValidationMessages.sameGrp;
        })
        return msg
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}