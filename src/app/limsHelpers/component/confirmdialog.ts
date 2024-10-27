import { Component, Input, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'confirmDialog',
    templateUrl: '../html/confirmDialog.html'
})

export class ConfirmDialog {
    @Input() title: string;
    @Input() message: string;
    @Input() btnOkText: string;
    @Input() btnCancelText: string;
    @Input() entitySourceCode: string;
    invalidate: boolean = false;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ConfirmDialog>, public _global: GlobalButtonIconsService) {

    }

    proceed() {
        if (this.entitySourceCode == "FromSolvents")
            this.dialogRef.close({ canInvalidate: this.invalidate, result: true });
        else
            this.dialogRef.close(true);
    }
    cancel() {
        this.dialogRef.close(false);
    }
}