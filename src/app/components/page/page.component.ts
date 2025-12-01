import { Component } from '@angular/core';
import {PageService} from '../../services/breadcrumbs/page.service';
import {AsyncPipe, NgForOf} from "@angular/common";
import {RouterLink} from "@angular/router";
import {UserService} from "../../services/user/user.service";
import {KeycloakProfile} from "keycloak-js";

@Component({
  selector: 'app-page',
  imports: [
    RouterLink,
    AsyncPipe
  ],
  standalone: true,
  templateUrl: './page.component.html',
  styleUrl: './page.component.scss'
})
export class PageComponent {

  public get breadcrumbs() {
    return this._pageService.breadcrumbs?.getPath() ?? [];
  }

  constructor(
    private readonly _pageService: PageService,
    private readonly _userService: UserService
  ) { }

  /**
   * Get initials from profile data
   * @param profile
   */
  public getInitials(profile: KeycloakProfile) {
    if(!profile) return '';
    return `${profile.firstName?.charAt(0)} ${profile.lastName?.charAt(0)}`.trim();
  }

  public get profile$() {
    return this._userService.profile$;
  }
}
