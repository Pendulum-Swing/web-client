import {
  Component, ElementRef, EventEmitter, HostListener,
  Input, OnInit, Output, ViewChild
}                                        from '@angular/core';
import { User }                          from '../../shared/state/user/user.model';
import { environment }                    from '../../../environments/environment';
import { Md5 }                           from 'ts-md5/dist/md5';
import { Router, NavigationStart }                        from '@angular/router';
import { ErrorService }                  from '../error/error.service';
import { ModalService }                  from '../modal/modal.service';
import { AppInfoComponent }              from './app-info/app-info.component';
import { SyncService }                   from '../services/sync.service';

@Component({
  selector: 'side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.sass']
})

export class SideMenuComponent implements OnInit {
  @Output() onSignoutClicked = new EventEmitter();
  @Output() clickedOutsideOfMenu = new EventEmitter();
  @Output() clickedToCloseMenu = new EventEmitter();
  @Input() user: User;
  @Input() netConnected: boolean;
  @Input() notifNum: number;
  @ViewChild('notifications') notifications;

  emailHash: any;
  pendulumNotification: boolean;
  notificationIsActive = false;
  activeItemNumber = 0;
  syncing = false;
  environment = environment;

  constructor (private router: Router,
               private errorService: ErrorService,
               private eRef: ElementRef,
               private modalService: ModalService,
               private syncService: SyncService) {
               }

  ngOnInit() {
    this.emailHash = Md5.hashStr(this.user.email);
    this.pendulumNotification = false;

    // initial active item in side menu by router
    if (this.router.url === '/dashboard') {
      this.activeItemNumber = 3;
    }
    if (this.router.url === '/notes') {
      this.activeItemNumber = 8;
    }
    if (this.router.url === '/profile') {
      this.activeItemNumber = 1;
    }

    // Subscribe to router events to find out the active item
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        if (event.url === '/dashboard') {
          this.activeItemNumber = 3;
        }
        if (event.url === '/notes') {
          this.activeItemNumber = 8;
        }
        if (event.url === '/profile') {
          this.activeItemNumber = 1;
        }
      }
    });
  }

  signout() {
    if (this.netConnected) {
      this.onSignoutClicked.emit();
      this.activeItemNumber = 4;
    } else {
      this.showError('Not available in offline mode' );
    }
  }

  updateIndex(number) {
    this.activeItemNumber = number;
    this.pendulumNotification = false;
    this.clickedToCloseMenu.emit();
  }

  toggleNotifications() {
    this.activeItemNumber = 2;
    this.pendulumNotification = false;
    this.notificationIsActive = !this.notificationIsActive;
    if (!this.notificationIsActive) {
      if (this.router.url === '/dashboard') {
        this.activeItemNumber = 3;
      }
      if (this.router.url === '/profile') {
        this.activeItemNumber = 1;
      }
    }
  }

  togglePendulumNotifications() {
    this.activeItemNumber = 5;
    this.pendulumNotification = !this.pendulumNotification;
    if (!this.pendulumNotification) {
      if (this.router.url === '/dashboard') {
        this.activeItemNumber = 3;
      }
      if (this.router.url === '/profile') {
        this.activeItemNumber = 1;
      }
    }
  }

  clickedOutSideOfNotification(event) {
    if (this.notifications.nativeElement.contains(event.target)) {
    } else {
      this.notificationIsActive = false;
      if (this.router.url === '/dashboard') {
        this.activeItemNumber = 3;
      }
      if (this.router.url === '/profile') {
        this.activeItemNumber = 1;
      }
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutOfMenu(event) {
    if (this.eRef.nativeElement.contains(event.target)) {
      // do nothing
      // console.log('clicked inside menu of sideMenu.');
    } else {
      this.clickedOutsideOfMenu.emit(event);
    }

    if (this.pendulumNotification) {
      const bugReportContainer: HTMLElement = document.getElementById('bug-report') as HTMLElement;
      const bugReportIcon: HTMLElement = document.getElementById('bug-report-icon') as HTMLElement;
      if (bugReportContainer) {
        if (bugReportContainer.contains(event.target) || bugReportIcon.contains(event.target)) {
          // do nothing
        } else {
          this.pendulumNotification = false;
        }
      }
    }
  }

  syncSummary() {
    if (!this.netConnected) {
      this.showError('Not available in offline mode' );
    } else {
      this.syncing = true;
      Promise.all(this.syncService.autoSync())
        .then(() => this.syncing = false)
        .catch(() => this.syncing = false);
    }
  }

  showModal(componentName: string) {
    if (componentName === 'AppInfoComponent') {
      this.modalService.show({
        component: AppInfoComponent,
        inputs: {}
      });
    }
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
