import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GameBoardPage } from './game-board.page';

describe('GameBoardPage', () => {
  let component: GameBoardPage;
  let fixture: ComponentFixture<GameBoardPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameBoardPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GameBoardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
