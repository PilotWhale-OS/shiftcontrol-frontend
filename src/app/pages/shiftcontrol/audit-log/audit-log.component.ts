import {Component, inject} from "@angular/core";
import { icons } from "../../../util/icons";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: "app-audit-log",
  imports: [],
  templateUrl: "./audit-log.component.html",
  styleUrl: "./audit-log.component.scss"
})
export class AuditLogComponent {
  protected readonly form;
  protected readonly icons = icons;

  private readonly _fb = inject(FormBuilder);

  constructor() {
    this.form = this._fb.group({
      paginationIndex: this._fb.nonNullable.control<number>(0)
    });
  }

}
