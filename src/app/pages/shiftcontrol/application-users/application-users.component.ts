import {Component, inject} from "@angular/core";
import { icons } from "../../../util/icons";
import {FormBuilder} from "@angular/forms";
import {TrustAlertDisplayDto, TrustAlertEndpointService, UserEventEndpointService} from "../../../../shiftservice-client";
import {debounceTime, shareReplay, startWith, switchMap} from "rxjs";
import {AsyncPipe, DatePipe} from "@angular/common";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";
import {RouterLink} from "@angular/router";

@Component({
  selector: "app-application-users",
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    InputButtonComponent,
    RouterLink
  ],
  templateUrl: "./application-users.component.html",
  styleUrl: "./application-users.component.scss"
})
export class ApplicationUsersComponent {

  protected page$;

  protected readonly form;
  protected readonly icons = icons;
  protected readonly pageSize = 100;

  private readonly _fb = inject(FormBuilder);
  private readonly _userEventService = inject(UserEventEndpointService);

  constructor() {
    this.form = this._fb.group({
      paginationIndex: this._fb.nonNullable.control<number>(0)
    });

    this.page$ = this.form.valueChanges.pipe(
      startWith(this.form.value),
      debounceTime(100),
      switchMap((value) => this._userEventService.getAllUsers(value.paginationIndex ?? 0, this.pageSize, {
        name: undefined
      })),
      shareReplay()
    );
  }
}
