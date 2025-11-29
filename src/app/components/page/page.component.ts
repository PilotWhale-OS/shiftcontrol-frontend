import { Component } from '@angular/core';
import {PageService} from '../../services/breadcrumbs/page.service';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-page',
  imports: [
    NgForOf
  ],
  standalone: true,
  templateUrl: './page.component.html',
  styleUrl: './page.component.scss'
})
export class PageComponent {

  public get breadcrumbs() {
    return this._pageService.breadcrumbs?.getPath() ?? [];
  }

  constructor(private readonly _pageService: PageService) { }

}
