import {effect, Inject, Injectable, Signal} from "@angular/core";
import {KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType, ReadyArgs, typeEventArgs} from "keycloak-angular";
import Keycloak, {KeycloakProfile} from "keycloak-js";
import {BehaviorSubject, Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private _profile$ = new BehaviorSubject<KeycloakProfile | null>(null);

  constructor(private readonly keycloak: Keycloak, @Inject(KEYCLOAK_EVENT_SIGNAL) eventSignal: Signal<KeycloakEvent>) {

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
  }


  /**
   * Observable of the currently logged-in profile
   * Changes when logged in/out
   */
  public get profile$(): Observable<KeycloakProfile | null> {
    return this._profile$.asObservable();
  }

  /**
   * Get the account management URL via keycloak
   */
  public get manageUrl() {
    const baseUrl = this.keycloak.createAccountUrl();
    return `${baseUrl}?referrer=${window.location.origin}&referrer_uri=${window.location.origin}`;
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
