import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogShiftSignupComponent } from './dialog-shift-signup.component';

describe('DialogShiftSignupComponent', () => {
  let component: DialogShiftSignupComponent;
  let fixture: ComponentFixture<DialogShiftSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogShiftSignupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogShiftSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
