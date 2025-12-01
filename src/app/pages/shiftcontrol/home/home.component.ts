import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-home',
  imports: [
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  public readonly cards = [
    {title:"Events", content: "Manage your events and shift plans", href: "events"},
    {title:"User Account", content: "Manage your notification settings and unavailable time", href: "me"}
  ];
}
