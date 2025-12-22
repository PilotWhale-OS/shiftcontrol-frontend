import {ApplicationConfig, inject, LOCALE_ID, provideZoneChangeDetection} from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import {AutoRefreshTokenService, provideKeycloak, UserActivityService, withAutoRefreshToken} from "keycloak-angular";
import { provideHttpClient } from "@angular/common/http";
import {Configuration as ShiftserviceConfiguration} from "../shiftservice-client";
import Keycloak from "keycloak-js";
import {provideAnimations} from "@angular/platform-browser/animations";

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideKeycloak({
    config: {
      url: "http://keycloak.127.0.0.1.nip.io",
      realm: "dev",
      clientId: "frontend"
    },
    initOptions: {
      onLoad: "check-sso",
      silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html"
    },
    features: [
      withAutoRefreshToken({
        onInactivityTimeout: "logout",
        sessionTimeout: 60000 * 30, // 30 minutes
      })
    ],
    providers: [AutoRefreshTokenService, UserActivityService, provideAnimations(), provideHttpClient(),
      {provide: LOCALE_ID, useValue: "de-AT" },
      {
        provide: ShiftserviceConfiguration,
        useFactory: () => {
          const keycloak = inject(Keycloak);

          return new ShiftserviceConfiguration({
            basePath: "http://shiftservice.127.0.0.1.nip.io",
            credentials: {
              "bearerAuth": () => keycloak.token
            }
          });
        },
        deps: [Keycloak],
        multi: false
      },]
  }),]
};
