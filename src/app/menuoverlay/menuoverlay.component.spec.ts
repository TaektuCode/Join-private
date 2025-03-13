import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuoverlayComponent } from './menuoverlay.component';

describe('MenuoverlayComponent', () => {
  let component: MenuoverlayComponent;
  let fixture: ComponentFixture<MenuoverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuoverlayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenuoverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
