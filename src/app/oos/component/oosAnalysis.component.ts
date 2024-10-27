import { Component, AfterContentInit, OnDestroy, Input, Output, EventEmitter } from "@angular/core";
import { Subscription } from 'rxjs';
import { OosService } from '../services/oos.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AppBO } from 'src/app/common/services/utilities/commonModels';

@Component({
    selector: 'oos-analysis',
    templateUrl: '../html/oosAnalysis.html'
})
export class OosAnalysisComponent implements AfterContentInit, OnDestroy {

    @Input() encOosTestID: string;
    phaseList: Array<any> = [];
    encOosTestDetID: string;
    phaseType: string;
    appBo: AppBO = new AppBO();
    subscription: Subscription = new Subscription();
    @Input() pageType: string = 'MNG';
    phaseTitle: string;

    // encArdsExecID: string = "";
    @Output() emitArdsExecID: EventEmitter<any> = new EventEmitter();


    constructor(private _service: OosService, private _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {

        this.subscription = this._service.oosSubject.subscribe(resp => {
            if (resp.purpose == "getTestInfo") {
                this.phaseList = resp.result.phaseList;
                this.appBo = resp.result.act;
                this.appBo.referenceNumber = this.appBo.referenceNumber ? this.appBo.referenceNumber : resp.result.oosNumber;
            }
        })

    }

    getComponent(phase: any) {
        this.encOosTestDetID = null;
        setTimeout(() => {
            this.encOosTestDetID = phase.encOOSTestDetID;
            this.phaseType = phase.phaseType;
            this.phaseTitle = phase.phaseTitle;
            if (this.phaseType == 'CL')
                this._service.oosGetPhase1CheckList(this.encOosTestDetID);
            else if (this.phaseType == 'HYPTST' || this.phaseType == 'EXTLAB') {
                var obj: any = { encOOSTestID: this.encOosTestID, encOOSTestDetailID: this.encOosTestDetID };
                this._service.oosGetHypoTestingInfo(obj);
            }
            else if (this.phaseType == 'SA' || this.phaseType == 'DA' || this.phaseType == 'NS' || this.phaseType == 'NS2' || this.phaseType == 'NS3' || this.phaseType == 'NS4' || this.phaseType == 'TA' || this.phaseType == 'FA') {
                var obj: any = { encOOSTestID: this.encOosTestID, encOOSTestDetailID: this.encOosTestDetID };
                this._service.oosTestingOfNewPortionOfSameSampleResult(obj);
            }
            else if (this.phaseType == 'REV')
                this._service.getDeptReviewDetails(this.encOosTestDetID);
            else if (this.phaseType == 'CATB_COMMENT' || this.phaseType == 'COMMENT' || this.phaseType == 'OOSP2')
                this._service.oosGetSingleAndCatBDetails(this.encOosTestDetID);
            else if (this.phaseType == 'MFGCL')
                this._service.manufactureInvestigationDetails(this.encOosTestDetID);
        }, 100);
    }

    getArdsExec(evt) {
        // this.encArdsExecID = evt;
        this.emitArdsExecID.emit(evt);
    }


    getIcons(type: string) {
        if (type == 'ADD')
            return this._global.icnAdd;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }


}