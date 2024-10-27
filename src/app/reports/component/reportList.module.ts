import { ReportsListComponent } from "./reportsList.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReportService } from "../service/report.service";
import { ReportView } from '../../common/component/reportView.component';
import { LimsHelpersModule } from '../../limsHelpers/component/limsHelpers.module';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { AppMaterialModule } from '../../app.material.module';
import { MatFormFieldModule } from '@angular/material';

@NgModule({
    declarations: [
        ReportsListComponent,
        ReportView
    ],
    imports: [
        LimsHelpersModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        AppMaterialModule,
        MatFormFieldModule
    ],
    // entryComponents: [ReportView],
    providers: [ReportService]
})

export class ReportModule { }