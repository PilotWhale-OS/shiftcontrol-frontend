import {inject, Injectable} from "@angular/core";
import {ToastrService} from "ngx-toastr";
import {Observable} from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ToastService {
  private readonly _toastr = inject(ToastrService);

  constructor() { }

  public showNotification(title: string, message: string, timeout?: number) {
    this._toastr.info(message,title, {
      timeOut: timeout,
      payload: {
        notification: true,
      }
    });
  }

  public showInfo(title: string, message: string, timeout?: number) {
    this._toastr.info(message,title, {
      timeOut: timeout
    });
  }

  public showError(title: string, message: string, timeout?: number) {
    this._toastr.error(message,title, {
      timeOut: timeout
    });
  }

  public showSuccess(title: string, message: string, timeout?: number) {
    this._toastr.success(message,title, {
      timeOut: timeout
    });
  }

  public tapSuccess<T>(successName: string, successDetail?: (value: T) => string) {
    return (source: Observable<T>) =>
      new Observable<T>(observer => {
        source.subscribe({
          next: value => {
            const detail = successDetail ? successDetail(value) : "";
            this.showSuccess(successName, detail);
            observer.next(value);
          },
          error: err => observer.error?.(err),
          complete: () => observer.complete?.()
        });
      });
  }

  public tapNotification<T>(notificationName: string, notificationDetail?: (value: T) => string) {
    return (source: Observable<T>) =>
      new Observable<T>(observer => {
        source.subscribe({
          next: value => {
            const detail = notificationDetail ? notificationDetail(value) : "";
            this.showNotification(notificationName, detail);
            observer.next(value);
          },
          error: err => observer.error?.(err),
          complete: () => observer.complete?.()
        });
      });
  }

  public tapInfo<T>(infoName: string, infoDetail?: (value: T) => string) {
    return (source: Observable<T>) =>
      new Observable<T>(observer => {
        source.subscribe({
          next: value => {
            const detail = infoDetail ? infoDetail(value) : "";
            this.showInfo(infoName, detail);
            observer.next(value);
          },
          error: err => observer.error?.(err),
          complete: () => observer.complete?.()
        });
      });
  }

  public tapError<T>(errorName: string, errorDetail?: (value: unknown) => string) {
    return (source: Observable<T>) =>
      new Observable<T>(observer => {
        source.subscribe({
          next: value => {
            observer.next(value);
          },
          error: err => {
            const detail = errorDetail ? errorDetail(err) : "";
            this.showInfo(errorName, detail);
            observer.error?.(err);
          },
          complete: () => observer.complete?.()
        });
      });
  }
}
