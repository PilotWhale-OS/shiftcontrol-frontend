import {Component, inject, OnDestroy} from "@angular/core";
import {UserService} from "../../../services/user/user.service";
import {FormBuilder, FormControl, ReactiveFormsModule} from "@angular/forms";
import {InputTextComponent} from "../../../components/inputs/input-text/input-text.component";
import {TypedFormControlDirective} from "../../../directives/typed-form-control.directive";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";
import {NotificationSettingsDto, UserProfileEndpointService} from "../../../../shiftservice-client";
import {InputMultiToggleComponent, MultiToggleOptions} from "../../../components/inputs/input-multitoggle/input-multi-toggle.component";
import {BehaviorSubject, catchError, forkJoin, pairwise, startWith, Subscription, switchMap} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {ToastService} from "../../../services/toast/toast.service";

type notificationToggleValue = NotificationSettingsDto.ChannelsEnum | "ALL";

@Component({
  selector: "app-account",
  imports: [
    InputTextComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    InputButtonComponent,
    InputMultiToggleComponent,
    AsyncPipe
  ],
  templateUrl: "./account.component.html",
  standalone: true,
  styleUrl: "./account.component.scss"
})
export class AccountComponent implements OnDestroy {

  public readonly form;

  protected testOptions: MultiToggleOptions<notificationToggleValue> = [
    {name: "All", value: "ALL"},
    {name: "Email", value: NotificationSettingsDto.ChannelsEnum.Email},
    {name: "Push", value: NotificationSettingsDto.ChannelsEnum.Push}
  ];
  protected readonly notificationFormControls$ = new BehaviorSubject<undefined | Map<
      NotificationSettingsDto.TypeEnum, FormControl<null | notificationToggleValue>
    >>(undefined);
  protected readonly userType$;

  private readonly _userService = inject(UserService);
  private readonly _fb = inject(FormBuilder);
  private readonly _userProfileService = inject(UserProfileEndpointService);
  private readonly _toastService = inject(ToastService);

  private readonly _profileSubscription;
  private _notificationChangesSubscription?: Subscription;

  constructor() {
    this.form = this._fb.group({
      notification: this._fb.control<string | null>(null),
      givenName: this._fb.nonNullable.control<string>(""),
      lastName: this._fb.nonNullable.control<string>(""),
      checked: this._fb.nonNullable.control<boolean>(false)
    });

    this.userType$ = this._userService.userType$;

    this._profileSubscription = this._userService.kcProfile$.subscribe(profile => {
      if(profile) {
        this.form.setValue({
          givenName: profile.firstName ?? "",
          lastName: profile.lastName ?? "",
          checked: false,
          notification: null
        });
      }
    });

    this._userProfileService.getCurrentUserProfile().subscribe(profile => {
      const map = new Map(profile.notifications
        .map(notification => {
          const currentValue = notification.channels.length === 2 ? "ALL" :
            notification.channels.length === 1 ? Array.from(notification.channels)[0] : null;
          const control = this._fb.control<null | notificationToggleValue>(currentValue);
          return [notification.type, control] as const;
        })
        .sort((a,b) => a[0].localeCompare(b[0]))
      );

      this._notificationChangesSubscription = forkJoin([...map.entries()].map(([type, control]) => control.valueChanges.pipe(
        startWith(control.value),
        pairwise(),
        switchMap(([oldValue, newValue]) => this._userProfileService.updateNotificationSettings({
          type: type,
          channels: newValue === "ALL" ? [NotificationSettingsDto.ChannelsEnum.Email, NotificationSettingsDto.ChannelsEnum.Push] :
            newValue ? [newValue] : []
        }).pipe(
          this._toastService.tapSaving("Notification Setting", item => this.getNotificationKindName(item.type)),
          catchError(() => {
            // on error, revert the change
            control.setValue(oldValue, {emitEvent: false});
            return [];
          })
        ))
      ))).subscribe();

      this.notificationFormControls$.next(map);
    });
  }

  ngOnDestroy(): void {
    this._profileSubscription.unsubscribe();
    this._notificationChangesSubscription?.unsubscribe();
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

  protected getNotificationKindName(type: NotificationSettingsDto.TypeEnum): string {
    switch (type) {
      case NotificationSettingsDto.TypeEnum.VolunteerAutoAssigned:
        return "Auto Assigned";
      case NotificationSettingsDto.TypeEnum.VolunteerTradesAuctionsRequestsChanged:
        return "Assignment Status Changed";
      case NotificationSettingsDto.TypeEnum.VolunteerTradeRequested:
        return "Trade Requested";
      case NotificationSettingsDto.TypeEnum.VolunteerShiftReminder:
        return "Shift Reminder";
      case NotificationSettingsDto.TypeEnum.PlannerTrustAlertTriggered:
        return "Trust Alert Triggered";
      case NotificationSettingsDto.TypeEnum.PlannerVolunteerJoinedPlan:
        return "Volunteer Joined";
      case NotificationSettingsDto.TypeEnum.PlannerVolunteerRequestedAction:
        return "Volunteer Assignment Action Requested";
      case NotificationSettingsDto.TypeEnum.AdminPlannerJoinedPlan:
        return "Planner Joined";
      case NotificationSettingsDto.TypeEnum.AdminRewardSyncUsed:
        return "Rewards Synced";
    }
  }
}
