import { Component, OnInit, ViewChild } from '@angular/core';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { Subscription } from 'rxjs';
import { VolumetricSolService } from '../service/volumetricSol.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { GetAssignFormulae, AssignFormulae } from '../model/volumetricSolModel';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { VolumetricSolMessages } from '../messages/volumetricSolMessages';
import { MatDialogRef } from '@angular/material';
import { GridActions, LookupCodes, ActionMessages } from 'src/app/common/services/utilities/constants';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';


@Component({
    selector: 'assig-formu',
    templateUrl: '../html/manageAssignFormulae.html'
})

export class ManageAssignFormulaeComponent {

    encIndexID: string;
    pageTitle: string = PageTitle.mngAssignForm;

    getSolObj: Array<GetAssignFormulae> = [];
    saveObj: AssignFormulae = new AssignFormulae();

    subscription: Subscription = new Subscription();
    headersData: any;

    strengthRangeFrom: number;
    strengthRangeTo: number;
    dataSource: any;
    action: any = [GridActions.delete];
    formulaInfo: LookupInfo;
    @ViewChild('formula', { static: false }) formula: LookupComponent;
    isLoaderStart: boolean;

    constructor(private _service: VolumetricSolService, public _global: GlobalButtonIconsService, private _confService: ConfirmationService,
        private _alert: AlertService, private _closeMat: MatDialogRef<ManageAssignFormulaeComponent>) { }

    ngAfterViewInit() {
        this.subscription = this._service.VolumetricSubject.subscribe(resp => {
            if (resp.purpose == "getSolutionFormulae") {
                this.getSolObj = resp.result;
                this.dataSource = CommonMethods.bindMaterialGridData(this.getSolObj);
            }

            else if (resp.purpose == "manageSolutionFormula") {
                this.isLoaderStart = false;
                if (resp.result == "OK") {
                    this._service.getSolutionFormulae(this.encIndexID);
                    this.formula.clear();
                    this.strengthRangeFrom = this.strengthRangeTo = null;
                    if (resp.type == 'SAVE')
                        this._alert.success(VolumetricSolMessages.assignFormulaeSuccess);
                    else
                        this._alert.success(VolumetricSolMessages.assignFormulaeDelete)
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
        });
        this.prepareHeaders();
        this.formulaInfo = CommonMethods.PrepareLookupInfo(LKPTitles.formula, LookupCodes.solutionFormulae, LKPDisplayNames.formulaTitle, LKPDisplayNames.formulaDef, LookUpDisplayField.header, LKPPlaceholders.formula);

        this._service.getSolutionFormulae(this.encIndexID);

    }

    saveAssignedFormula() {
        var errMsg = this.validate();
        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg);

        this.saveObj.encIndexID = this.encIndexID;
        this.saveObj.formulaID = this.formula.selectedId;
        this.saveObj.strengthRangeFrom = this.strengthRangeFrom;
        this.saveObj.strengthRangeTo = this.strengthRangeTo;
        this.saveObj.type = 'SAVE';

        this.isLoaderStart = true;
        this._service.manageSolutionFormula(this.saveObj);
    }

    validate() {
        if (!CommonMethods.hasValue(this.formula.selectedId))
            return VolumetricSolMessages.assignFormulae;
        else if (!CommonMethods.hasValueWithZero(this.strengthRangeFrom))
            return VolumetricSolMessages.rangeFrom;
        else if (!CommonMethods.hasValueWithZero(this.strengthRangeTo))
            return VolumetricSolMessages.rangeTo;
        else if (Number(this.strengthRangeFrom) > Number(this.strengthRangeTo))
            return VolumetricSolMessages.moreThanRangeFrom;
    }

    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ columnDef: 'formulaTitle', header: 'Formula Title', cell: (element: any) => `${element.formulaTitle}` });
        this.headersData.push({ columnDef: 'strengthRangeFrom', header: 'Strength Range From', cell: (element: any) => `${element.strengthRangeFrom}` });
        this.headersData.push({ columnDef: 'strengthRangeTo', header: 'Strength Range To', cell: (element: any) => `${element.strengthRangeTo}` });
    }

    onActionClicked(evt) {
        if (evt.action == GridActions.delete) {
            this._confService.confirm(VolumetricSolMessages.confmDelete).subscribe(re => {
                if (re) {
                    this.saveObj.type = 'DELETE'
                    this.saveObj.formulaIndexID = evt.val.indexFormulaID;
                    this._service.manageSolutionFormula(this.saveObj);
                }
            })
        }
    }

    allowdecimal(event: any) {
        return CommonMethods.allowDecimal(event, 16, 5, 10);
    }

    close() {
        this._closeMat.close();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }


}