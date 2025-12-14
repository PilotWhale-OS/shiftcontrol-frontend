import { Injectable } from "@angular/core";

import {Breadcrumb} from "../../util/breadcrumb";

@Injectable({
  providedIn: "root"
})
export class PageService {

  private _breadcrumbs?: Breadcrumb = undefined;
  private _pageName?: string = undefined;

  /**
   * Get the currently registered breadcrumbs
   */
  public get breadcrumbs() {
    return this._breadcrumbs;
  }

  /**
   * Get the current page name
   */
  public get pageName() {
    return this._pageName;
  }

  /**
   * Set the current breadcrumbs
   * @param breadcrumb
   */
  public withBreadcrumbs(breadcrumb?: Breadcrumb): PageService {
    this._breadcrumbs = breadcrumb?.clone();
    this._pageName = breadcrumb?.name ?? "ShiftService";
    return this;
  }

  /**
   * Configure one of the current breadcrumbs
   * @param breadcrumb the target breadcrumb to configure
   * @param name the new display name of the breadcrumb
   * @param href
   */
  public configureBreadcrumb(breadcrumb: Breadcrumb, name: string, href: string): PageService {
    let traverse= this._breadcrumbs;
    while (traverse !== undefined) {
      if(traverse.id === breadcrumb.id) {
        traverse.name = name;
        traverse.href = href;
        break;
      }
      traverse = traverse.parent;
    }

    return this;
  }

  public configurePageName(name: string): PageService {
    this._pageName = name;
    return this;
  }
}
