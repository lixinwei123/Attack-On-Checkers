import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { JoinGamePageRoutingModule } from './join-game-routing.module';
import { JoinGamePage } from './join-game.page';
import { JoinPrivateComponentModule } from '../join-private/join-private.module';

@NgModule({
  imports: [
    JoinPrivateComponentModule,
    CommonModule,
    FormsModule,
    IonicModule,
    JoinGamePageRoutingModule
  ],
  declarations: [JoinGamePage]
})
export class JoinGamePageModule { }
