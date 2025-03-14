import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletecontactComponent } from './deletecontact.component';

describe('DeletecontactComponent', () => {
  let component: DeletecontactComponent;
  let fixture: ComponentFixture<DeletecontactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletecontactComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeletecontactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
