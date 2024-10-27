import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ConfirmDialog } from './confirmdialog';
import { ButtonActions } from 'src/app/common/services/utilities/constants';

@Injectable()

export class ConfirmationService {
    
    constructor(public dialog: MatDialog) { }

    confirm(message: string, title: string = "Confirmation", btnOkText: string = ButtonActions.btnOk,
        btnCancelText: string = ButtonActions.btnCancel,
        dialogSize: 'sm' | 'lg' = 'sm', entitySourceCode : string = "",) {
        const modalRef = this.dialog.open(ConfirmDialog,{width:"600px"});
        modalRef.disableClose = true;
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
        modalRef.componentInstance.btnOkText = btnOkText;
        modalRef.componentInstance.btnCancelText = btnCancelText;
        modalRef.componentInstance.entitySourceCode = entitySourceCode;
        return modalRef.afterClosed();

        // .subscribe(result => {
        //     console.log(`Dialog result: ${result}`);
        // });
    }
}
