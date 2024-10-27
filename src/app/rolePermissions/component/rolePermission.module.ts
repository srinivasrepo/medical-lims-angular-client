import { NgModule } from "@angular/core";
import { RolePermissionRoutingModule } from "./rolePermissionRouting.module";
import { RolePermissionComponent } from "./rolePermission.component";
import { CommonModule } from "@angular/common";
import { RolePermissionService } from "../service/rolePermission.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ManageAppLevelComponent } from "./manageAppLevel.component";
import { ManageApprovalLevelRoles } from "./manageAppLevelRoles.component";
import { ManageCapabilityComponent } from "./manageCapability.component";
import { MatExpansionModule } from '@angular/material';
import { AppMaterialModule } from 'src/app/app.material.module';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LimsHelpersModule } from '../../limsHelpers/component/limsHelpers.module';
import { ManageStatusComponent } from './manageStatus.component';
import { ManageActionProvisionComponent } from './manageActionProvision.component';

@NgModule({
    declarations: [
        RolePermissionComponent,
        ManageAppLevelComponent,
        ManageApprovalLevelRoles,
        ManageCapabilityComponent,
        ManageStatusComponent,
        ManageActionProvisionComponent
    ],
    imports: [
        RolePermissionRoutingModule,
        LimsHelpersModule,
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        AppMaterialModule,
        MatExpansionModule
    ],
    providers: [RolePermissionService],
    entryComponents: [ManageApprovalLevelRoles,ManageStatusComponent,ManageActionProvisionComponent]
})

export class RolePermissionModule { }