import {Component, inject} from "@angular/core";
import { icons } from "../../../util/icons";
import {
  PretalxApiKeyDetailsDto,
  PretalxEndpointService
} from "../../../../shiftservice-client";
import {BehaviorSubject,} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {ManagePretalxTokenComponent} from "../../../components/manage-pretalx-token/manage-pretalx-token.component";

@Component({
  selector: "app-pretalx-sync",
  imports: [
    AsyncPipe,
    ManagePretalxTokenComponent
  ],
  templateUrl: "./pretalx-sync.component.html",
  styleUrl: "./pretalx-sync.component.scss"
})
export class PretalxSyncComponent {

  protected configs$ = new BehaviorSubject<PretalxApiKeyDetailsDto[]>([]);

  protected readonly icons = icons;

  private readonly _pretalxService = inject(PretalxEndpointService);

  constructor() {
    this.fetchConfigs();
  }

  protected fetchConfigs() {
    this._pretalxService.getPretalxApiKeys().subscribe(res => this.configs$.next(res));
  }
}
