import { Component } from "@angular/core";
import { MatDialogRef } from '@angular/material';
import { GetSampleDetailsModel } from '../model/samplePlanModel';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'view-sampleDetails',
    templateUrl: '../html/viewSampleDetails.html'
})

export class ViewSampleDetailsComponent {

    obj: GetSampleDetailsModel = new GetSampleDetailsModel();

    constructor(private _matDailogref: MatDialogRef<ViewSampleDetailsComponent>, public _global:GlobalButtonIconsService) { }

    close() {
        this._matDailogref.close();
    }
}