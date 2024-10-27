import { Component, Input } from '@angular/core';
import { oosOptionHandler } from '../model/oosOptionHandler';
import { Subscription } from 'rxjs';
import { OosService } from '../services/oos.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ManageOOSProcess } from '../model/oosModel';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ButtonActions, ActionMessages } from 'src/app/common/services/utilities/constants';
import { AlertService } from 'src/app/common/services/alert.service';
import { OosMessages } from '../messages/oosMessages';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'oos-sincom',
  templateUrl: '../html/oosSingleComment.html'
})

export class OosSingleCommentComponent {

  comment: string;
  @Input('encOosTestID') encOosTestID: string;
  @Input('encOosTestDetID') encOosTestDetID: string;
  @Input() pageType: string;
  hideRadio: boolean = true;
  btnType: string = ButtonActions.btnSave;
  disableFields: boolean = false;
  remarks: string;
  validity: string;
  phaseType: string;
  status: string;
  phaseCompleted : boolean;
  isLoaderStart : boolean;
  @Input() phaseTitle: string;
  manageObj: ManageOOSProcess = new ManageOOSProcess();
  actionList: any;

  subscription: Subscription = new Subscription();

  constructor(private _service: OosService, private _global: GlobalButtonIconsService,
    private _alert: AlertService) { }

  ngAfterViewInit() {
    this.subscription = this._service.oosSubject.subscribe(resp => {
      if (resp.purpose == "OOSGetSingleAndCatBDetails") {
        this.remarks = resp.result.remarks;
        this.validity = resp.result.actionValidity;
        this.phaseType = resp.result.phaseType;
        this.phaseCompleted = resp.result.phaseCompleted;
        this.status = `${resp.result.phaseStatus}`.trim() ;
        this.getActionList();
        if (CommonMethods.hasValue(this.remarks)) {
          this.disableFields = true;
          this.btnType = ButtonActions.btnUpdate;
        }
      }
      else if (resp.purpose == "oosProcessItem") {
        this.isLoaderStart = false;
        if (resp.result == "OK") {
          this.btnType = ButtonActions.btnUpdate;
          this.disableFields = true;
          this._alert.success(OosMessages.oosSuccess);
        }
        else
          this._alert.error(ActionMessages.GetMessageByCode(resp.result));
      }
    })
  }

  getActionList() {
    if (CommonMethods.hasValue(this.validity)) {
      this.actionList = oosOptionHandler.GetOptionDetails(this.validity);
      this.hideRadio = false;
    }
  }

  save() {
    if (this.btnType == ButtonActions.btnUpdate) {
      this.disableFields = false;
      return this.btnType = ButtonActions.btnSave;
    }

    var errMsg = this.validation();
    if (CommonMethods.hasValue(errMsg))
      return this._alert.warning(errMsg);

    this.manageObj.encOOSTestDetailID = this.encOosTestDetID;
    this.manageObj.encOOSTestID = this.encOosTestID;
    this.manageObj.status = CommonMethods.hasValue(this.status) ? this.status  : 'a';
    this.manageObj.validity = this.validity;
    this.manageObj.remarks = this.remarks;
    this.isLoaderStart = true;
    this._service.oosProcessItem(this.manageObj);
  }

  validation() {
    if (!CommonMethods.hasValue(this.remarks))
      return OosMessages.remarks;
    if(this.phaseType == 'OOSP2' && !CommonMethods.hasValue(this.status))
      return OosMessages.actionValidity;
    else if (!CommonMethods.hasValue(this.validity) && !this.hideRadio)
      return OosMessages.actionValidity;

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}