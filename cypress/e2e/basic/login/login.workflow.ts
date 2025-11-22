
import LoginPage from './login.po';
import SELECTORS_LOGIN from './login.selectors';
import {BaseWorkflow} from '../../../models/base.workflow';
import {APP_CONFIG} from '../../../config';
import LoginSelectors from './login.selectors';

export class LoginWorkflow extends BaseWorkflow {
  constructor() {
    super(SELECTORS_LOGIN);
  }

  public visitLoginPage(): void {
    LoginPage.visitLoginPage();
  }

  public loginViaKeycloak(username: string, password: string, expectDeleted = false): void {
    cy.origin(
      APP_CONFIG.KEYCLOAK_URL,
      {
        args: { username, password, expectDeleted, LOGIN_SELECTORS: SELECTORS_LOGIN },
      },
      ({ username: u, password: p, expectDeleted: del, LOGIN_SELECTORS }) => {
        cy.url({ timeout: 2000 }).should('include', 'protocol/openid-connect/auth');
        cy.get(LOGIN_SELECTORS.IDP.usernameInput).clear();
        cy.get(LOGIN_SELECTORS.IDP.usernameInput).type(u);
        cy.get(LOGIN_SELECTORS.IDP.passwordInput).clear();
        cy.get(LOGIN_SELECTORS.IDP.passwordInput).type(p);
        cy.get(LOGIN_SELECTORS.IDP.loginButton).click();
        if (del) {
          cy.get(LOGIN_SELECTORS.DELETED_USER.invalidCredential).should(($el) => {
            expect($el.text().trim()).not.to.eq('');
          });
        }
      },
    );
    if (!expectDeleted) {
      cy.location('href', { timeout: APP_CONFIG.TIMEOUT_L }).should('not.include', 'protocol/openid-connect');
    }
  }

  public loginRedirect(): void {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.visit(APP_CONFIG.BASE_URL);
    cy.url({ timeout: APP_CONFIG.TIMEOUT_S }).should('include', 'welcome');
  }

  public logout(): void {
    this.clickById('clientMenuButton');
    this.clickById('logout');
    cy.clearLocalStorage();
    cy.wait(APP_CONFIG.TIMEOUT_S);
  }

  public loginFailedDisabledClient(): void {
    cy.get(LoginSelectors.DISABLED_USER.deleteUser).should('be.visible');
    cy.get(LoginSelectors.DISABLED_USER.logout).should('be.visible');
  }

  public chooseClient(idx: number = 0): void {
    const root = LoginSelectors.CHOOSE_CLIENT.chooseClient;
    const tM = APP_CONFIG.TIMEOUT_M;
    const sel = `${root} mat-card`;

    cy.get(root, { timeout: tM }).should('be.visible');
    cy.get(sel, { timeout: tM }).as('cards');
    cy.get('@cards').its('length').should('be.gt', idx);
    cy.get('@cards').eq(idx).should('be.visible');
    cy.get('@cards').eq(idx).scrollIntoView();
    cy.get('@cards').eq(idx).click({ force: true, timeout: tM });
  }
}
