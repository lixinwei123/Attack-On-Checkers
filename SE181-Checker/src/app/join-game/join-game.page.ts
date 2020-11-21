import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { JoinPrivateComponent } from "../join-private/join-private.component";

@Component({
  selector: 'app-join-game',
  templateUrl: './join-game.page.html',
  styleUrls: ['./join-game.page.scss'],
})
export class JoinGamePage implements OnInit {
  constructor(private modalCtrl: ModalController) { }

  async showJoinPrivateModal() {
    const modal = await this.modalCtrl.create({
      component: JoinPrivateComponent
    });
    await modal.present();
  }

  ngOnInit() {
  }
}
