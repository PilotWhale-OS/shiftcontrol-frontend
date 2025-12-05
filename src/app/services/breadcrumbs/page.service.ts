import { Injectable } from "@angular/core";
import {Breadcrumb} from "../../breadcrumbs";

@Injectable({
  providedIn: "root"
})
export class PageService {

  private _breadcrumbs?: Breadcrumb = undefined;

  /**
   * Get the currently registered breadcrumbs
   */
  public get breadcrumbs() {
    return this._breadcrumbs;
  }

  /**
   * Set the current breadcrumbs
   * @param breadcrumb
   */
  public withBreadcrumbs(breadcrumb?: Breadcrumb): PageService {
    this._breadcrumbs = breadcrumb?.clone();
    return this;
  }

  /**
   * Configure one of the current breadcrumbs
   * @param breadcrumb the target breadcrumb to configure
   * @param name the new display name of the breadcrumb
   */
  public configureBreadcrumb(breadcrumb: Breadcrumb, name: string): PageService {
    let traverse= this._breadcrumbs;
    while (traverse !== undefined) {
      if(traverse.id === breadcrumb.id) {
        traverse.name = name;
        break;
      }
      traverse = traverse.parent;
    }

    return this;
  }
}
