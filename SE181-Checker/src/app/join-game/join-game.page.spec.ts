import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JoinGamePage } from './join-game.page';

describe('JoinGamePage', () => {
  let component: JoinGamePage;
  let fixture: ComponentFixture<JoinGamePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JoinGamePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JoinGamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
