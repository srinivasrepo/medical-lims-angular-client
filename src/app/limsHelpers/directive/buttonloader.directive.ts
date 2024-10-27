import { Directive, ElementRef, Input, OnChanges, Renderer2 } from "@angular/core";
@Directive({
    selector: '[btnLoader]'
})

export class ButtonLoaderDirective implements OnChanges {

    @Input() isLoaderOn: boolean = false;
    private _id: string;

    constructor(private _el: ElementRef, private _rander: Renderer2) {
        this.isLoaderIDGiven();
        this._updateDocID();
    }

    ngOnChanges() {
        this._updateDocID();
        if (!this.isLoaderOn) {
            if (document.getElementById(this._id)) {
                document.getElementById(this._id).removeAttribute('disabled');
                if (document.getElementById("loader-07"))
                    document.getElementById("loader-07").remove();
                this._updateButtonDisabled();
            }
        }
        else {
            if (document.getElementById(this._id))
                document.getElementById(this._id).setAttribute('disabled', 'true');
            var child = document.createElement("div");
            child.setAttribute("id", "loader-07");
            child.setAttribute("class", "loader-07");

            if (this._id == 'lkpbtnLoaders')
                child.setAttribute("style", "left: auto");

            this._rander.appendChild(this._el.nativeElement, child);
            this._updateButtonDisabled();
        }
    }

    _updateButtonDisabled() {
        var html: any;

        if (document.getElementById(this._id)) {
            html = document.getElementById(this._id).querySelectorAll('button');
            html.forEach((item, idx) => {
                item['disabled'] = this.isLoaderOn;
            })
        }
    }

    _updateDocID() {
        this._id = this._el.nativeElement.id;
    }

    isLoaderIDGiven() {
        if (!this._el.nativeElement.id)
            console.error('Please give button loader id');
        else
            this._id = this._el.nativeElement.id;
    }

}