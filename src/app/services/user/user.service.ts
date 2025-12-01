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
    // React to every Keycloak event
    effect(() => {
      const event = eventSignal();

      console.log(
        '%c[Keycloak Event]',
        'color:#4CAF50;font-weight:bold',
        event.type,
        event.args
      );

      // When Keycloak is ready, check if authenticated and log the user profile
      if (event.type === KeycloakEventType.Ready) {
        const authenticated = typeEventArgs<ReadyArgs>(event.args);

        if (authenticated) {
          this.keycloak
            .loadUserProfile()
            .then(profile => {
              this._profile$.next(profile);
              console.log(
                '%c[Keycloak User]',
                'color:#2196F3;font-weight:bold',
                profile
              );
            })
            .catch(err => {
              console.error('[Keycloak] Failed to load user profile', err);
            });
        } else {
          console.log('[Keycloak] Not authenticated');
          this._profile$.next(null);
        }
      }
    });
  }

  public get profile$(): Observable<KeycloakProfile | null> {
    return this._profile$.asObservable();
  }

  public get manageUrl() {
    const baseUrl = this.keycloak.createAccountUrl();
    return `${baseUrl}?referrer=${window.location.origin}&referrer_uri=${window.location.origin}`;
  }

  public login() {
    this.keycloak.login({redirectUri: window.location.origin});
  }

  public logout() {
    this.keycloak.logout({redirectUri: window.location.origin});
  }
}
