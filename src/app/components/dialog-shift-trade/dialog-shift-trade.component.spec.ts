import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogShiftTradeComponent } from './dialog-shift-trade.component';

describe('DialogShiftTradeComponent', () => {
  let component: DialogShiftTradeComponent;
  let fixture: ComponentFixture<DialogShiftTradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogShiftTradeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogShiftTradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
