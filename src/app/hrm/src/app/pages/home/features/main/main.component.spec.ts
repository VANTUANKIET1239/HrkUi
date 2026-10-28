import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MainComponent } from './main.component';
import { HrkTranslatePipe } from '@hrk/localization/hrk-translate.pipe';
import { HrkApiService } from '../../../../../../../../libs/core/http/hrk-api/hrk-api.service';
import { NavigationService } from '../../../../../../../../libs/core/services/navigation.service';
import { TokenManagerService } from '../../../../../../../../libs/core/auth/services/token-manager';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MainComponent ],
      imports: [HrkTranslatePipe],
      providers: [HrkApiService, NavigationService, TokenManagerService].map(provide => ({ provide, useValue: {} }))
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
