import { Component } from "@angular/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { CommonService } from '../../common/services/commonServices';
import { LIMSContextServices } from '../../common/services/limsContext.service';
import { PageTitle } from '../../common/services/utilities/pagetitle';
import { CommonMethods, CustomLocalStorage, LOCALSTORAGE_KEYS } from '../../common/services/utilities/commonmethods';
import { PageUrls, EntityCodes } from '../../common/services/utilities/constants';
import { EnvironmentComponent } from '../../environment/component/environment.component';
import { GetAssignedTestSampleUserModel } from 'src/app/samplePlan/model/samplePlanModel';
import { MatDialog } from '@angular/material';
import { ManageAssingUnAssignTestPlanComponent } from 'src/app/samplePlan/component/manageAssignUnAssignTest.component';
import { addCommentComponent } from 'src/app/common/component/addComment.component';
import { AlertService } from 'src/app/common/services/alert.service';
import { TestComment, TodoItems } from '../model/login';
import { LoginMessages } from '../model/loginMessages';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'home',
    templateUrl: '../html/home.html'
})

export class HomeComponent {

    toDoCountList: any;
    headerData: any;
    dataSource: any;
    conditionData: any = [];
    displayedColumns: string[] = ['S.No', 'reqCode', 'reqNumber', 'status', 'process'];
    pageTitle: string;
    totalRecords: any = [];
    todoListMenuFilter: any = [];
    opened: boolean = true;
    subscription: Subscription = new Subscription();
    docID: any;
    getSampleUsersList: Array<any> = [];
    pendingAct: any;
    conditionID: number;
    searchText: string;
    totalList: Array<TodoItems> = [];
    count: string;
    type: string = "TODO";
    actPenAct: any;
    searchTitle: string;
    searchCls: string;

    constructor(private _router: Router, private _limsTitle: LIMSContextServices,
        private _utilService: CommonService, private environment: EnvironmentComponent,
        private _matDailog: MatDialog, private _alert: AlertService, public _global: GlobalButtonIconsService
    ) {
        this.pageTitle = PageTitle.dashborad;
    }

    ngAfterViewInit() {
        this.subscription = this._utilService.commonSubject.subscribe(resp => {
            if (resp.purpose == "todoCount") {
                this.totalRecords = resp.result;
                this.toDoCountList = resp.result.todoList;
                if (this.toDoCountList.length > 0) {
                    if (CommonMethods.hasValue(localStorage.getItem('conditionID')))
                        this.conditionID = Number(localStorage.getItem('conditionID'));
                    else
                        this.conditionID = this.toDoCountList[0].conditionID;
                    this.GetTodoList(this.conditionID, 1);
                }
                else if (sessionStorage.getItem("entitytype") == 'SAMPLAN')
                    this.type = 'PEN_ACT'
                if (resp.result.samplePlan)
                    this.getSampleUsersList = resp.result.samplePlan;

                // if (this.toDoCountList.length > 0) {
                //     let conditions = this.toDoCountList.map(function (obj) { return obj.conditionID; });
                //     conditions = conditions.filter(function (v, i) { return conditions.indexOf(v) == i; });
                //     conditions.forEach((item) => {
                //         this._utilService.GetToDoListByCondition(item);
                //     })
                // }
            }
            else if (resp.purpose == "todoList")
                this.prepareData(resp.result, resp.conditionID);
            else if (resp.purpose == "getPendingActivities") {
                this.pendingAct = resp.result;
                this.actPenAct = resp.result;
            }
            else if (resp.purpose == "addCommentForCompletedTask") {
                if (resp.result == "SUCCESS")
                    this._alert.success(LoginMessages.CommentSucc);
                else this._alert.error(resp.result);
            }
            else if (resp.purpose == "getAllSamplePlanAssignedAnalysts")
                this.getSampleUsersList = resp.result
        });
        this.bindData();
        this.environment.isShow = false;
        localStorage.setItem('activeEntity', 'D');

        this.docID = document.getElementById('bgColor-home');
        this.docID.className = "dbbg";

        if (sessionStorage.getItem("entitytype") != 'SOLMGMT')
            this.displayedColumns = ['S.No', 'reqCode', 'status', 'process'];

    }

    prepareData(data, conditionID) {
        let obj = this.totalList.filter(objData => objData.conditionID == conditionID)
        if (obj.length < 1) {
            var item: TodoItems = new TodoItems();
            item.conditionID = this.conditionID;
            item.items = data;
            this.totalList.push(item);
            this.conditionData = data;
        }
    }

    bindData() {
        this._utilService.GetToDoListCounts(this._limsTitle.getEntityType());
        if (sessionStorage.getItem("entitytype") == 'SAMPLAN')
            this._utilService.getPendingActivities();

    }

