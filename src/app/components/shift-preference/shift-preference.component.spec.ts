import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftPreferenceComponent } from './shift-preference.component';

describe('ShiftPreferenceComponent', () => {
  let component: ShiftPreferenceComponent;
  let fixture: ComponentFixture<ShiftPreferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftPreferenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftPreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
