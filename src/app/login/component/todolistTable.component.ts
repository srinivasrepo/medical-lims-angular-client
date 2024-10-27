import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'todo-tabel',
    templateUrl: '../html/todolistTable.html'
})

export class TodoListTabelComponent {

    displayedColumns: string[] = ['S.No', 'reqNumber', 'status', 'process'];
    @Input('dataSource') dataSource: any;
    @Output('actionClick') actionClick: EventEmitter<any> = new EventEmitter();
    cols: Array<string> = [ 'requestCode', 'planID', 'referenceNumber', 'status', 'conditionID', 'entActID', 'entityCode', 'entityType', 'id', 'navigationPath', 'encID', 'userTestID', 'statusCode', 'testTitle', 'remarks', 'encUserTestID', 'statusID', 'sourceCode', 'conditionCode', 'class', 'showExtRows', 'invalidationCodes', 'isTestCompleted', 'oosNumber']
    clsCols: Array<string> = ['product Name / Material Name', 'test Name / Parameter Name', 'chemical Name', 'name of the Solution', 'solution Name', 'parameter Name', 'test Name', 'stp Title', 'title', 'parameter Set Title', 'materialName']
    showExtRows: boolean = false;
    constructor() { }

    ngAfterContentInit() {

    }

    show(key, extValidation) {
        // if ( (key == 'general Indent Number' && extValidation != 'MATREQ'))
        //     return true;
        return this.cols.includes(key)
    }

    getClass(key) {
        if (this.clsCols.includes(key))
            return 'w-100';
    }

    getKey(key, extParam) {
        if (key == 'entityRefNumber')
            return 'System Code';
        else if (key == 'materialName')
            return 'Product Name / Material Name';
        else if (key == 'activityDesc')
            return 'Activity Description';
        else if (key == 'product Name / Material Name' && extParam == 'INVA_STD')
            return 'Solution Name';
        else if (key == 'activity')
            return 'Activity Type';
        else if (key == 'arNumber')
            return 'Reference Number';
        else return key;
    }

    getValue(key, extParam, value){
        if ( (key == 'general Indent Number' && extParam != 'MATREQ'))
            return 'N /A';
        else return value;
    }

    onRowSelected(row) {
        var val = !row.showExtRows
        this.dataSource.forEach(x => { x.class = 'todo-row'; x.showExtRows = false });
        row.showExtRows = val;
        row.class = row.showExtRows ? "todo-row-active" : "todo-row";

    }

    onActionClicked(evt) {
        this.actionClick.emit(evt);
    }
}