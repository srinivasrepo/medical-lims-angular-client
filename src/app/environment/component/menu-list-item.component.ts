import { Component, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NavService } from '../service/nav.service';
import { NavItem } from 'src/app/common/services/utilities/commonModels';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { Constants } from '../../common/services/utilities/constants';
import { EnvironmentComponent } from './environment.component';

@Component({
  selector: 'app-menu-list-item',
  templateUrl: '../html/menu-list-item.component.html',
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition('expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      ),
    ])
  ]
})
export class MenuListItemComponent implements OnInit {
  expanded: boolean;
  @HostBinding('attr.aria-expanded') ariaExpanded = this.expanded;
  @Input() items: NavItem[];
  @Input() depth: number;
  @ViewChild('childMenu', { static: true }) public childMenu;

  constructor(public navService: NavService, public environment: EnvironmentComponent,
    public router: Router) {
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }

  ngOnInit() {
    // this.navService.currentUrl.subscribe((url: string) => {
    //   if (this.item.route && url) {
    //     // console.log(`Checking '/${this.item.route}' against '${url}'`);
    //     this.expanded = url.indexOf(`/${this.item.route}`) === 0;
    //     this.ariaExpanded = this.expanded;
    //     // console.log(`${this.item.route} is expanded: ${this.expanded}`);
    //   }
    // });
  }

  onItemSelected(item: NavItem) {
    if (!item.children || !item.children.length) {
      this.router.navigate([item.route]);
      this.navService.closeNav();
    }
    if (item.children && item.children.length) {
      this.expanded = !this.expanded;
    }
  }

  navigateTo(child) {
    this.environment.activeType = child.entityType;
    localStorage.setItem('activeEntity', child.entityType);
    localStorage.setItem('entityCode', child.entityCode);
    this.router.navigateByUrl(child.route);
    // this.router.navigateByUrl('/lims/home', { skipLocationChange: true }).then(() =>
    //   this.router.navigate([child.route]));
  }
}
