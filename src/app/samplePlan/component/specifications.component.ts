import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Subscription } from 'rxjs';
import { SamplePlanService } from '../service/samplePlan.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { ActionMessages, SamplePlanLocalKeys, ButtonActions } from 'src/app/common/services/utilities/constants';
import { SamplePlanMessages } from '../messages/samplePlanMessages';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { GetSamplesWithMultSpecModel, SaveSampleSpecModel, SpecDetailsList, SpecDetails, GetSampleDetailsModel } from '../model/samplePlanModel';
import { MatDialog } from '@angular/material';
import { ViewSampleDetailsComponent } from './viewSampleDetails.component';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'sample-specifications',
    templateUrl: '../html/specifications.html'
})
export class SpecificationsComponent {

    @Input('encSamplePlanID') encSamplePlanID: string;
    @Input('appBO') appBO: AppBO = new AppBO();
    btnSaveType: string = ButtonActions.btnSave;
    getSamplesWithMult: GetSamplesWithMultSpecModel = new GetSamplesWithMultSpecModel();
    // btnDisabled: boolean;
    disableAll: boolean = false;
    subscription: Subscription = new Subscription();
    @Output() loader: EventEmitter<any> = new EventEmitter();    


    constructor(private _service: SamplePlanService, private _alert: AlertService, private _matDailog: MatDialog, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {

        this.subscription = this._service.samplePlanSubject.subscribe(resp => {
            if (resp.purpose == "getSamplesmultiSpec") {
                this.getSamplesWithMult = resp.result;
                var index: number = 0;
                this.getSamplesWithMult.samSpe.forEach((item) => {
                    // if (item.isSelected && index == 0) {
                    //     this.enableHeaders(true);
                    //     index = 1;
                    // }
                    if (this.getSampleSpec(item.sampleID).length == 1)
                        item.isSelected = item.canDisable = true;
                })

                this.getSamplesWithMult.sam.forEach(x => {
                    x.count = this.getSampleSpec(x.sampleID).length
                    if (CommonMethods.hasValue(x.hasSpec))
                        this.enableHeaders(false);
                });
            }
            else if (resp.purpose == "manageSamplesSpec") {
                // this.btnDisabled = false;
                this.loader.emit(false);
                if (resp.result.returnFlag == "SUCCESS") {
                    this._alert.success(SamplePlanMessages.saveSamplesSpec);
                    this.appBO = resp.result;
                    this.enableHeaders(false);
                    localStorage.setItem(SamplePlanLocalKeys.Samples_SampleTestKey, 'true');
                    localStorage.setItem(SamplePlanLocalKeys.Anal_PlanningKey, 'true');
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
        })

        this._service.getSamplesmultiSpec(this.encSamplePlanID);
    }

    enableHeaders(val: boolean) {
        this.btnSaveType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
    }

    saveSpecifications() {

        if (this.btnSaveType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        var retval = this.validateControls();
        if (CommonMethods.hasValue(retval))
            return this._alert.warning(retval);

        // this.btnDisabled = true;

        var obj: SaveSampleSpecModel = new SaveSampleSpecModel();
        obj.encPlanID = this.encSamplePlanID;
        obj.list = new SpecDetailsList();

        this.getSamplesWithMult.samSpe.filter(x => x.isSelected == true).forEach(item => {
            var single: SpecDetails = new SpecDetails();
            single.sampleID = item.sampleID;
            single.specificationID = item.specificationID;
            obj.list.push(single);
        });

        obj.initTime = this.appBO.initTime;
        this.loader.emit(true);
        this._service.manageSamplesSpec(obj);
    }

    validateControls() {

        var selectedLength: number = 0;

        for (let index = 0; index < this.getSamplesWithMult.sam.filter(x => x.sampleMode != 'S').length; index++) {
            selectedLength = this.getSamplesWithMult.samSpe.filter((item) => item.sampleID == this.getSamplesWithMult.sam.filter(x => x.sampleMode != 'S')[index].sampleID && item.isSelected == true).length;
            if (selectedLength < 1 || selectedLength > 1)
                break;
        }

        if (selectedLength > 1)
            return SamplePlanMessages.samSpecOnly;
        if (selectedLength < 1)
            return SamplePlanMessages.selectAtSpec;
        else if (this.getSamplesWithMult.samSpe.filter(x => x.isSelected == true).length < 1)
            return SamplePlanMessages.specifiAtOne;

    }

    changeSampSpec(evt: any, specID: number, sampleID: number) {
        if (evt.checked) {
            // if (this.ifSpecAlreadyExists(sampleID) < 1)
            this.getSamplesWithMult.samSpe.filter(item => item.specificationID == specID && item.sampleID == sampleID).forEach((x) => { x.isSelected = true; })
            // else {
            //     this._alert.warning(SamplePlanMessages.samSpecOnly);
            //     this.getSamplesWithMult.samSpe.filter(item => item.specificationID == specID && item.sampleID == sampleID).forEach((x) => { x.isSelected = false; })
            //     // evt.preventDefault();
            // }
        }
        else
            this.getSamplesWithMult.samSpe.filter(item => item.specificationID == specID && item.sampleID == sampleID).forEach((x) => { x.isSelected = false; })
    }

    ifSpecAlreadyExists(sampleID: number) {
        return this.getSamplesWithMult.samSpe.filter(x => x.sampleID == sampleID && x.isSelected == true).length;
    }

    getSampleSpec(sampleID: number) {
        return this.getSamplesWithMult.samSpe.filter(x => x.sampleID == sampleID);
    }

    getSampleDetails(sampleID: number) {
        var obj: GetSampleDetailsModel = new GetSampleDetailsModel();
        obj = this.getSamplesWithMult.sam.filter(x => x.sampleID == sampleID)[0];

        const modal = this._matDailog.open(ViewSampleDetailsComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.obj = obj;
        modal.afterClosed();
    }

    isSelectedSpec(specID: number, sampleID: number) {
        return this.getSamplesWithMult.samSpe.filter(x => x.sampleID == sampleID && x.specificationID == specID)[0].isSelected;
    }

    getSamplesOrder(obj) {
        if (CommonMethods.hasValue(obj)) {
            const data = obj.slice();
            var result = data.sort((a, b) => {
                return (a.count > b.count ? -1 : 1);
            })
            return result.filter(x => x.sampleMode != 'S');
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}