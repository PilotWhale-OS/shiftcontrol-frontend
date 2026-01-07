import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionSignupComponent } from './position-signup.component';

describe('PositionSignupComponent', () => {
  let component: PositionSignupComponent;
  let fixture: ComponentFixture<PositionSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositionSignupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PositionSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
