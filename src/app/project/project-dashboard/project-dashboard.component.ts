import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Project } from 'app/shared/state/project/project.model';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { ProjectService } from '../project.service';
import { User } from 'app/shared/state/user/user.model';
import { Store } from '@ngrx/store';
import { AppState } from 'app/shared/state/appState';
import { Status } from 'app/shared/state/status/status.model';
import { ActivityService } from 'app/core/services/activity.service';
import { Activity } from 'app/shared/state/current-activity/current-activity.model';
import { BarChartInterface } from 'app/widgets/stat-chart/charts-models/bar-chart.model';
import { AreaChartInterface } from 'app/models/charts-model/area-chart-model';
import { RecentActivityWithProject } from 'app/widgets/recent-activities/model/recent-activities-with-project.model';
import { Note } from 'app/shared/state/note/note.model';
import { AppStateSelectors } from 'app/shared/state/app-state.selectors';

@Component({
  selector: 'project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.sass'],
})

export class ProjectDashboardComponent implements OnInit, OnDestroy {
  project: Project;
  projectId: string;
  projects$: Observable<any>;
  projectsId: Object = {};
  subscriptions: Subscription[] = [];
  user$: Observable<User>;
  status$: Observable<Status>;
  currentActivities: Activity[] = [];
  isOwnerOrAdmin: boolean = false;
  statChartSelectedItems: string[];
  barChartData: BarChartInterface[] = [];
  areaChartData: AreaChartInterface[] = [];
  recentActivitiesWithProject: RecentActivityWithProject[] = [];
  recentNotes: Note[];

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private activityService: ActivityService,
    private appStateSelectors: AppStateSelectors,
    private store: Store<AppState>,
  ) {
    this.user$ = this.store.select('user');
    this.status$ = this.store.select('status');
    this.projects$ = store.select(this.appStateSelectors.getProjectsArray)
    this.statChartSelectedItems = ['last day', 'last week', 'last month', 'last 3 month', 'last year'];
  }

  ngOnInit() {
    this.subscriptions.push(this.route.params.subscribe((params: Params) => {
      this.projectId = params['projectId'];
      this.projectService.getProject(this.projectId).then((project) => {
        this.project = project;

        // find if this user admin or owner of this project
        this.subscriptions.push(this.user$.subscribe((user) => {
          this.isOwnerOrAdmin = project.owner.id === user.id;
          if (!this.isOwnerOrAdmin) {
            if (project.admins) {
              project.admins.forEach((teamMember) => {
                if (teamMember.id === user.id) {
                  this.isOwnerOrAdmin = true;
                }
              });
            }
          }
        }));
      });
      this.activityService.getCurrentActivities(this.projectId).then((currentActivities) => {
        this.currentActivities = currentActivities;
      });
    }));

    this.subscriptions.push(this.projects$.subscribe((params: any) => {
      this.projectsId = params.reduce((obj, project) => ({...obj, [project.id]: project.name}), {})
    }));
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
  }

  ChartSelectItemChanged(event: {index: number; selectedItem: string}) {
    // TODO: make the proper response.
  }

  trimYAxis(duration: number): string {
    let x = duration / 1000;
    // minutes
    x /= 60;
    const minutes = Math.floor(x % 60);
    // hours
    x /= 60;
    const hours = Math.floor(x);

    let result: string;
    if (minutes < 10) {
      result = hours + ':0' + minutes ;
    } else {
      result = hours + ':' + minutes ;
    }

    return result;
  }
  
}