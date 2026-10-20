import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { BattleFormationSetupModalComponent } from './battle-formation-setup-modal.component';
import { InventoryService } from '../../../../core/services/inventory.service';
import { PlayerService } from '../../../../core/services/player.service';
import { FormationService } from '../../../../core/services/formation.service';
import { PlayerHeroService } from '../../../../core/services/player-hero.service';
import { DungeonApiService } from '../../../../core/services/dungeon-api.service';
import { GameToastService } from '../../../../core/services/game-toast.service';
import { BaseResponse, PlayerWalletDto } from '../../../../core/models/player.model';
import { InventoryItemDto } from '../../../../core/models/inventory.model';
import { PlayerHeroDto } from '../../../../core/models/player-hero.model';
import { DungeonStage } from '../../../../core/models/dungeon.model';

describe('Battle formation inventory capacity', () => {
  let fixture: ComponentFixture<BattleFormationSetupModalComponent>;
  let component: BattleFormationSetupModalComponent;
  let inventory: jasmine.SpyObj<InventoryService>;
  let player: jasmine.SpyObj<PlayerService>;
  let formation: jasmine.SpyObj<FormationService>;
  let toast: jasmine.SpyObj<GameToastService>;

  const success = <T>(data: T): BaseResponse<T> => ({ success: true, data, statusCode: 200, message: 'Success' });
  const items = (count: number, equipped = false): InventoryItemDto[] => Array.from({ length: count }, (_, id) =>
    ({ id, isEquipped: equipped, count: 999 } as InventoryItemDto));
  const wallet = (maxCapacity: number) => success({ maxCapacity } as PlayerWalletDto);

  beforeEach(() => {
    inventory = jasmine.createSpyObj('inventory', ['getInventory']);
    player = jasmine.createSpyObj('player', ['getWallet']);
    formation = jasmine.createSpyObj('formation', ['updatePositions', 'selectFormation']);
    formation.updatePositions.and.returnValue(of(success(null) as any));
    formation.selectFormation.and.returnValue(of(success(null) as any));
    toast = jasmine.createSpyObj('toast', ['info', 'warning', 'fromError']);
    TestBed.configureTestingModule({ imports: [BattleFormationSetupModalComponent], providers: [
      { provide: InventoryService, useValue: inventory }, { provide: PlayerService, useValue: player },
      { provide: FormationService, useValue: formation }, { provide: PlayerHeroService, useValue: {} },
      { provide: DungeonApiService, useValue: {} }, { provide: GameToastService, useValue: toast }
    ] });
    TestBed.overrideComponent(BattleFormationSetupModalComponent, { set: { template: '', imports: [] } });
    fixture = TestBed.createComponent(BattleFormationSetupModalComponent);
    component = fixture.componentInstance;
    component.stage = { staminaCost: 5 } as DungeonStage;
    component.staminaCurrent = 20;
    component.slots[0] = { id: 1 } as PlayerHeroDto;
  });
  afterEach(() => fixture.destroy());

  const check = () => (component as any).checkInventoryCapacity();

  it('uses the expanded wallet capacity and excludes equipped rows and stack quantities', () => {
    inventory.getInventory.and.returnValue(of(success([...items(120), ...items(100, true)])));
    player.getWallet.and.returnValue(of(wallet(250)));
    check();
    expect(component.isBagFull).toBeFalse();
    component.onStartBattle();
    expect(formation.updatePositions).toHaveBeenCalledTimes(1);
    expect(formation.selectFormation).toHaveBeenCalledTimes(1);
  });

  for (const capacity of [37, 100, 200, 310]) {
    it(`blocks battle when the ${capacity} wallet slots are exactly full`, () => {
      inventory.getInventory.and.returnValue(of(success(items(capacity))));
      player.getWallet.and.returnValue(of(wallet(capacity)));
      check();
      expect(component.isBagFull).toBeTrue();
      component.onStartBattle();
      expect(formation.updatePositions).not.toHaveBeenCalled();
      expect(toast.warning).toHaveBeenCalled();
    });
  }

  it('waits for both inventory and wallet before allowing battle', () => {
    const inventoryResponse = new Subject<BaseResponse<InventoryItemDto[]>>();
    const walletResponse = new Subject<BaseResponse<PlayerWalletDto>>();
    inventory.getInventory.and.returnValue(inventoryResponse);
    player.getWallet.and.returnValue(walletResponse);
    check();
    inventoryResponse.next(success(items(120))); inventoryResponse.complete();
    component.onStartBattle();
    expect(component.isInventoryCapacityLoading).toBeTrue();
    expect(formation.updatePositions).not.toHaveBeenCalled();
    walletResponse.next(wallet(200)); walletResponse.complete();
    expect(component.isInventoryCapacityLoading).toBeFalse();
    expect(component.isBagFull).toBeFalse();
    component.onStartBattle();
    expect(formation.updatePositions).toHaveBeenCalledTimes(1);
  });

  it('reports a lookup failure and leaves the authoritative check to the start-stage API', () => {
    const error = new Error('offline');
    inventory.getInventory.and.returnValue(of(success(items(120))));
    player.getWallet.and.returnValue(throwError(() => error));
    check();
    expect(component.isInventoryCapacityLoading).toBeFalse();
    expect(component.isBagFull).toBeFalse();
    expect(toast.fromError).toHaveBeenCalledWith(error, jasmine.any(String));
    component.onStartBattle();
    expect(formation.updatePositions).toHaveBeenCalledTimes(1);
  });

  it('does not substitute a fixed capacity when the wallet response is incomplete', () => {
    inventory.getInventory.and.returnValue(of(success(items(120))));
    player.getWallet.and.returnValue(of(success({} as PlayerWalletDto)));
    check();
    expect(component.isInventoryCapacityLoading).toBeFalse();
    expect(component.isBagFull).toBeFalse();
    expect(toast.fromError).toHaveBeenCalled();
  });

  it('cancels pending checks when the modal is destroyed', () => {
    const inventoryResponse = new Subject<BaseResponse<InventoryItemDto[]>>();
    const walletResponse = new Subject<BaseResponse<PlayerWalletDto>>();
    inventory.getInventory.and.returnValue(inventoryResponse);
    player.getWallet.and.returnValue(walletResponse);
    check(); fixture.destroy();
    expect(inventoryResponse.observed).toBeFalse();
    expect(walletResponse.observed).toBeFalse();
    expect(toast.fromError).not.toHaveBeenCalled();
  });
});
