import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ShiftTradeAuctionComponent } from "./shift-trade-auction.component";

describe("ShiftTradeAuctionComponent", () => {
  let component: ShiftTradeAuctionComponent;
  let fixture: ComponentFixture<ShiftTradeAuctionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftTradeAuctionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftTradeAuctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
