import {Component} from "@angular/core";
import {InputTextComponent} from '../../../components/inputs/input-text/input-text.component';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {TypedFormControlDirective} from "../../../directives/typed-form-control.directive";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";
import Keycloak from "keycloak-js";

@Component({
  selector: 'app-login',
  imports: [
    InputTextComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    InputButtonComponent
  ],
  standalone: true,
  templateUrl: "./login.component.html",
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  public readonly form;

  constructor(
    readonly keycloak: Keycloak,
    readonly fb: FormBuilder
  ){
    this.form = fb.group({
      email: this.fb.nonNullable.control<string>(''),
      password: this.fb.nonNullable.control<string>(''),
    });
  }

  public login() {
    this.keycloak.login({redirectUri: window.location.origin});
  }

}
