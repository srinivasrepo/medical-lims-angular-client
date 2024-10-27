import { Component, Input } from '@angular/core'
import { Subscription } from 'rxjs'
import { OosService } from '../services/oos.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { EntityCodes, ActionMessages, ButtonActions } from 'src/app/common/services/utilities/constants';
import { ActivatedRoute } from '@angular/router';
import { ManageOOSProcess } from '../model/oosModel';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { OosMessages } from '../messages/oosMessages';

@Component({
    selector: 'oos-catB',
    templateUrl: '../html/oosCATB.html'
})

export class OosCATBComponent {

    @Input('encOosTestDetID') encOosTestDetID: string;
    @Input('appBo') appBo: AppBO = new AppBO();
    @Input() encOosTestID: string;
    @Input() pageType: string;
    isLoaderStart : boolean;
    btnType: String = ButtonActions.btnSave;
    mngOosCatB: ManageOOSProcess = new ManageOOSProcess();
    @Input() phaseTitle: string;
    subscription: Subscription = new Subscription();

    constructor(private _service: OosService, private _alert: AlertService,private actRoute: ActivatedRoute, public _global: GlobalButtonIconsService) { }
    ngAfterContentInit() {

        this.subscription = this._service.oosSubject.subscribe(resp => {
            if (resp.purpose == "oosProcessItem") {
                this.isLoaderStart = false;
                if (resp.result == "OK") {
                    this._alert.success(OosMessages.oosSuccess);
                    this.enableHeaders(false);
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if(resp.purpose == "OOSGetSingleAndCatBDetails"){
                this.mngOosCatB = resp.result;
                this.mngOosCatB.justificationToSkip = this.mngOosCatB.justificationToSkip;
                this.mngOosCatB.correctError = this.mngOosCatB.correctError;
                if(resp.result.phaseCompleted)
                    this.pageType = 'VIEW';
                this.mngOosCatB.correctiveAction = this.mngOosCatB.correctiveAction;
            }
        });
    }

    enableHeaders(val) {
        this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
    }

    save(){
        if (this.btnType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        var error: string = this.valdation();

        if (CommonMethods.hasValue(error))
            return this._alert.warning(error);

        var obj: ManageOOSProcess = new ManageOOSProcess();
        obj.justificationToSkip = this.mngOosCatB.justificationToSkip;
        obj.correctError = this.mngOosCatB.correctError;
        obj.correctiveAction = this.mngOosCatB.correctiveAction;
        obj.encOOSTestDetailID = this.encOosTestDetID;
        obj.encOOSTestID = this.encOosTestID;
        obj.status = 'a';
        obj.count = 0;
        this.isLoaderStart = true;
        this._service.oosProcessItem(obj);
    }

    valdation() {
        if (!CommonMethods.hasValue(this.mngOosCatB.justificationToSkip))
            return OosMessages.justificationToSkip;        
        if (!CommonMethods.hasValue(this.mngOosCatB.correctError))
            return OosMessages.correctError;
        if(!CommonMethods.hasValue(this.mngOosCatB.correctiveAction))  
            return OosMessages.correctiveAction;  
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}