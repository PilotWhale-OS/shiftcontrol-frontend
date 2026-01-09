import {Component, inject} from "@angular/core";
import {NotificationService} from "../../../services/notification/notification.service";
import {map, tap} from "rxjs";
import {AsyncPipe, DatePipe, NgClass} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {icons} from "../../../util/icons";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";
import {RouterLink} from "@angular/router";

@Component({
  selector: "app-notifications",
  imports: [
    AsyncPipe,
    FaIconComponent,
    InputButtonComponent,
    DatePipe,
    RouterLink
  ],
  templateUrl: "./notifications.component.html",
  styleUrl: "./notifications.component.scss"
})
export class NotificationsComponent {

  protected readonly icons = icons;
  protected readonly notifications$;

  private readonly _notificationService = inject(NotificationService);

  constructor() {
    this.notifications$ = this._notificationService.notifications$.pipe(
      tap(async () => await this._notificationService.markAllAsRead()),
      map(notifications => [...notifications])
    );
  }

  protected clearNotification(notificationId: string) {
    this._notificationService.clearNotification(notificationId);
  }

  protected clearHistory() {
    this._notificationService.clearHistory();
  }
}
