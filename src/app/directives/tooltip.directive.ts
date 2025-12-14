import {ComponentRef, Directive, ElementRef, HostListener, inject, Input, OnInit} from "@angular/core";
import {Overlay, OverlayPositionBuilder, OverlayRef} from "@angular/cdk/overlay";
import {TooltipComponent} from "../components/tooltip/tooltip.component";
import {ComponentPortal} from "@angular/cdk/portal";

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: "[app-tooltip]",
  standalone: true
})
export class AwesomeTooltipDirective implements OnInit {

  @Input("app-tooltip") text = "";
  private overlayRef?: OverlayRef;

  private readonly overlay = inject(Overlay);
  private readonly overlayPositionBuilder = inject(OverlayPositionBuilder);
  private readonly elementRef = inject(ElementRef);


  @HostListener("pointerenter")
  show() {
    if(!this.overlayRef) {
      return;
    }

    const tooltipRef: ComponentRef<TooltipComponent>
      = this.overlayRef.attach(new ComponentPortal(TooltipComponent));
    tooltipRef.instance.text = this.text;
  }

  @HostListener("pointerleave")
  hide() {
    this.overlayRef?.detach();
  }

  ngOnInit(): void {
    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(this.elementRef)
      .withPositions([{
        originX: "center",
        originY: "top",
        overlayX: "center",
        overlayY: "bottom",
        offsetY: -8,
      }]);

    this.overlayRef = this.overlay.create({ positionStrategy });
  }
}
