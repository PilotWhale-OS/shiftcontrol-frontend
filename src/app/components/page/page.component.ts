import { Component, inject } from "@angular/core";
import {PageService} from "../../services/page/page.service";
import {AsyncPipe, NgClass} from "@angular/common";
import {RouterLink} from "@angular/router";
import {UserService} from "../../services/user/user.service";
import {KeycloakProfile} from "keycloak-js";
import {combineLatestWith, map} from "rxjs";
import {NotificationService} from "../../services/notification/notification.service";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {icons} from "../../util/icons";

@Component({
  selector: "app-page",
  imports: [
    RouterLink,
    AsyncPipe,
    NgClass,
    FaIconComponent
  ],
  standalone: true,
  templateUrl: "./page.component.html",
  styleUrl: "./page.component.scss"
})
export class PageComponent {

  protected readonly icons = icons;

  private readonly _pageService = inject(PageService);
  private readonly _userService = inject(UserService);
  private readonly _notificationService = inject(NotificationService);

  public get breadcrumbs$() {
    return this._pageService.breadcrumbs$.pipe(
      map(crumb => crumb?.getPath() ?? [])
    );
  }

  public get pageName$() {
    return this._pageService.pageName$;
  }

  public get profile$() {
    return this._userService.kcProfile$;
  }

  public get unseenNotificationCount$() {
    return this._notificationService.unreadCount$.pipe(
      map(count => ({count}))
    );
  }

  /**
   * Get initials from profile data
   * @param profile
   */
  public getInitials(profile: KeycloakProfile) {
    if(!profile) {return "";}
    return `${profile.firstName?.charAt(0)} ${profile.lastName?.charAt(0)}`.trim();
  }
}
