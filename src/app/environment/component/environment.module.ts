import { NgModule } from '@angular/core';
import { EnvironmentRoutingModule } from './environmentRouting.module';
import { EnvironmentComponent } from './environment.component';
import { ValidateNavigationService } from './validatenavigation';
import { CommonModule } from '@angular/common';
import { EnvironmentService } from '../service/environment.service';
import { HomeComponent } from '../../login/component/home.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppMaterialModule } from 'src/app/app.material.module';
import { MatGridListModule, MatSidenavModule, MatMenuModule, MatBadgeModule } from '@angular/material';
import { MenuListItemComponent } from './menu-list-item.component';
import { NavService } from '../service/nav.service';
import { ApprovalComponent } from '../../approvalProcess/component/approvalProcess.component';
import { ApprovalProcessModule } from '../../approvalProcess/component/approvalProcess.module';
import { uploadModule } from 'src/app/UtilUploads/component/upload.module';
import { FullCalendarModule } from 'ng-fullcalendar';
import { MatExpansionModule } from '@angular/material/expansion';
import { ConfirmDialog } from '../../limsHelpers/component/confirmdialog';
import { LimsCommonModule } from '../../common/component/common.module';
import { ConfirmationService } from '../../limsHelpers/component/confirmationService';
import { ManageMasterModule } from '../../manageMaster/component/manageMaster.module';
import { ManageOccupancyComponent } from '../../common/component/manageOccupancy.component';
import { ReportModule } from '../../reports/component/reportList.module';
import { AddNewMaterialComponent } from '../../common/component/addNewMaterial.component';
import { addCommentComponent } from 'src/app/common/component/addComment.component';
import { RS232IntergrationComponent } from 'src/app/limsHelpers/component/rs232Integration.component';
import { FormsModule } from '@angular/forms';
import { TodoListTabelComponent } from 'src/app/login/component/todolistTable.component';
import { ReportView } from 'src/app/common/component/reportView.component';
import { RS232IntegrationModeService } from 'src/app/common/services/rs232IntegrationMode.service';
import { AddOtherFieldComponent } from 'src/app/common/component/addOtherField.component';
import { ManageRS232IntegrationOtherComponent } from './manageRS232IntegrationOther.component';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { QCInvReservationsComponent } from 'src/app/QCInventory/component/qcInventoryReservations.component';
import { LimsHelpersModule } from 'src/app/limsHelpers/component/limsHelpers.module';

@NgModule({
    declarations: [
        EnvironmentComponent,
        HomeComponent,
        ConfirmDialog,
        MenuListItemComponent,
        TodoListTabelComponent,
        AddOtherFieldComponent,
        ManageRS232IntegrationOtherComponent,
        QCInvReservationsComponent
    ],
    imports: [
        EnvironmentRoutingModule,
        CommonModule,
        LimsCommonModule,
        FlexLayoutModule,
        AppMaterialModule,
        ManageMasterModule,
        MatGridListModule,
        MatSidenavModule,
        MatMenuModule,
        ApprovalProcessModule,
        uploadModule,
        FullCalendarModule,
        MatExpansionModule,
        ReportModule,
        MatBadgeModule,
        FormsModule,
        LimsHelpersModule
    ],
    providers: [ValidateNavigationService, EnvironmentService, NavService, ConfirmationService, RS232IntegrationModeService],
    entryComponents: [ConfirmDialog, ApprovalComponent, ManageOccupancyComponent, AddNewMaterialComponent, addCommentComponent, RS232IntergrationComponent, ReportView,
        AddOtherFieldComponent, UploadFiles, QCInvReservationsComponent
    ]
})
export class EnvironmentModule { }
