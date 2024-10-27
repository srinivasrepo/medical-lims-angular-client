import { Component, Input } from "@angular/core";

@Component({
    selector: 'cust-search',
    templateUrl: '../html/cust-search.html'
})
export class CustomeSearchComponent {

    @Input() pageTitle: string;


    constructor() { }
}