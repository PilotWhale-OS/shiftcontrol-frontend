import {Component, inject} from "@angular/core";
import {NotificationService} from "../../../services/notification/notification.service";
import {map, tap} from "rxjs";
import {AsyncPipe, DatePipe} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {icons} from "../../../util/icons";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";

@Component({
  selector: "app-notifications",
  imports: [
    AsyncPipe,
    FaIconComponent,
    InputButtonComponent,
    DatePipe
  ],
  templateUrl: "./notifications.component.html",
  styleUrl: "./notifications.component.scss"
})
export class NotificationsComponent {

  protected readonly icons = icons;

  private readonly _notificationService = inject(NotificationService);

  public get notifications$() {
    return this._notificationService.notifications$.pipe(
      tap(() => this._notificationService.markAllAsRead()),
      map(notifications => [...notifications])
    );
  }
}
