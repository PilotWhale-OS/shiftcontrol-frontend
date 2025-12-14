import { Component, inject } from "@angular/core";
import {PageService} from "../../services/page/page.service";
import {AsyncPipe} from "@angular/common";
import {RouterLink} from "@angular/router";
import {UserService} from "../../services/user/user.service";
import {KeycloakProfile} from "keycloak-js";

@Component({
  selector: "app-page",
  imports: [
    RouterLink,
    AsyncPipe
  ],
  standalone: true,
  templateUrl: "./page.component.html",
  styleUrl: "./page.component.scss"
})
export class PageComponent {
  private readonly _pageService = inject(PageService);
  private readonly _userService = inject(UserService);


  public get breadcrumbs() {
    return this._pageService.breadcrumbs?.getPath() ?? [];
  }

  public get pageName() {
    return this._pageService.pageName;
  }

  public get profile$() {
    return this._userService.profile$;
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
