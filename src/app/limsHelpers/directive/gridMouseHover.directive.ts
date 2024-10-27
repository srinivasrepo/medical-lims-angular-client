import { Directive, ElementRef, HostListener, Input, Renderer, OnChanges } from "@angular/core";
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';

@Directive({
    selector: '[grid_mouse_hover]'
})
export class GridMouseHoverDirective implements OnChanges {

    documentID: any;    // ParentID
    childIDF1: any;       // ChildID
    childIDF2: any;

    @Input() testType: string;
    @Input() checkBoxID: number;
    @Input() formulaResultFlag: string;

    isFinalFormulaList: Array<DirectiveBO> = new Array<DirectiveBO>();

    constructor(private elementRef: ElementRef) { }

    private checkIfExists() {
        return this.isFinalFormulaList.findIndex(x => x.id == this.checkBoxID) > -1;
    }

    private getObjectDetails() {
        return this.isFinalFormulaList.filter(x => x.id == this.checkBoxID);
    }

    private showFormula(formula: string, id: number) {

        if (document.getElementById(formula + '-' + id)) {
            document.getElementById(formula + '-' + id).style.display = "block";
            document.getElementById(formula + '-' + id).style.color = "green";
        }
    }

    private hideFormula(formula: string, id: number) {

        // if (this.checkIfExists()) {
        //     var index = this.isFinalFormulaList.findIndex(x => x.id == this.checkBoxID);
        //     if (index > -1)
        //         this.isFinalFormulaList.splice(index, 1);
        // }

        if (!formula) {

            if (document.getElementById('F1-' + id))
                document.getElementById('F1-' + id).style.display = "none";

            if (document.getElementById('F2-' + id))
                document.getElementById('F2-' + id).style.display = "none";
        }
        else {
            if (document.getElementById(formula + '-' + id)) {
                document.getElementById(formula + '-' + id).style.display = "none";
                document.getElementById(formula + '-' + id).style.color = "#0f4a8e";
            }
        }
    }


    ngOnInit() {


        if (CommonMethods.hasValue(this.formulaResultFlag)) {
            var obj: DirectiveBO = new DirectiveBO();
            obj.id = this.checkBoxID;
            obj.formula = this.formulaResultFlag;
            this.isFinalFormulaList.push(obj);

            // DISPLAY F1 , F2 FORMULA'S

            setTimeout(() => {
                this.isFinalFormulaList.forEach((item) => {
                    if (document.getElementById(item.formula + '-' + item.id)) {
                        document.getElementById(item.formula + '-' + item.id).style.display = "block";
                        document.getElementById(item.formula + '-' + item.id).style.color = "green";
                    }
                })

            }, 1000);


        }

        //console.log(this.formulaResultFlag);

        // if (this.formulaResultFlag) {

        //     if (!this.checkIfExists())
        //         this.isFinalFormulaList.push({ id: this.checkBoxID, formula: this.formulaResultFlag });

        //     setTimeout(() => {
        //         this.isFinalFormulaList.forEach((item) => {
        //             document.getElementById(item.formula + '-' + item.id).style.display = "block";
        //             document.getElementById(item.formula + '-' + item.id).style.color = "green";
        //         })

        //     }, 1000);

        // }
        // else
        //     this.hideFormula(this.formulaResultFlag, this.checkBoxID);

    }

