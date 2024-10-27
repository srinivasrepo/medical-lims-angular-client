import { Component, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { CommonService } from "../services/commonServices";
import { Subscription } from "rxjs";
import { MatSnackBar, MatDialogRef } from "@angular/material";
import { CommonMethods } from "../services/utilities/commonmethods";
import { DeviationMessages, DeviationBO, numberIDBO } from '../model/commonModel';
import { GlobalButtonIconsService } from '../services/globalButtonIcons.service';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { LimsRespMessages, LookupCodes } from '../services/utilities/constants';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';

@Component({
    selector: 'deviation',
    templateUrl: '../html/deviationHandler.html'
})

export class DeviationHandler {
    devForm: FormGroup;
    isvalid: boolean = false;
    entityCode: string;
    dcActionCode: string;
    subscription: Subscription = new Subscription();
    description: string;
    type: string;
    numberInfo: LookupInfo;
    condition: string;
    headersData: any;
    dataSource: any;
    lst: Array<numberIDBO> = [];

    @ViewChild('numbers', { static: true }) numbers: LookupComponent;

    constructor(private _service: CommonService, private _fb: FormBuilder, public _global: GlobalButtonIconsService, private _confirmService: ConfirmationService,
        public snackBar: MatSnackBar, public dialogRef: MatDialogRef<DeviationHandler>) {
        dialogRef.disableClose = true;
        this.devForm = this._fb.group({
            comments: ['', [Validators.required]]
        });
    }


    ngAfterViewInit() {
        this.subscription = this._service.commonSubject.subscribe(resp => {
            if (resp.purpose == "getDeviationDescription")
                this.description = resp.result;
        })
        this._service.getDeviationDescription(this.entityCode, this.dcActionCode);
    }

    confirmDeviation() {
        this.isvalid = true;
        if (!CommonMethods.hasValue(this.type))
            this.setWarningMessage(DeviationMessages.devTypeRequire);
        if (this.type != 'n' && (!CommonMethods.hasValue(this.dataSource.data) || this.dataSource.data.length == 0))
            this.setWarningMessage(DeviationMessages.selectAtleast);
        if (this.type == 'n' && !CommonMethods.hasValue(this.devForm.controls.comments.value))
            this.setWarningMessage(DeviationMessages.devCommentsReqire);
        else if (this.type == 'n' && this.devForm.controls.comments.value.trim().length < 30)
            this.setWarningMessage(DeviationMessages.devCommentsmin30);
        if (!this.isvalid)
            return;

        this._confirmService.confirm(LimsRespMessages.continue).subscribe((resp) => {
            if (resp) {
                let obj = new DeviationBO()
                obj.CanRiceDeviation = true;
                obj.DeviationType = this.type;
                obj.comments = this.devForm.controls.comments.value;
                if (this.type != 'n')
                    this.dataSource.data.forEach(x => {
                        var obj: numberIDBO = new numberIDBO;
                        obj.dID = x.id;
                        this.lst.push(obj);
                    })
                obj.lst = this.lst;
                this.close(obj);
            }
        })

    }

    getnumberInfo() {
        this.dataSource = null;
        this.dataSource = CommonMethods.bindMaterialGridData(this.dataSource);
        this.prepareHeaders();
        if (CommonMethods.hasValue(this.type) && this.type != 'n') {
            if (this.type == 'p') {
                this.condition = "PC_NUMBER IS NOT NULL AND STATUS_CODE NOT IN ('CLS','REJ')"
                this.numberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.plannedChange, LookupCodes.GetPlannedChange, LKPDisplayNames.department, LKPDisplayNames.pcNumber, LookUpDisplayField.code, LKPPlaceholders.number, this.condition);
            }
            else if (this.type == 'd') {
                this.condition = "DEV_NUMBER IS NOT NULL AND STATUS_CODE NOT IN ('CLS','REJ')"
                this.numberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.deviationNum, LookupCodes.GetDeviationRequest, LKPDisplayNames.department, LKPDisplayNames.devNumber, LookUpDisplayField.code, LKPPlaceholders.number, this.condition);

            }
            else if (this.type == 'c') {
                this.condition = "CCR_NUMBER IS NOT NULL AND STATUS_CODE NOT IN ('CLS','REJ')"
                this.numberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.changeControl, LookupCodes.GetChangeControl, LKPDisplayNames.department, LKPDisplayNames.ccNumber, LookUpDisplayField.code, LKPPlaceholders.number, this.condition);
            }
            else if (this.type == 'i') {
                this.condition = "INIT_PROCREQ_CODE IS NOT NULL AND STATUS_CODE NOT IN ('CLS','QAREJ','REJ')";
                this.numberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.initProc, LookupCodes.GetInitProcSearch, LKPDisplayNames.productTitle, LKPDisplayNames.ipNumber, LookUpDisplayField.code, LKPPlaceholders.number, this.condition);
            }
            else if (this.type == 'CAPA') {
                this.condition = "CAPA_NUMBER IS NOT NULL AND STATUS_CODE = 'UNDIMPLMNT'";
                this.numberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.capa, LookupCodes.GetExportCAPA, LKPDisplayNames.source, LKPDisplayNames.capaNum, LookUpDisplayField.code, LKPPlaceholders.number, this.condition, LKPDisplayNames.sourceRef);
            }
        }
    }

    selectedNumber(evt) {
        if (CommonMethods.hasValue(evt.val)) {
            if (CommonMethods.hasValue(this.dataSource.data)) {
                var obj = this.dataSource.data.filter(x => x.id == evt.val.id)
                if (CommonMethods.hasValue(obj) && obj.length > 0)
                    return this.setWarningMessage(DeviationMessages.selectNumber);
            }
            else
                this.dataSource.data = [];
            this.dataSource.data.push(evt.val);
            this.dataSource = CommonMethods.bindMaterialGridData(this.dataSource.data);
            this.numbers.clear();
        }
    }

    prepareHeaders() {
        this.headersData = [];
        if (this.type == 'p') {
            this.headersData.push({ columnDef: 'code', header: LKPDisplayNames.pcNumber, cell: (element: any) => `${element.code}` });
            this.headersData.push({ columnDef: 'Title', header: LKPDisplayNames.department, cell: (element: any) => `${element.name}` });
        }
        else if (this.type == 'd') {
            this.headersData.push({ columnDef: 'code', header: LKPDisplayNames.devNumber, cell: (element: any) => `${element.code}` });
            this.headersData.push({ columnDef: 'Title', header: LKPDisplayNames.department, cell: (element: any) => `${element.name}` });
        }
        else if (this.type == 'c') {
            this.headersData.push({ columnDef: 'code', header: LKPDisplayNames.ccNumber, cell: (element: any) => `${element.code}` });
            this.headersData.push({ columnDef: 'Title', header: LKPDisplayNames.department, cell: (element: any) => `${element.name}` });
        }
        else if (this.type == 'i') {
            this.headersData.push({ columnDef: 'code', header: LKPDisplayNames.ipNumber, cell: (element: any) => `${element.code}` });
            this.headersData.push({ columnDef: 'Title', header: LKPDisplayNames.productTitle, cell: (element: any) => `${element.name}` });
        }
        else if (this.type == 'CAPA') {
            this.headersData.push({ columnDef: 'code', header: LKPDisplayNames.capaNum, cell: (element: any) => `${element.code}` });
            this.headersData.push({ columnDef: 'Title', header: LKPDisplayNames.source, cell: (element: any) => `${element.name}` });
        }

    }

    setWarningMessage(msg: string) {
        this.snackBar.open(msg, "close", CommonMethods.worningConfig);
        this.isvalid = false;
    }

    clear(){
        this.type = "";
        this.devForm.controls.comments.setValue("");
        this.dataSource = null;
        this.dataSource = CommonMethods.bindMaterialGridData(this.dataSource);
    }

    close(val: any) {
        this.dialogRef.close(val);
    }
}