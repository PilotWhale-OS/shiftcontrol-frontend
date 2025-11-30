import {Component, effect, inject} from "@angular/core";
import { RouterOutlet } from '@angular/router';
import {PageComponent} from './components/page/page.component';
import {KEYCLOAK_EVENT_SIGNAL, KeycloakEventType, ReadyArgs, typeEventArgs} from "keycloak-angular";
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ShiftControl';

  // Inject the underlying keycloak-js instance
  private readonly keycloak = inject(Keycloak);

  // Signal that emits Keycloak events
  private readonly keycloakEventSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  constructor() {
    // React to every Keycloak event
    effect(() => {
      const event = this.keycloakEventSignal();

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
        }
      }
    });
  }
}
