import {Component, EventEmitter, HostBinding, Input, Output} from "@angular/core";
import { IconDefinition, faGear } from "@fortawesome/free-solid-svg-icons";
import {NgClass} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";

@Component({
  selector: "xsb-input-button",
  standalone: true,
  templateUrl: "./input-button.component.html",
  imports: [
    NgClass,
    FaIconComponent
  ],
  styleUrls: ["./input-button.component.scss"]
})
export class InputButtonComponent {

  /**
   * event when the button had been clicked
   */
  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-native
  public readonly click = new EventEmitter<MouseEvent>();

  @Input()
  size: "minimal" | "regular" = "regular";

  @Input()
  action: "danger" | "normal" | "success" = "normal";

  @Input()
  type: "button" | "submit" = "button";

  @Input()
  name = "";

  @Input()
  content = "";

  @Input()
  icon?: IconDefinition;

  @Input()
  lock = false;

  @Input()
  disableLockIcon = false;

  lockIcon = faGear;

  /* hide actual properties from html to prevent accessibility isues */
  @HostBinding("attr.name") get hideNameAttr() { return null; }
  @HostBinding("attr.type") get hideTypeAttr() { return null; }

  preventDefault(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.click.emit(event);
  }
}
