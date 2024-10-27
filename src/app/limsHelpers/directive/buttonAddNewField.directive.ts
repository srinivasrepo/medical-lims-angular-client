import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, EventEmitter, Inject, Input, Output, Renderer2 } from "@angular/core";
import { MatDialog } from '@angular/material';
import { AddOtherFieldComponent } from 'src/app/common/component/addOtherField.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ManageAddFieldComponent } from '../component/manageAddField.component';
import { ManageRS232IntegrationFieldsBO } from '../entity/limsGrid';

@Directive({
    selector: '[btnAddNewField]',
    host: {
        '(click)': 'addNewField()'
    }
})
export class ButtonAddNewFieldDirective implements AfterViewInit {

    @Input() isDisabled: boolean = false;
    @Input() obj: ManageRS232IntegrationFieldsBO = new ManageRS232IntegrationFieldsBO();
    @Input() mngCustFields: ManageAddFieldComponent;
    @Output() emitValues: EventEmitter<any> = new EventEmitter();


    constructor(private _matDailog: MatDialog, @Inject(DOCUMENT) private document,
        private _el: ElementRef, private rander: Renderer2, private _global: GlobalButtonIconsService) { }


    ngAfterViewInit() {

        // var node = document.createElement('i');
        // node.setAttribute('class', this._global.icnAddField);
        // node.setAttribute('aria-hidden', 'true');
        // node.setAttribute('matTooltip', "Add Custom Field");
        // this.rander.appendChild(this._el.nativeElement, node);

        // node = document.createElement('span');
        // // var textNode = document.createTextNode(' Add Custome Field');
        // // node.appendChild(textNode);
        // this.rander.appendChild(this._el.nativeElement, node);
    }

    addNewField() {
        
        if (this.isDisabled)
            return;

        const modal = this._matDailog.open(AddOtherFieldComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.obj = this.obj;
        modal.afterClosed().subscribe(resp => {
            if (resp == 'YES')
                this.emitValues.emit();
            // this.mngCustFields.getRS232IntegrationOther();

        })

    }

}