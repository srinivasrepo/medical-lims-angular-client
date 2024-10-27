import { NgModule } from "@angular/core";
import { DatePipeComponent } from './datePicker.pipe';
import { CommonModule } from '@angular/common';
import { OrderByPipe } from './sorting.pipe';

@NgModule({
    declarations: [DatePipeComponent, OrderByPipe],
    imports: [CommonModule],
    exports: [DatePipeComponent, OrderByPipe]
})
export class MainPipeModule { }