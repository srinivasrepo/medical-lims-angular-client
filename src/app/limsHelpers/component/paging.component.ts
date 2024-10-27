import { Component, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'lims-paging',
    templateUrl: '../html/paging.html'
})

export class PagingComponent {
    @Input() totalRecords: number = 0;
    @Output() onPageIndexClicked: EventEmitter<number> = new EventEmitter();
    @Input() indexes: Array<number> = [];
    @Input() currentSelectedIndex: number = 0;
    recordPerPage: number = environment.recordsPerPage;

    constructor() { }

    onPageIndexClick(val) {
        let index: number = 0;
        this.currentSelectedIndex = val.pageIndex;
        this.onPageIndexClicked.emit(val.pageIndex);
    }
}