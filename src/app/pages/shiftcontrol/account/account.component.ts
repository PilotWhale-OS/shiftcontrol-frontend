import { Component, OnDestroy, inject } from "@angular/core";
import {UserService} from "../../../services/user/user.service";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {InputTextComponent} from "../../../components/inputs/input-text/input-text.component";
import {TypedFormControlDirective} from "../../../directives/typed-form-control.directive";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";
import {InputToggleComponent} from "../../../components/inputs/input-toggle/input-toggle.component";
import {UserProfileEndpointService} from "../../../../shiftservice-client";

@Component({
  selector: "app-account",
  imports: [
    InputTextComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    InputButtonComponent,
    InputToggleComponent
  ],
  templateUrl: "./account.component.html",
  standalone: true,
  styleUrl: "./account.component.scss"
})
export class AccountComponent implements OnDestroy {

  public readonly form;
  private readonly _userService = inject(UserService);
  private readonly _fb = inject(FormBuilder);
  private readonly _userProfileService = inject(UserProfileEndpointService);

  private readonly _profileSubscription;

  constructor() {
    this.form = this._fb.group({
      givenName: this._fb.nonNullable.control<string>(""),
      lastName: this._fb.nonNullable.control<string>(""),
      checked: this._fb.nonNullable.control<boolean>(false)
    });

    this._profileSubscription = this._userService.profile$.subscribe(profile => {
      if(profile) {
        this.form.setValue({
          givenName: profile.firstName ?? "",
          lastName: profile.lastName ?? "",
          checked: false
        });
      }
    });

    this._userProfileService.getCurrentUserProfile().subscribe(profile => {console.log(profile);});
  }

  public get user() {
    return this._userService.profile$;
  }

  ngOnDestroy(): void {
    this._profileSubscription.unsubscribe();
  }

  /**
   * open the external keycloak management console
   */
  goToManagement() {
    window.location.href = this._userService.manageUrl;
  }

  signOut() {
    this._userService.logout();
  }
}
