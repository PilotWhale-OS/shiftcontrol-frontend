import { Component } from "@angular/core";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";

@Component({
  selector: "app-shift-details-view",
  imports: [
    InputButtonComponent
  ],
  standalone: true,
  templateUrl: "./shift-details-view.component.html",
  styleUrl: "./shift-details-view.component.scss"
})
export class ShiftDetailsViewComponent {

}
