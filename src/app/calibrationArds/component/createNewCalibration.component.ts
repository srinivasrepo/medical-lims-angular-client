import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CalibrationArdsService } from '../services/calibrationArds.service';
import { MatDialogRef } from '@angular/material';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, ActionMessages } from 'src/app/common/services/utilities/constants';
import { AlertService } from 'src/app/common/services/alert.service';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { EQUPMAINInsertNewRequest } from '../modal/calibrationArdsModal';
import { CalibrationArdsMessages } from '../messages/calibrationArdsMessages';
import { Router } from '@angular/router';

@Component({
    selector: 'app-new-calib',
    templateUrl: '../html/createNewCalibration.html'
})

export class CreateNewCalibrationComponent {

    pageTitle: string = PageTitle.createNewCalib;

    scheduleInfo: LookupInfo;
    @ViewChild('schedule', { static: true }) schedule: LookupComponent;
    equipmentInfo: LookupInfo;
    @ViewChild('equipment', { static: true }) equipment: LookupComponent;
    equipmentCondition: string = "1=2";
    schduleDate: Date = new Date();
    isLoaderStart : boolean;

    newEqupObj: EQUPMAINInsertNewRequest = new EQUPMAINInsertNewRequest();

    subscription: Subscription = new Subscription();

    constructor(private _calibService: CalibrationArdsService, private dialog: MatDialogRef<CreateNewCalibrationComponent>,
        private _alert: AlertService, public _global: GlobalButtonIconsService, private route: Router) { }

    ngAfterContentInit() {
        this.subscription = this._calibService.calibrationArdsSubject.subscribe(resp => {
            if (resp.purpose == "generateNewRequest") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == "SUCCESS") {
                    this._alert.success(CalibrationArdsMessages.equipSuccess);
                    this.route.navigateByUrl("/lims/calibArds/manage?id=" + resp.result.encTranKey);
                    this.closeModel();
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
        })

        this.prepareLkp();
    }

    prepareLkp() {
        var scheduleCondition = "ScheduleCode IN ('DLCABSCH', 'PERCABSCH') AND DeptCode = 'QC'";
        this.scheduleInfo = CommonMethods.PrepareLookupInfo(LKPTitles.maintenanceSchedule, LookupCodes.getMaintenanceSchedule, LKPDisplayNames.scheduleType,
            LKPDisplayNames.scheduleNumber, LookUpDisplayField.code, LKPPlaceholders.maintenanceSchedule, scheduleCondition);
        this.prepareEquipmentLkp();
    }

    prepareEquipmentLkp() {
        this.equipmentInfo = CommonMethods.PrepareLookupInfo(LKPTitles.eqpOrInstID, LookupCodes.getMaintenanceEquipments, LKPDisplayNames.analysisOccuName,
            LKPDisplayNames.analysisOccuCode, LookUpDisplayField.code, LKPPlaceholders.maintenanceequipment, this.equipmentCondition);
    }

    selectedSchdule(evt) {
        if (CommonMethods.hasValue(evt.val.id))
            this.equipmentCondition = "DeptCode ='QC' AND SCHEDULE_ID = '" + this.schedule.selectedId + "'";

        if (CommonMethods.hasValue(this.equipment.selectedId))
            this.equipment.clear();
        this.prepareEquipmentLkp();
    }

    save() {
        var errMsg: string = this.validation();
        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg);

        this.newEqupObj.eqpMaintID = this.equipment.selectedId;
        this.newEqupObj.scheduleDate = dateParserFormatter.FormatDate(this.schduleDate, "date");
        this.isLoaderStart = true;
        this._calibService.generateNewRequest(this.newEqupObj);
    }

    validation() {
        if (!CommonMethods.hasValue(this.schedule.selectedId))
            return CalibrationArdsMessages.schedule;
        else if (!CommonMethods.hasValue(this.equipment.selectedId))
            return CalibrationArdsMessages.equipment;
        else if (!CommonMethods.hasValue(this.schduleDate))
            return CalibrationArdsMessages.scheduelDate;
    }

    closeModel() {
        this.dialog.close();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}