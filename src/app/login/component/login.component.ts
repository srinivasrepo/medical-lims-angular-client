import { Component, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs';
import { LoginService } from '../service/login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionMessages } from '../../common/services/utilities/constants';
import { LoginUser } from '../model/login';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { LoginMessages } from '../model/loginMessages';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { ButtonLoaderDirective } from 'src/app/limsHelpers/directive/buttonloader.directive';

@Component({
    templateUrl: '../html/login.html',
})

export class LoginComponent {

    loginForm: FormGroup;
    // @ViewChild('loader', { static: true }) loader: ButtonLoaderDirective;

    isLoaderStart: boolean = false;

    subscription: Subscription = new Subscription();


    constructor(private _fb: FormBuilder, private _router: Router,
        private _limsContextService: LIMSContextServices, private _loginService: LoginService,
        private _notify: AlertService
    ) {
        this.loginForm = this._fb.group({
            userName: ['', [Validators.required]],
            password: ['', [Validators.required]]
        })
    }

    ngAfterViewInit() {
        this.subscription = this._loginService.loginSubject.subscribe(resp => {
            this.isLoaderStart = false;
            if (resp.result.returnValue == "SUCCESS") {
                this._limsContextService.limsContext.limsToken = resp.result.token;
                this._limsContextService.limsContext.userDetails.roleName = resp.result.roleName;
                this._limsContextService.limsContext.userDetails.lastLogin = resp.result.lastLoginDate;
                this._limsContextService.limsContext.userDetails.userName = resp.result.name;
                this._limsContextService.limsContext.userDetails.shortName = resp.result.shotName;
                this._limsContextService.limsContext.userDetails.deptName = resp.result.deptName;
                this._limsContextService.limsContext.userDetails.plantName = resp.result.plantName;
                this._limsContextService.limsContext.userDetails.roleType = resp.result.roleType;
                this._limsContextService.limsContext.capabilities = resp.result.capabilities;
                this._limsContextService.setSession();

                this._router.navigateByUrl('/splash');
            }
            else
                this._notify.error(ActionMessages.GetMessageByCode(resp.result.returnValue));

        });

    }

    login() {

        var retval: string = this.controlValidate();

        if (CommonMethods.hasValue(retval)) {
            this._notify.warning(retval);
            return;
        }

        var obj: LoginUser = new LoginUser();
        obj.loginID = this.loginForm.controls.userName.value;
        obj.password = this.loginForm.controls.password.value;
        this.isLoaderStart = true;
        this._loginService.validateLogin(obj);
    }

    controlValidate() {
        if (!CommonMethods.hasValue(this.loginForm.controls.userName.value))
            return LoginMessages.userName;
        else if (!CommonMethods.hasValue(this.loginForm.controls.password.value))
            return LoginMessages.password
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}   