    onActionClicked(evt) {
        if (this.type == 'PEN_ACT') {
            this.CloseShift(evt);
        }
        else {
            localStorage.removeItem('SAM_PAGE');
            localStorage.setItem('DESIGN_COL', 'MNG');
            localStorage.removeItem('CALIB_PAGE');
            localStorage.setItem('entityCode', evt.entityCode);
            localStorage.setItem('conditionCode', evt.conditionCode);
            localStorage.setItem('conditionID', evt.conditionID);
            CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.ENTITYCODE, evt.entityCode);
            
            this._router.navigate([evt.navigationPath], { queryParams: { id: evt.encID } });
        }
    }

    GetItems() {
        if (this.type == 'TODO') {
            let obj = this.conditionData.filter(objData => objData.conditionID == this.conditionID);
            if (this.toDoCountList && this.toDoCountList.length > 0) {
                var items = this.toDoCountList.filter(x => x.conditionID == this.conditionID)
                if (items.length > 0) {
                    this.searchTitle = items[0].condition;
                    var count = obj.length + '/' + items[0].totalCount;
                    this.count = count;
                }
            }
            return obj;
        }
        else if (this.type == 'PEN_ACT') {
            this.searchTitle = "My Activities";
            if (this.actPenAct && this.actPenAct.length > 0) {
                var count = this.pendingAct.length + '/' + this.actPenAct.length;
                this.count = count;
            }
            return this.pendingAct;
        }
    }

    getEntityTypes(data: any) {
        let modules = data.map(function (obj) { return obj.entityType; });
        modules = modules.filter(function (v, i) { return modules.indexOf(v) == i; });
        this.todoListMenuFilter = modules;
    }

    assignPlanTest(data: any) {
        var obj: GetAssignedTestSampleUserModel = new GetAssignedTestSampleUserModel();
        obj.userID = data.userID;
        obj.encUserRoleID = data.encUserRoleID;
        const modal = this._matDailog.open(ManageAssingUnAssignTestPlanComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.objAssignedBo = obj;
        modal.afterClosed().subscribe(resp => {
            this._utilService.getAllSamplePlanAssignedAnalysts();
            this._utilService.getPendingActivities();
        });
    }

    addComment(val) {
        // console.log(val)
        const modal = this._matDailog.open(addCommentComponent, { width: "400px" })
        modal.disableClose = true;
        modal.afterClosed().subscribe(res => {
            if (res.result) {
                var obj: TestComment = new TestComment();
                obj.encUserTestID = val.encUserTestID;
                obj.comment = res.val;
                this._utilService.addCommentForCompletedTask(obj);
            }
        })
    }

    CloseShift(data: any) {
        if (CommonMethods.hasValue(data))
            localStorage.setItem('USER_TEST_ID', data.encUserTestID)
        this._router.navigateByUrl(PageUrls.shiftClose);
    }

    getToolTip(data) {
        if (data.entityCode == EntityCodes.mobilePhase)
            return data.mpTitle
        else if (data.entityCode == EntityCodes.indicators)
            return data.indTitle
        else if (data.entityCode == EntityCodes.volumetricSol)
            return data.volTitle;
        else if (data.entityCode == EntityCodes.stockSolution)
            return data.calibTitle;
        else if (data.entityCode == EntityCodes.rinsingSolutions)
            return data.solutionName;
        else return null;
    }

    GetTodoList(conditionID, index) {
        this.searchText = null;
        this.conditionID = conditionID;
        this.type = 'TODO';
        var obj = this.totalList.filter(objData => objData.conditionID == this.conditionID);
        this.searchCls = "todo-bg" + '-' + index % 7;;

        if (!CommonMethods.hasValue(obj) || obj.length == 0)
            this._utilService.GetToDoListByCondition(conditionID);
        else this.filterData();
    }

    filterData() {
        if (CommonMethods.hasValue(this.searchText)) {
            if (this.type == 'TODO') {
                var data = this.totalList.filter(objData => objData.conditionID == this.conditionID)
                var obj = CommonMethods.bindMaterialGridData(data[0].items);
                obj.filter = this.searchText.trim().toLowerCase();
                this.conditionData = obj.filteredData;
            }
            else {
                var obj = CommonMethods.bindMaterialGridData(this.actPenAct);
                obj.filter = this.searchText.trim().toLowerCase();
                this.pendingAct = obj.filteredData;
            }
        }
        else {
            this.conditionData = this.totalList.filter(objData => objData.conditionID == this.conditionID)[0].items;
            this.pendingAct = this.actPenAct;
        }
    }

    getPendingAct() {
        this.type = 'PEN_ACT';
        this.searchCls = "todo-bg" + '-' + (this.toDoCountList.length + 1) % 7;;
    }

    getClass(i) {
        var cls: string = "todo-bg"
        return cls + '-' + i % 7;
    }

    getAnalysts(type) {
        if (type == 'ASS')
            return this.getSampleUsersList.filter(x => x.assignedCount > 0);
        else
            return this.getSampleUsersList.filter(x => x.assignedCount == 0);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.environment.isShow = true;

        if (CommonMethods.hasValue(this.docID))
            this.docID.className = "mat-card";
    }

}   