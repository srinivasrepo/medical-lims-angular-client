import { NgModule } from "@angular/core";
import { AuditService } from '../services/audit.service';
import { SearchAuditComponent } from './searchAuditTrail.component';
import { CommonModule } from '@angular/common';
import { AuditTrailRoutingModule } from './auditTrailRouting.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../../app.material.module';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ViewAuditTrailComponent } from './viewAuditTrail.component';
import { ManageTablesComponent } from './manageTables.component';
import { LimsHelpersModule } from '../../limsHelpers/component/limsHelpers.module';

@NgModule({
    declarations: [
        SearchAuditComponent,
        ViewAuditTrailComponent,
        ManageTablesComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        LimsHelpersModule,
        AppMaterialModule,
        AuditTrailRoutingModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        ReactiveFormsModule
    ],
    entryComponents: [ViewAuditTrailComponent],

    providers: [AuditService]
})

export class AuditTrailModule { }