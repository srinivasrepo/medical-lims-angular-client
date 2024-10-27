import { Component } from '@angular/core'
import { MatDialogRef } from '@angular/material';
import { CommonMethods } from '../services/utilities/commonmethods';
import { AlertService } from '../services/alert.service';
import { ApprovalProcessMessages } from 'src/app/approvalProcess/messages/approvalProcessMessages';
import { GlobalButtonIconsService } from '../services/globalButtonIcons.service';

@Component({
    selector: 'add-cmnt',
    templateUrl: '../html/addComment.html'
})

export class addCommentComponent {

    comment: string;
    pageTitle: string = "Comments";
    isCommentMandatory: boolean = true;
    commnetMinLength: number = 0;
    isCommentType: boolean = true;
    type: string = '';


    constructor(private _closeModel: MatDialogRef<addCommentComponent>, private _alert: AlertService,
        public _global: GlobalButtonIconsService) { }

    close() {
        this._closeModel.close({ result: false });
    }

    save() {
        if (this.isCommentType) {
            if (!CommonMethods.hasValue(this.comment) && this.isCommentMandatory)
                return this._alert.warning(ApprovalProcessMessages.commentMandatory);
            if (this.isCommentMandatory && CommonMethods.hasValue(this.commnetMinLength) && this.commnetMinLength > this.comment.length)
                return this._alert.warning("Please enter minimum " + this.commnetMinLength + " characters");
        }
        else if (!this.isCommentType && !CommonMethods.hasValue(this.comment)) {
            if (this.type == 'Uploads')
                return this._alert.warning(ApprovalProcessMessages.remarks);
            else
                return this._alert.warning(ApprovalProcessMessages.fileName);
        }


        this._closeModel.close({ val: this.comment, result: true });
    }
}