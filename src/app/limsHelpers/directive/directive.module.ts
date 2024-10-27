import { NgModule } from "@angular/core";
import { ButtonAddNewFieldDirective } from './buttonAddNewField.directive';
import { ButtonLoaderDirective } from './buttonloader.directive';
import { Rs232IntegrationDirective } from './rs232Integration.directive';

@NgModule({
    declarations: [
        ButtonLoaderDirective,
        Rs232IntegrationDirective,
        ButtonAddNewFieldDirective
    ],
    imports: [

    ],
    exports: [
        ButtonLoaderDirective,
        Rs232IntegrationDirective,
        ButtonAddNewFieldDirective
    ]
})
export class DirectiveModule { }