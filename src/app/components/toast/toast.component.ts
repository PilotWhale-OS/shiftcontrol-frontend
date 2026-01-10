import {Component, inject} from "@angular/core";
import {Toast} from "ngx-toastr";
import {icons} from "../../util/icons";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {Router, RouterLink} from "@angular/router";
import {NgClass} from "@angular/common";

@Component({
  selector: "app-toast",
  imports: [
    InputButtonComponent,
    FaIconComponent,
    RouterLink,
    NgClass
  ],
  templateUrl: "./toast.component.html",
  styleUrl: "./toast.component.scss"
})
export class ToastComponent extends Toast {

  protected readonly icons = icons;

  private readonly _router = inject(Router);

  public get type(){
    if(this.options.payload !== undefined && this.options.payload.notification === true) {
      return "notification";
    } else {
      return "feedback";
    }
  }

  close(){
    this.remove();
  }

  click() {
    switch (this.type) {
      case "notification":
        this._router.navigateByUrl("/notifications");
        return;
      case "feedback":
        this.close();
        return;
    }
  }

}
