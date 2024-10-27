import { DOCUMENT } from '@angular/common';
import {
    AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, Inject, Input, OnChanges, OnDestroy, Output, Renderer2
} from "@angular/core";
import { MatDialog } from '@angular/material';
import { RS232IntegrationModeService } from 'src/app/common/services/rs232IntegrationMode.service';
import { CommonMethods, CustomLocalStorage, LOCALSTORAGE_KEYS } from 'src/app/common/services/utilities/commonmethods';
import { RS232IntergrationComponent } from '../component/rs232Integration.component';
import { RS232IntegrationModelBO } from '../entity/limsGrid';

const subjectList: Array<RS232IntegrationModelBO> = [];
var idx: number = 0;

const DISABLED = 'disabled';

/*
    INITIAL LOAD,                   -- OK
    AFTER CHANGE RS232 MODE         -- OK
    AFTER SAVE REQ                  -- OK
*/

@Directive({
    selector: '[rs232]'
})
export class Rs232IntegrationDirective implements AfterViewInit, OnChanges, OnDestroy {

    id: string;

    @Input() pageAction: string = 'MNG';
    @Input() timeOut: number = 10;
    @Input() mngObj: RS232IntegrationModelBO = new RS232IntegrationModelBO();
    @Input() condition: boolean = true;
    @Input() className: string;

    @Output() emitValue: EventEmitter<any> = new EventEmitter();
    @Output() isEnabledRs232Mode: EventEmitter<any> = new EventEmitter();

    get getRS232Mode() { return this.getRS232IntegrationMode(); }

    constructor(private _el: ElementRef, private _rs232Mode: RS232IntegrationModeService,
        @Inject(DOCUMENT) private document, private renderer: Renderer2, private _matDailog: MatDialog) { }

    ngAfterViewInit() {

        if (!this.condition) {
            return;
        }

        this.emitIsEnableRs232();

        if (this.getIdx() == -1 || subjectList.length == 0)
            this.addToSubjectList();

        setTimeout(() => {
            this.fireIfIDNotExists();
        }, this.timeOut);

    }

    emitIsEnableRs232() {
        this.isEnabledRs232Mode.emit(this.getRS232Mode);
    }

    addToSubjectList() {
        subjectList.push(this.mngObj);
    }

    ngOnChanges() {

        if (this.getIdx() == -1)
            this.addToSubjectList();

        if (CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.IS_RS232_IS_CLICKED) || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SEC_CLICK)) {

            if (!this.condition) {
                return;
            }

            setTimeout(() => {
                this.fireIfIDNotExists();
                idx = idx + 1;
            }, 500);

            if (subjectList.length == idx) {
                CustomLocalStorage.removeItem(LOCALSTORAGE_KEYS.IS_RS232_IS_CLICKED);
                CustomLocalStorage.removeItem(LOCALSTORAGE_KEYS.RS232_SEC_CLICK);
                idx = 0;
            }

            this.emitIsEnableRs232();
        }
        else
            idx = 0;
    }

    fireIfIDNotExists() {
        if (!CommonMethods.hasValue(this.mngObj.id))
            console.error('Please add id');
        else
            this.prepMatIconForClickRs232();
    }

    prepMatIconForClickRs232() {
        this.removeRS232IntegrationModeAction();
    }

    getRS232IntegrationMode() {
        if ((CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_ANALYSIS" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_CON_WISE" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_CALIB"
            || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_SPEC_VALID" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_OOS_HYPO" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_OOS_TEST")
            && (CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode) == "CALIB_ARDS" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode) == "SAMPLE_ANALYSIS" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode) == "OOS_APP"))
            return true;

        return this._rs232Mode.getRS232IntegrationValidation() ? this._rs232Mode.getRSIntegrationReqStatus() : false;
    }

    removeRS232IntegrationModeAction() {

        if (!this.getRS232Mode) {
            this.removeElement();
            this.disableElement(((this.pageAction == 'Update' || this.pageAction == 'VIEW') ? true : false), this._el.nativeElement);
        }
        else if (this.getRS232Mode) {

            this.disableElement(true, this._el.nativeElement);

            if (!this._chkIdExistsInDoc) {

                if (subjectList.filter(x => x.id == this.mngObj.id && x.isDOMAdded == true).length > 0)
                    return true;

                var node = document.createElement('mat-icon');
                var textNode = document.createTextNode('assignment_turned_in');
                node.setAttribute('id', this.mngObj.id);

                if (localStorage.getItem('conditionCode') == 'SAMPLE_ANALYSIS' || localStorage.getItem('conditionCode') == "OOS_APP")
                    node.setAttribute('class', this.className ? this.className + ' mat-icon notranslate material-icons mat-icon-no-color' : 'rs232inte_icon_change_posi_sample_analsysis  mat-icon notranslate material-icons mat-icon-no-color');
                else if (localStorage.getItem('conditionCode') == 'CALIB_ARDS')
                    node.setAttribute('class', this.className ? this.className + ' mat-icon notranslate material-icons mat-icon-no-color' : 'rs232inte_icon_change_posi_calib  mat-icon notranslate material-icons mat-icon-no-color');
                else
                    node.setAttribute('class', this.className ? this.className + ' mat-icon notranslate material-icons mat-icon-no-color' : 'rs232Inte_icon mat-icon notranslate material-icons mat-icon-no-color');

                node.appendChild(textNode);
                this.renderer.appendChild(this._el.nativeElement, node);

                subjectList.filter(x => x.id == this.mngObj.id).forEach((item) => {
                    item.isDOMAdded = true;
                })

            }

        }

    }

    private get _chkIdExistsInDoc() {
        return CommonMethods.hasValue(document.getElementById(this.mngObj.id));
    }

    disableElement(isDisable: boolean, element: any) {

        if (isDisable) {
            if (element.querySelectorAll('input') && element.querySelectorAll('input')[0] && element.querySelectorAll('input')[0])
                element.querySelectorAll('input')[0][DISABLED] = 'true';
        }
        else if (element.querySelectorAll('input')[0])
            element.querySelectorAll('input')[0].removeAttribute('disabled');

    }

    getIdx() {
        return subjectList.findIndex(x => x.id == this.mngObj.id);
    }

    removeElement() {
        if (document.getElementById(this.mngObj.id))
            document.getElementById(this.mngObj.id).remove();
    }

    @HostListener('click', ['$event']) onClick(evt) {
        evt.preventDefault();
        evt.stopPropagation();

        if (evt.srcElement.localName != 'mat-icon' || this.pageAction == 'Update')
            return;

        const modal = this._matDailog.open(RS232IntergrationComponent, CommonMethods.rs232ModalFullWidth);
        modal.componentInstance.condition = 'EQP_CAT_CODE =\'QCINST_TYPE\'';
        modal.componentInstance.entityCode = this.mngObj.sourceCode;
        modal.componentInstance.rsObj = this.mngObj;
        modal.componentInstance.btnType = this.pageAction;

        modal.afterClosed().subscribe((resp) => {
            if (resp) {
                this.mngObj.keyValue = resp.singleVal;
                this.mngObj.keyActualValue = resp.actualVal;
                this.emitValue.emit(this.mngObj);
            }
        })
    }

    ngOnDestroy() {
        subjectList.splice(this.getIdx(), 1);
        if (subjectList.length == 0)
            idx = 0;
    }

}