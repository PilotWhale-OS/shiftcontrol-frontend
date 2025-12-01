import {Component} from "@angular/core";
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";
import {UserService} from "../../../services/user/user.service";

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    InputButtonComponent
  ],
  standalone: true,
  templateUrl: "./login.component.html",
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  public readonly form;

  constructor(
    readonly _userService: UserService,
    readonly _fb: FormBuilder
  ){
    this.form = _fb.group({
      email: this._fb.nonNullable.control<string>(''),
      password: this._fb.nonNullable.control<string>(''),
    });
  }

  public login() {
    this._userService.login();
  }

}
