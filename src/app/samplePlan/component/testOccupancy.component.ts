import { Component } from "@angular/core";
import { Subscription } from "rxjs";
import { SamplePlanService } from "../service/samplePlan.service";
import {
  AnalystsOccupancyModelList,
  testOccupancyBO,
} from "../model/samplePlanModel";
import { MatDialogRef } from "@angular/material";
import {
  CommonMethods,
  dateParserFormatter,
} from "src/app/common/services/utilities/commonmethods";
import { GlobalButtonIconsService } from "src/app/common/services/globalButtonIcons.service";
import { AlertService } from "src/app/common/services/alert.service";
import { SamplePlanMessages } from "../messages/samplePlanMessages";
import {
  ActionMessages,
  LimsRespMessages,
} from "src/app/common/services/utilities/constants";
import { ConfirmationService } from "src/app/limsHelpers/component/confirmationService";
import { SampleAnalysisMessages } from "src/app/sampleAnalysis/messages/sampleAnalysisMessages";

@Component({
  selector: "analyst-occ",
  templateUrl: "../html/testOccupancy.html",
})
export class TestOccupancyDetailsComponent {
  occuDetails: testOccupancyBO = new testOccupancyBO();

  subscription: Subscription = new Subscription();
  testList: any;

  constructor(
    private _service: SamplePlanService,
    private _alert: AlertService,
    private _matDailogRef: MatDialogRef<TestOccupancyDetailsComponent>,
    public _global: GlobalButtonIconsService,
    private _confirmSer: ConfirmationService
  ) {}

  ngAfterViewInit() {
    this.subscription = this._service.samplePlanSubject.subscribe((resp) => {
      if (resp.purpose == "testOccupancy") {
        if (resp.result.returnFlag == "SUCCESS")
          this._alert.success(SamplePlanMessages.testOccSucc);
        this.testList = resp.result.testList;
        this.testList.forEach((x) => (x.isDisabled = x.isAssigned));
      }
    });

    this._service.testOccupancy(this.occuDetails);
  }

  allowNumbers(evt) {
    return CommonMethods.allowNumber(evt, "");
  }

  saveValue(obj1, indexj: number, indexi: number) {
    if (CommonMethods.hasValue(obj1.occMinutes) || obj1.occMinutes == "0") {
      if (CommonMethods.hasValue(obj1.occMinutes == 0))
        return this._alert.warning(SamplePlanMessages.numericValues);

      if (CommonMethods.hasValue(obj1.prevOccMinutes)) obj1.isDisabled = true;
      
      if (obj1.occMinutes.trim() != obj1.prevOccMinutes) {
        var obj: testOccupancyBO = new testOccupancyBO();
        obj.testID = obj1.testID;
        obj.occMinutes = obj1.occMinutes;

        this._service.testOccupancy(obj);
      }
      // else
      //   obj1.isDisabled = true;
    }
  }

  edit(data, index) {
    this._confirmSer
      .confirm(LimsRespMessages.changeResult)
      .subscribe((resp) => {
        if (resp) {
          data.isDisabled = false;
          var input = window.document.getElementById(index);
          setTimeout(() => {
            input.focus();
          }, 100);
        }
      });
  }
  
  close() {
    this._matDailogRef.close();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
