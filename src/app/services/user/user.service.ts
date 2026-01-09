import { effect, Injectable, Signal, inject } from "@angular/core";
import {KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType, ReadyArgs, typeEventArgs} from "keycloak-angular";
import Keycloak, {KeycloakProfile} from "keycloak-js";
import {BehaviorSubject, map, Observable, of, switchMap} from "rxjs";
import {AccountInfoDto, UserProfileDto, UserProfileEndpointService} from "../../../shiftservice-client";
import UserTypeEnum = AccountInfoDto.UserTypeEnum;

@Injectable({
  providedIn: "root"
})
export class UserService {
  private readonly keycloak = inject(Keycloak);
  private readonly userService = inject(UserProfileEndpointService);

  private _kcProfile$ = new BehaviorSubject<KeycloakProfile | null>(null);
  private _userProfile$ = new BehaviorSubject<UserProfileDto | null>(null);
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
              this._kcProfile$.next(profile);
            })
            .catch(() =>
              this._kcProfile$.next(null)
            );
        } else {
          this._kcProfile$.next(null);
        }
      }
    });

    this._kcProfile$.pipe(
      switchMap(profile => profile === null ? of(null) : this.userService.getCurrentUserProfile()),
    ).subscribe(this._userProfile$);

    this._userProfile$.pipe(
      map(profile => profile === null ? null : profile.account.userType)
    ).subscribe(this._userType$);
  }

  /**
   * Observable of the currently logged-in profile
   * Changes when logged in/out
   */
  public get kcProfile$(): Observable<KeycloakProfile | null> {
    return this._kcProfile$.asObservable();
  }

  public get userProfile$() {
    return this._userProfile$.asObservable();
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

  /**
   * Check if the current user can manage the given plan
   * admins have access to all plans
   * planner to those assigned
   * @param planId
   */
  public canManagePlan$(planId: string){
    return this.userProfile$.pipe(
      map(profile => {
        if(profile === null) {return false;}

        if (profile.account.userType === UserTypeEnum.Admin) {
          return true;
        }

        return profile.planningPlans.some(allowedPlanId => allowedPlanId === planId);
      })
    );
  }

  /**
   * Check if the current user can participate in the given plan
   * admins have access to all plans
   * planners and volunteers to those assigned
   * planner is treated as volunteer
   * @param planId
   */
  public canParticipatePlan$(planId: string){
    return this.userProfile$.pipe(
      map(profile => {
        if(profile === null) {return false;}

        if (profile.account.userType === UserTypeEnum.Admin) {
          return true;
        }

        return profile.volunteeringPlans.some(allowedPlanId => allowedPlanId === planId)
          || profile.planningPlans.some(allowedPlanId => allowedPlanId === planId);
      })
    );
  }

  /**
   * Initialize keycloak login process
   */
  public login(redirectTo?: string) {
    this.keycloak.login({redirectUri: redirectTo ?? window.location.origin});
  }

  /**
   * Initialize keycloak logout process
   */
  public logout() {
    this.keycloak.logout({redirectUri: window.location.origin});
  }
}
