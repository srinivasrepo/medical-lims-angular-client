import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LookupComponent } from './lookup';
import { MatInputModule, MatFormFieldModule, MatTooltipModule, MatTableModule, MatPaginatorModule, MatMenuModule, MatDialogModule, MatCheckboxModule, MatButtonModule, MatDatepickerModule, MatSelectModule, MatExpansionModule, MatIconModule, MatGridListModule, MatRadioModule, MatTabsModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { GridComponent } from './grid.component';
import { PagingComponent } from './paging.component';
import { pageHeaderComponent } from './pageHeader.component';
import { LimsHelperService } from '../services/limsHelpers.service';
import { stageComponent } from './stageComponent.component';
import { materialCategoryComponent } from './materialCategory.component';
import { manageSolventsComponent } from './manageSolvents.component';
import { FileDownloadComponent } from './fileDownload.component';
// import { GridMouseHoverDirective } from '../directive/gridMouseHover.directive';
import { MouseHoverOut } from '../directive/mouseHover';
import { CustomeSearchComponent } from './cust-search.component';
import { RS232IntergrationComponent } from './rs232Integration.component';
import { MainPipeModule } from 'src/app/common/pips/mainPipe.module';
import { SearchFilterModalComponent } from './searchFilerModal.component';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ManageAddFieldComponent } from './manageAddField.component';
import { DirectiveModule } from '../directive/directive.module';
import { ViewQCInventoryComponent } from 'src/app/QCInventory/component/ViewQCInventory.component';
import { QCInventoryService } from 'src/app/QCInventory/service/QCInventory.service';
import { ViewQCInventoryHeaderDetailsComponent } from 'src/app/QCInventory/component/viewQCInventoryHeaderData.component';

@NgModule({
    declarations: [
        GridComponent,
        PagingComponent,
        LookupComponent,
        pageHeaderComponent,
        stageComponent,
        materialCategoryComponent,
        manageSolventsComponent,
        FileDownloadComponent,
        MouseHoverOut,
        CustomeSearchComponent,
        RS232IntergrationComponent,
        SearchFilterModalComponent,
        ManageAddFieldComponent,
        ViewQCInventoryComponent,
        ViewQCInventoryHeaderDetailsComponent
    ],

    exports: [
        GridComponent,
        PagingComponent,
        LookupComponent,
        pageHeaderComponent,
        MatInputModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatTableModule,
        MatPaginatorModule,
        MatMenuModule,
        stageComponent,
        materialCategoryComponent,
        manageSolventsComponent,
        MouseHoverOut,
        CustomeSearchComponent,
        RS232IntergrationComponent,
        MainPipeModule,
        SearchFilterModalComponent,
        ManageAddFieldComponent,
        DirectiveModule,
        ViewQCInventoryComponent,
        ViewQCInventoryHeaderDetailsComponent
    ]
    ,
    imports: [
        CommonModule,
        FormsModule,
        MatRadioModule,
        MatTooltipModule,
        MatDialogModule,
        MatCheckboxModule,
        MatInputModule,
        MatFormFieldModule,
        MatTableModule,
        MatPaginatorModule,
        MatMenuModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatSelectModule,
        MatExpansionModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        MatIconModule,
        MatGridListModule,
        //BrowserAnimationsModule,
        MainPipeModule,
        DragDropModule,
        DirectiveModule,
        MatTabsModule
    ],
    entryComponents:[SearchFilterModalComponent, ViewQCInventoryComponent],
    providers: [
        LimsHelperService, SearchFilterModalService, QCInventoryService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class LimsHelpersModule { }
