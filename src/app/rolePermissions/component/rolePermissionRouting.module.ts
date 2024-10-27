import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { RolePermissionComponent } from "./rolePermission.component";
import { ManageAppLevelComponent } from "./manageAppLevel.component";
import { ManageCapabilityComponent } from "./manageCapability.component";

export const rolePermissionRoutes: Routes = [
    { path: '', redirectTo: 'rPermission', pathMatch: 'full' },
    { path: 'rPermission', component: RolePermissionComponent },
    { path: 'manageAppLevel', component: ManageAppLevelComponent },
    { path: 'manageCapability', component: ManageCapabilityComponent },
]

@NgModule({
    imports: [RouterModule.forChild(rolePermissionRoutes)],
    exports: [RouterModule]
})

export class RolePermissionRoutingModule { }