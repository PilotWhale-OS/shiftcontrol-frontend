import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogShiftAuctionComponent } from './dialog-shift-auction.component';

describe('DialogShiftAuctionComponent', () => {
  let component: DialogShiftAuctionComponent;
  let fixture: ComponentFixture<DialogShiftAuctionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogShiftAuctionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogShiftAuctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
