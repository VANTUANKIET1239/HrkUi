import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { TowerClimbComponent } from './tower-climb.component';
import { TowerApiService } from '../../../../core/services/tower-api.service';
import { BattleEngineService } from '../../../../core/services/battle-engine.service';
import { GameToastService } from '../../../../core/services/game-toast.service';
import { HrkConfirmationService } from '../../../../../../../../libs/shared/ui/modal/hrk-confirmation.service';
import { TowerProgress } from '../../../../core/models/event.model';

describe('Tower confirmation integration', () => {
  let fixture:ComponentFixture<TowerClimbComponent>;
  let api:jasmine.SpyObj<TowerApiService>;
  let confirmation:HrkConfirmationService;
  let response:Subject<any>;
  beforeEach(() => {
    response=new Subject(); api=jasmine.createSpyObj('api',['startNewRun','startQuickClimb']);
    api.startNewRun.and.returnValue(response); api.startQuickClimb.and.returnValue(response);
    TestBed.configureTestingModule({imports:[TowerClimbComponent],providers:[
      {provide:Router,useValue:{events:new Subject(),navigate:jasmine.createSpy('navigate')}},
      {provide:TowerApiService,useValue:api},
      {provide:BattleEngineService,useValue:{resetBattle:jasmine.createSpy('reset')}},
      {provide:GameToastService,useValue:jasmine.createSpyObj('toast',['warning','fromError'])}
    ]});
    TestBed.overrideComponent(TowerClimbComponent,{set:{template:'',imports:[]}});
    fixture=TestBed.createComponent(TowerClimbComponent);
    confirmation=TestBed.inject(HrkConfirmationService);
  });
  afterEach(() => { confirmation.cancelAll(); response.complete(); fixture.destroy(); });
  it('does not start a run before confirmation and cancellation never calls the API', async () => {
    const pending=fixture.componentInstance.startNewRun();
    expect(api.startNewRun).not.toHaveBeenCalled();
    confirmation.settle(false); await pending;
    expect(api.startNewRun).not.toHaveBeenCalled();
  });
  it('starts exactly once despite duplicate clicks while a question/request is pending', async () => {
    const pending=fixture.componentInstance.startNewRun();
    await fixture.componentInstance.startNewRun();
    confirmation.settle(true); await pending;
    await fixture.componentInstance.startNewRun();
    expect(api.startNewRun).toHaveBeenCalledTimes(1);
  });
  it('passes current run counts to the question and ignores confirmation after destruction', async () => {
    fixture.componentInstance.progress={canStartQuickClimb:true,quickClimbRunsUsed:1,quickClimbDailyLimit:3} as TowerProgress;
    const pending=fixture.componentInstance.openQuickClimb();
    expect(confirmation.active()?.parameters).toEqual({used:2,limit:3});
    expect(api.startQuickClimb).not.toHaveBeenCalled();
    fixture.componentInstance.ngOnDestroy(); confirmation.settle(true); await pending;
    expect(api.startQuickClimb).not.toHaveBeenCalled();
  });
});
