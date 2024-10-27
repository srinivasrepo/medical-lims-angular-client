import { Directive, ElementRef, HostListener, Input } from "@angular/core";

@Directive({ selector: '[mousehoverout]' })

export class MouseHoverOut {

    @Input() allowMouseEvt: boolean = false;

    constructor(private elm: ElementRef) { }

    @HostListener('click', ['$event']) onMouseEnter(event) {

        if (this.allowMouseEvt) {
            document.querySelectorAll('#ChildGrid').forEach((item, index) => {
                if (item['style']['display'] == 'block') {
                    item['style'] = 'display :none;';
                    document.querySelectorAll('#ParentGrid')[index]['style'] = 'border-bottom: 1px solid #ddd';
                }
            });

            this.elm.nativeElement.nextElementSibling.style = "display :block; background-color: rgba(0, 0, 0,0.01);";
            this.elm.nativeElement.style = "border:none;background-color: rgba(0, 0, 0,0.01);";
        }
    }

    @HostListener('mouseleave') onMouseLeave(event: Event) {
        // this.elm.nativeElement.nextElementSibling.style = "display :none"
        // this.elm.nativeElement.style = "border-bottom: 1px solid #ddd";
    }
}
