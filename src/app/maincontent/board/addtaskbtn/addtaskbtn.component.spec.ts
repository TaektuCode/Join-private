import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddtaskbtnComponent } from './addtaskbtn.component';

describe('AddtaskbtnComponent', () => {
  let component: AddtaskbtnComponent;
  let fixture: ComponentFixture<AddtaskbtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddtaskbtnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddtaskbtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
