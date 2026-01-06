import {Component, Input} from "@angular/core";
import {LeaderBoardDto, RankDto} from "../../../shiftservice-client";
import { icons } from "../../util/icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";

@Component({
  selector: "app-event-leaderboard",
  imports: [
    FaIconComponent
  ],
  templateUrl: "./event-leaderboard.component.html",
  styleUrl: "./event-leaderboard.component.scss"
})
export class EventLeaderboardComponent {

  protected ranksTop3: RankDto[] = [];
  protected ranksRest: RankDto[] = [];

  protected readonly icons = icons;

  @Input()
  public set leaderboard(value: LeaderBoardDto) {

    const testRanks = [
      { rank: 2, firstName: "Jane", lastName: "Doe" },
      { rank: 1, firstName: "John", lastName: "Smith" },
      { rank: 3, firstName: "Alice", lastName: "Johnson" },
      { rank: 5, firstName: "Bob", lastName: "Brown" },
      { rank: 4, firstName: "Charlie", lastName: "Davis" },
      { rank: 6, firstName: "Eve", lastName: "Wilson" },
      { rank: 8, firstName: "Frank", lastName: "Miller" },
      { rank: 7, firstName: "Grace", lastName: "Taylor" }
    ];

    const ranks = (testRanks ?? this.leaderboard?.ranks ?? [])
      .sort((a, b) => a.rank - b.rank);

    this.ranksTop3 = ranks.slice(0, 3);
    this.ranksRest = ranks.slice(3);
  }

}
