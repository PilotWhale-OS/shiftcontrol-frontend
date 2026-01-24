import {Component, inject} from "@angular/core";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {PageService} from "../../../services/page/page.service";
import {BC_EVENT} from "../../../breadcrumbs";
import {ReactiveFormsModule} from "@angular/forms";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {
  EventEndpointService,
  EventShiftPlansOverviewDto,
  LeaderBoardDto,
  LeaderboardEndpointService, SocialMediaLinkDto
} from "../../../../shiftservice-client";
import {combineLatest, map, Observable, shareReplay, switchMap, tap} from "rxjs";
import {AsyncPipe, DatePipe, DecimalPipe} from "@angular/common";
import {TooltipDirective} from "../../../directives/tooltip.directive";
import {UserService} from "../../../services/user/user.service";
import {icons} from "../../../util/icons";
import {EventLeaderboardComponent} from "../../../components/event-leaderboard/event-leaderboard.component";

@Component({
  selector: "app-plans",
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FaIconComponent,
    AsyncPipe,
    DatePipe,
    TooltipDirective,
    DecimalPipe,
    EventLeaderboardComponent
  ],
  standalone: true,
  templateUrl: "./event.component.html",
  styleUrl: "./event.component.scss"
})
export class EventComponent {

  protected readonly event$: Observable<EventShiftPlansOverviewDto>;
  protected readonly leaderboard$: Observable<LeaderBoardDto>;
  protected readonly isPlannerInEvent$;

  protected readonly icons = icons;

  private readonly _pageService = inject(PageService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _eventService = inject(EventEndpointService);
  private readonly _leaderboardService = inject(LeaderboardEndpointService);
  private readonly _userService = inject(UserService);

  constructor() {
    const eventId = this._route.snapshot.paramMap.get("eventId");
    if(eventId === null) {
      this._router.navigateByUrl("/");
      throw new Error("Event ID is required");
    }

    this.event$ = this._eventService.getShiftPlansOverviewOfEvent(eventId).pipe(
      tap(event => {
        this._pageService
          .configurePageName(`${event.eventOverview.name}`)
          .configureBreadcrumb(BC_EVENT, event.eventOverview.name, event.eventOverview.id);
      }),
      shareReplay()
    );

    this.leaderboard$ = this._leaderboardService.getLeaderboardForEvent(eventId);
    this.isPlannerInEvent$ = this.event$.pipe(
      switchMap(event => combineLatest(event.shiftPlans.map(plan => this._userService.canManagePlan$(plan.id)))),
      map(plans => plans.includes(true))
    );
  }

  public get userType$() {
    return this._userService.userType$;
  }

  public getSocialIcon(social: SocialMediaLinkDto){
    switch(social.type){
      case SocialMediaLinkDto.TypeEnum.Facebook:
        return this.icons.facebook;
      case SocialMediaLinkDto.TypeEnum.Instagram:
        return this.icons.instagram;
      case SocialMediaLinkDto.TypeEnum.Linkedin:
        return this.icons.linkedIn;
      case SocialMediaLinkDto.TypeEnum.Twitter:
        return this.icons.twitter;
      case SocialMediaLinkDto.TypeEnum.Youtube:
        return this.icons.youtube;
      case SocialMediaLinkDto.TypeEnum.Tiktok:
        return this.icons.tiktok;
      case SocialMediaLinkDto.TypeEnum.Discord:
        return this.icons.discord;
      case SocialMediaLinkDto.TypeEnum.Reddit:
        return this.icons.reddit;
      case SocialMediaLinkDto.TypeEnum.X:
        return this.icons.twitter;
      case SocialMediaLinkDto.TypeEnum.Twitch:
        return this.icons.twitch;
      default:
        return this.icons.website;
    }
  }

  public getSocialName(social: SocialMediaLinkDto){
    switch(social.type){
      case SocialMediaLinkDto.TypeEnum.Facebook:
        return "Facebook";
      case SocialMediaLinkDto.TypeEnum.Instagram:
        return "Instagram";
      case SocialMediaLinkDto.TypeEnum.Linkedin:
        return "LinkedIn";
      case SocialMediaLinkDto.TypeEnum.Twitter:
        return "Twitter";
      case SocialMediaLinkDto.TypeEnum.Youtube:
        return "YouTube";
      case SocialMediaLinkDto.TypeEnum.Tiktok:
        return "TikTok";
      case SocialMediaLinkDto.TypeEnum.Discord:
        return "Discord";
      case SocialMediaLinkDto.TypeEnum.Reddit:
        return "Reddit";
      case SocialMediaLinkDto.TypeEnum.X:
        return "X";
      case SocialMediaLinkDto.TypeEnum.Twitch:
        return "Twitch";
      default:
        return "Website";
    }
  }
}
