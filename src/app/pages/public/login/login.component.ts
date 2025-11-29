import { Component } from '@angular/core';
import {InputTextComponent} from '../../../components/inputs/input-text/input-text.component';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {TypedFormControlDirective} from "../../../directives/typed-form-control.directive";

@Component({
  selector: 'app-login',
  imports: [
    InputTextComponent,
    ReactiveFormsModule,
    TypedFormControlDirective
  ],
  standalone: true,
  templateUrl: "./login.component.html",
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  public readonly form;

  constructor(
    readonly fb: FormBuilder
  ){
    this.form = fb.group({
      username: this.fb.control<string>(''),
    });
  }

}
