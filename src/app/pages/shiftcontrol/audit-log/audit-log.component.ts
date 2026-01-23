import {Component, inject} from "@angular/core";
import { icons } from "../../../util/icons";
import {FormBuilder} from "@angular/forms";
import {LogEndpointService, LogEntryDto} from "../../../../auditservice-client";
import {AsyncPipe, DatePipe} from "@angular/common";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";
import {debounceTime, shareReplay, startWith, switchMap} from "rxjs";
import {RouterLink} from "@angular/router";

@Component({
  selector: "app-audit-log",
  imports: [
    AsyncPipe,
    DatePipe,
    InputButtonComponent,
    RouterLink
  ],
  templateUrl: "./audit-log.component.html",
  styleUrl: "./audit-log.component.scss"
})
export class AuditLogComponent {
  protected page$;

  protected readonly form;
  protected readonly icons = icons;
  protected readonly pageSize = 100;

  private readonly _fb = inject(FormBuilder);
  private readonly _logService = inject(LogEndpointService);

  constructor() {
    this.form = this._fb.group({
      paginationIndex: this._fb.nonNullable.control<number>(0)
    });

    this.page$ = this.form.valueChanges.pipe(
      startWith(this.form.value),
      debounceTime(100),
      switchMap((value) =>
        this._logService.getLogs(value.paginationIndex ?? 0, this.pageSize, {
        startTime: new Date(0).toISOString(),
        endTime: new Date().toISOString()
      })),
      shareReplay()
    );
  }

  /**
   * Open payload json in new tab
   * @param event
   * @protected
   */
  protected viewEventDetails(event: LogEntryDto) {
    const jsonString = JSON.stringify(event.payload, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }
}
