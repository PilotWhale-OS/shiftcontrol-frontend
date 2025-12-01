import {Component, OnDestroy, OnInit} from "@angular/core";
import {UserService} from "../../../services/user/user.service";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {InputTextComponent} from "../../../components/inputs/input-text/input-text.component";
import {TypedFormControlDirective} from "../../../directives/typed-form-control.directive";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";

@Component({
  selector: 'app-account',
  imports: [
    InputTextComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    InputButtonComponent
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnDestroy {
  public readonly form;

  private readonly _profileSubscription;

  constructor(
    private readonly _userService: UserService,
    readonly _fb: FormBuilder
  ) {
    this.form = _fb.group({
      givenName: this._fb.nonNullable.control<string>(''),
      lastName: this._fb.nonNullable.control<string>(''),
    });

    this._profileSubscription = this._userService.profile$.subscribe(profile => {
      if(profile) {
        this.form.setValue({
          givenName: profile.firstName ?? '',
          lastName: profile.lastName ?? ''
        });
      }
    });
  }

  public get user() {
    return this._userService.profile$;
  }

  ngOnDestroy(): void {
    this._profileSubscription.unsubscribe();
  }

  goToManagement() {
    const url = this._userService.manageUrl;
    window.location.href = url;
  }

  signOut() {
    this._userService.logout();
  }
}
