import { Component } from '@angular/core'
import { MatDialogRef } from '@angular/material';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { AlertService } from '../../common/services/alert.service';
import { ApprovalProcessMessages } from 'src/app/approvalProcess/messages/approvalProcessMessages';
import { GlobalButtonIconsService } from '../../common/services/globalButtonIcons.service';
import { Subscription } from 'rxjs';
import { QCCalibrationsService } from '../services/qcCalibrations.service';
import { AssignInstrc, InstrumentList } from '../models/qcCalibrationsModel';
import { QCCalibrationMessages } from '../messages/qcCalibrationMessages';
import { SingleIDBO } from 'src/app/common/services/utilities/commonModels';

@Component({
    selector: 'assgn-instr',
    templateUrl: '../html/assignInstrument.html'
})

export class AssignInstrumentComponent {

    pageTitle: string = "Assign Instrument";
    instrumentAssignedList: any;
    instrList: InstrumentList= new InstrumentList();
    instrObj: AssignInstrc = new AssignInstrc();
    subscription: Subscription = new Subscription();
    qcinstrumentsList: any;
    allChecked: boolean= false;
    selectedInstrList: Array<SingleIDBO> = new Array<SingleIDBO>();
    isLoaderStart : boolean = false;

    constructor(private _closeModel: MatDialogRef<AssignInstrumentComponent>, private _alert: AlertService,private _service: QCCalibrationsService,
        public _global:GlobalButtonIconsService, private _notify: AlertService) { }
    
    ngAfterContentInit(){

        this.subscription = this._service.qcCalibrationsSubject.subscribe(resp =>{
            if(resp.purpose == "INST_TYPES"){
                this.instrumentAssignedList = resp.result.list;
                if(this.instrumentAssignedList.length == 1){
                this.instrObj.instrumentTypeID = resp.result.list[0].id;;
                this.changeLimitType();
            }
            }

            else if(resp.purpose == "INSTRUMETNS")  
                this.qcinstrumentsList = resp.result.list;

                
             else if(resp.purpose == 'SAVE_INST'){
                this.isLoaderStart  = false;
             if (resp.result.returnFlag == "OK") {
                this._alert.success(QCCalibrationMessages.instrumentSaved);
                this.close();
                }   
            }

            
        });
        
        this.instrObj.type = "INST_TYPES";
        this._service.assignInstrumentDetails(this.instrObj);

        
       
     }  

     changeLimitType(){
      
       this.allChecked = true;
         

        this.instrObj.type = "INSTRUMETNS";
        this._service.assignInstrumentDetails(this.instrObj); 

     }
     
     manageAllInstruments(evt) {
             this.qcinstrumentsList.map((item) => {
                return item.isSelect = evt.checked;
             })
       
    }


    close() {
        this._closeModel.close({ result: false });
    }

    validate(){
        if(this.qcinstrumentsList.filter(x =>  x.isSelect).length == 0)
            return QCCalibrationMessages.selectInstrument;
    }
   
    save() {
        var errmsg : any = this.validate();
        if (CommonMethods.hasValue(errmsg))
            return this._notify.warning(errmsg);

        this.instrObj.type = "SAVE_INST";
        this.instrObj.list = [];
        this.instrObj.list = this.qcinstrumentsList.filter(x => x.isSelect).map(y => {
            var obj: SingleIDBO = new SingleIDBO();
                       obj.id = y.id;
                       return obj;                        
        });
        
        this.isLoaderStart = true;
       this._service.assignInstrumentDetails(this.instrObj);
    }

    ngOnDestroy(){
        this.subscription.unsubscribe();
    }
}