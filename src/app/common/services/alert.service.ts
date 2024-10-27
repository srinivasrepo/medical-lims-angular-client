import { Injectable } from "@angular/core";
import { NotifierService } from 'angular-notifier';

@Injectable()

export class AlertService {

    constructor(private _notify: NotifierService) { }

    prevMsg: string = "";

    success(str: string) {
        this.setMessage('success', str);
    }

    warning(str: string) {
        this.setMessage('warning', str);
    }

    error(str: string) {
        this.setMessage('error', str);
    }
    info(str: string) {
        this.setMessage('info', str);
    }

    setMessage(type: string, str:string){
        if (this.prevMsg != str) {
            this._notify.notify(type, str);
            this.prevMsg = str
            setTimeout(() => { this.prevMsg = '' }, 5000);
        }
    }

}