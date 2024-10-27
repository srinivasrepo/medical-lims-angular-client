import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SplashComponent } from './login/component/splash.component';
import { LoginComponent } from './login/component/login.component';
import { ViewSDMSDetailsComponent } from './common/component/viewSDMSDetails.component';
import { CommonLoginComponent } from './login/component/commonLogin';

const routes: Routes = [
  // { path: '', redirectTo: '/login', pathMatch: "full" },
  { path: 'login', component: LoginComponent },
  { path: 'clogin', component: CommonLoginComponent },
  { path: 'splash', component: SplashComponent }
  // { path: 'ViewSDMSDetails', component: ViewSDMSDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
