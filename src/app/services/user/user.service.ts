import { effect, Injectable, Signal, inject } from "@angular/core";
import {KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType, ReadyArgs, typeEventArgs} from "keycloak-angular";
import Keycloak, {KeycloakProfile} from "keycloak-js";
import {BehaviorSubject, map, Observable, of, switchMap} from "rxjs";
import {AccountInfoDto, UserProfileEndpointService} from "../../../shiftservice-client";
import UserTypeEnum = AccountInfoDto.UserTypeEnum;

@Injectable({
  providedIn: "root"
})
export class UserService {
  private readonly keycloak = inject(Keycloak);
  private readonly userService = inject(UserProfileEndpointService);

  private _profile$ = new BehaviorSubject<KeycloakProfile | null>(null);
  private _userType$ = new BehaviorSubject<UserTypeEnum | null>(null);

  constructor() {
    const eventSignal = inject<Signal<KeycloakEvent>>(KEYCLOAK_EVENT_SIGNAL);

    // React to every Keycloak events
    effect(() => {
      const event = eventSignal();

      // When Keycloak is ready, check if authenticated and log the user profile
      if (event.type === KeycloakEventType.Ready) {
        const authenticated = typeEventArgs<ReadyArgs>(event.args);

        if (authenticated) {
          this.keycloak
            .loadUserProfile()
            .then(profile => {
              this._profile$.next(profile);
            })
            .catch(() =>
              this._profile$.next(null)
            );
        } else {
          this._profile$.next(null);
        }
      }
    });

    this._profile$.pipe(
      switchMap(profile => profile === null ? of(null) : this.userService.getCurrentUserProfile()),
      map(profile => profile === null ? null : profile.account.userType)
    ).subscribe(this._userType$);
  }

  /**
   * Observable of the currently logged-in profile
   * Changes when logged in/out
   */
  public get profile$(): Observable<KeycloakProfile | null> {
    return this._profile$.asObservable();
  }

  public get userType$() {
    return this._userType$.asObservable();
  }

  /**
   * Get the account management URL via keycloak
   */
  public get manageUrl() {
    const baseUrl = this.keycloak.createAccountUrl();
    return `${baseUrl}?referrer=${window.location.origin}&referrer_uri=${window.location.origin}`;
  }

  public get token() {
    return this.keycloak.token;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public canManagePlan$(planId: string){
    return this.userType$.pipe(
      map(userType => userType === UserTypeEnum.Admin) // TODO add check if planner
    );
  }

  /**
   * Initialize keycloak login process
   */
  public login() {
    this.keycloak.login({redirectUri: window.location.origin});
  }

  /**
   * Initialize keycloak logout process
   */
  public logout() {
    this.keycloak.logout({redirectUri: window.location.origin});
  }
}
