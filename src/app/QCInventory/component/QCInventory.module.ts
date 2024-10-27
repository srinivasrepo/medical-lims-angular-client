import { NgModule } from "@angular/core";
import { SearchQCInventoryComponent } from './searchQCInventory.component';
import { CommonModule } from '@angular/common';
import { QCInventoryRoutingModule } from './QCInventoryRouting.module';
import { QCInventoryService } from '../service/QCInventory.service';
import { LimsHelpersModule } from 'src/app/limsHelpers/component/limsHelpers.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app.material.module';
import { manageChemicalPacksComponent } from './manageChemicalPacks.component';
import { managePackDetailsComponent } from './managePackDetails.component';
import { ManageQcInventoryComponent } from './manageQCInventory.component';
import { ViewQCInventoryComponent } from './ViewQCInventory.component';
import { ManageMiscConsumptionComponent } from './manageMiscConsumption.component';
import { OpenPackComponent } from './openPack.component';
import { ViewQCInventoryHeaderDetailsComponent } from './viewQCInventoryHeaderData.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { QCInvReservationsComponent } from './qcInventoryReservations.component';
import { BatchSpitComponent } from './newbatchSplit.component';
import { OwlNativeDateTimeModule, OwlDateTimeModule } from 'ng-pick-datetime';
import { SendSampleComponent } from './sendSample.component';

@NgModule({
    declarations: [
        SearchQCInventoryComponent,
        manageChemicalPacksComponent,
        managePackDetailsComponent,
        ManageQcInventoryComponent,
        OpenPackComponent,
        ManageMiscConsumptionComponent,
        // QCInvReservationsComponent,
        BatchSpitComponent,
        SendSampleComponent
    ],
    imports: [
        CommonModule,
        QCInventoryRoutingModule,
        LimsHelpersModule,
        ReactiveFormsModule,
        FormsModule,
        AppMaterialModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
    ],
    entryComponents: [managePackDetailsComponent, ManageMiscConsumptionComponent, OpenPackComponent, BatchSpitComponent,SendSampleComponent],
    providers: [QCInventoryService, { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },],
})

export class QCInventoryModule { }