    ngOnChanges() {

        //console.log(this.formulaResultFlag);

        var obj = this.isFinalFormulaList.filter(x => x.id == this.checkBoxID);

        if (obj.length > 0 && !CommonMethods.hasValue(this.formulaResultFlag)) { // REMOVED FROM LIST && HIDE FORMULA

            this.hideFormula(obj[0].formula, obj[0].id);

            var index = this.isFinalFormulaList.findIndex(x => x.id == this.checkBoxID);

            if (index > -1)
                this.isFinalFormulaList.splice(index, 1);

        }
        else if (obj.length > 0 && CommonMethods.hasValue(this.formulaResultFlag)) { // UPDATE FORMULA IN LIST 

            //console.log(obj[0].formula, this.formulaResultFlag);

            this.hideFormula(obj[0].formula, obj[0].id);

            obj[0].formula = this.formulaResultFlag;

            // console.log(obj[0].formula, this.formulaResultFlag);

            setTimeout(() => {
                this.showFormula(obj[0].formula, obj[0].id);
            }, 100);

        }


        if (obj.length == 0 && CommonMethods.hasValue(this.formulaResultFlag)) { // UPDATE FORMULA IN LIST 

            var item: DirectiveBO = new DirectiveBO();
            item.id = this.checkBoxID;
            item.formula = this.formulaResultFlag;
            this.isFinalFormulaList.push(item);
            this.showFormula(this.formulaResultFlag, this.checkBoxID);
        }


        // var obj = this.isFinalFormulaList.filter(x => x.id == this.checkBoxID);

        // if (obj.length < 1 && this.formulaResultFlag) {
        //     this.isFinalFormulaList.push({ id: this.checkBoxID, formula: this.formulaResultFlag });
        //     obj = this.isFinalFormulaList.filter(x => x.id == this.checkBoxID);

        //     setTimeout(() => {
        //         this.showFormula(obj[0].formula, obj[0].id);
        //     }, 1000);

        // }
        // else if (obj.length > 0) {
        //     if (obj[0].formula != this.formulaResultFlag) {

        //         this.hideFormula(obj[0].formula, obj[0].id);
        //         obj[0].formula = this.formulaResultFlag;

        //         if (this.formulaResultFlag)
        //             this.showFormula(obj[0].formula, obj[0].id);

        //     }

        // }
    }


    showCheckIcon() {

        this.childIDF1 = 'F1' + '-' + this.checkBoxID;

        if (document.getElementById(this.childIDF1))
            document.getElementById(this.childIDF1).style.display = "block";

        if (this.testType == 'R') {
            this.childIDF2 = 'F2' + '-' + this.checkBoxID;
            if (document.getElementById(this.childIDF2))
                document.getElementById(this.childIDF2).style.display = "block";
        }

        // this.documentID = this.elementRef.nativeElement['id'];

        // if (this.documentID) {

        // var splitIDs = this.documentID.split('-');



        // this.childIDF1 = 'F1' + '-' + this.checkBoxID;

        // document.getElementById(this.childIDF1).style.display = "block";

        // if (this.testType != 'R') {
        //     this.childIDF2 = 'F2' + '-' + this.checkBoxID;
        //     document.getElementById(this.childIDF2).style.display = "block";
        // }
        // else
        //     document.getElementById(this.childIDF1).style.right = "0px";


        // }

    }

    @HostListener('mouseenter') onMouseEnter() {
        this.showCheckIcon();
    }

    @HostListener('mouseleave') onMouseLeave() {

        if (!this.checkIfExists())
            this.hideFormula('', this.checkBoxID);
        else {
            var obj = this.getObjectDetails();
            obj.forEach((item) => {
                if (item.formula == "F1")
                    this.hideFormula('F2', this.checkBoxID);
                else if (item.formula == "F2")
                    this.hideFormula('F1', this.checkBoxID);
            })
        }


        // document.getElementById(this.childIDF1).style.display = "none";

        // this.documentID = "";
        // this.childIDF1 = "";

        // if (this.testType != 'R') {
        //     document.getElementById(this.childIDF2).style.display = "none";
        //     this.childIDF2 = "";
        // }





        // var index = this.isFinalFormulaList.findIndex(x => x.id == this.checkBoxID);

        // if (index > -1) {
        //     var item = this.isFinalFormulaList.filter(x => x.id == this.checkBoxID)[0];

        //     if (CommonMethods.hasValue(item.formula))
        //         document.getElementById(item.formula + '-' + item.id).style.display = "block";

        //     if (item.formula == 'F1')
        //         document.getElementById('F2-' + item.id).style.display = "none";
        //     else if (item.formula == 'F2')
        //         document.getElementById('F1-' + item.id).style.display = "none";
        // }
        // else {
        //     document.getElementById(this.childIDF1).style.display = "none";
        //     this.documentID = "";
        //     this.childIDF1 = "";

        //     if (this.testType != 'R') {
        //         document.getElementById(this.childIDF2).style.display = "none";
        //         this.childIDF2 = "";
        //     }
        // }


    }

    // @HostListener('click') onClick(evt) {
    //     console.log('evt', this.checkBoxID, this.formulaResultFlag);

    //     if (this.checkIfExists()) {
    //         this.getObjectDetails().forEach((item) => {
    //             item.action = true;
    //         });

    //     }

    // }

}

export class DirectiveBO {
    id: number;
    formula: string;
    action: boolean;
}