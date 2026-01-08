import {inject, Injectable} from "@angular/core";
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {getHubProxyFactory, getReceiverRegister, Disposable} from "../../../notificationservice-client/TypedSignalR.Client";
import {PushNotificationEventDto} from "../../../notificationservice-client/NotificationService.Classes.Dto";
import {UserService} from "../user/user.service";
import {IPushNotificationHub} from "../../../notificationservice-client/TypedSignalR.Client/NotificationService.Hubs";
import {BehaviorSubject, combineLatest, combineLatestWith, distinctUntilChanged, map, Observable, switchMap, take} from "rxjs";

interface connectionState {
  connection: HubConnection;
  subscription: Disposable;
  hub: IPushNotificationHub;
}

@Injectable({
  providedIn: "root"
})
export class NotificationService {

  private readonly _hubUrl = "http://notificationservice.127.0.0.1.nip.io/hubs/push";
  private readonly _userService = inject(UserService);

  private _connectionState$ = new BehaviorSubject<connectionState | undefined>(undefined);
  private _notifications$ = new BehaviorSubject<Set<PushNotificationEventDto>>(new Set());
  private _unreadNotifications$ = new BehaviorSubject<Set<PushNotificationEventDto>>(new Set());

  constructor() {

    /* handle connection when user changes */
    this._userService.userProfile$.pipe(
      combineLatestWith(this._connectionState$),
      switchMap(async ([profile, connectionState]) => {
        if(profile && !connectionState) {
          return await this.setupConnectionAsync();
        }
        if(!profile && connectionState) {
          await connectionState.connection.stop();
          connectionState.subscription.dispose();
          connectionState.connection.onclose(async () => {
            await connectionState.connection.stop();
            connectionState.subscription.dispose();
            this._connectionState$.next(undefined);
          });
          return undefined;
        }

        return connectionState;
      }),
      distinctUntilChanged((a, b) => a?.connection?.connectionId === b?.connection?.connectionId)
    ).subscribe(connection => this._connectionState$.next(connection));

    /*  */
  }

  public get notifications$(): Observable<Set<PushNotificationEventDto>> {
    return this._notifications$.asObservable();
  }

  public get unseenNotifications$() {
    return this._unreadNotifications$.asObservable();
  }

  public markAllAsRead() {
    this._unreadNotifications$.next(new Set());
  }

  private async setupConnectionAsync(): Promise<connectionState> {
    const connection = new HubConnectionBuilder()
      .withUrl(this._hubUrl, {
        withCredentials: false,
        accessTokenFactory: () => (this._userService.token ?? "")
      })
      .build();
    const hubProxy = getHubProxyFactory("IPushNotificationHub")
      .createHubProxy(connection);
    const subscription = getReceiverRegister("IPushNotificationHubReceiver")
      .register(connection, {
        pushNotificationReceived: async event => this.addNotification(event)
      });

    await connection.start();
    return {
      connection,
      subscription,
      hub: hubProxy
    };
  }

  private addNotification(event: PushNotificationEventDto) {
    this._notifications$.pipe(
      take(1)
    ).subscribe(notifications => {
      notifications.add(event);
      this._notifications$.next(notifications);
    });

    this._unreadNotifications$.pipe(
      take(1)
    ).subscribe(unread => {
      unread.add(event);
      this._unreadNotifications$.next(unread);
    });
  }
}
