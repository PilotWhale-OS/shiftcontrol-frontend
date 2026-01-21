import {Component, inject} from "@angular/core";
import { icons } from "../../../util/icons";
import {RewardPointsEndpointService, RewardPointsShareTokenDto} from "../../../../shiftservice-client";
import {BehaviorSubject,} from "rxjs";
import {ToastService} from "../../../services/toast/toast.service";
import {AsyncPipe} from "@angular/common";
import {ManageRewardsShareTokenComponent} from "../../../components/manage-rewards-share-token/manage-rewards-share-token.component";

@Component({
  selector: "app-rewards-share",
  imports: [
    AsyncPipe,
    ManageRewardsShareTokenComponent
  ],
  templateUrl: "./rewards-sync.component.html",
  styleUrl: "./rewards-sync.component.scss"
})
export class RewardsSyncComponent {

  protected shares$ = new BehaviorSubject<RewardPointsShareTokenDto[]>([]);

  protected readonly icons = icons;

  private readonly _toastService = inject(ToastService);
  private readonly _rewardsService = inject(RewardPointsEndpointService);

  constructor() {
    this.fetchTokens();
  }

  protected fetchTokens() {
    this._rewardsService.getAllRewardPointsShareTokens().subscribe(res => this.shares$.next(res));
  }

}
