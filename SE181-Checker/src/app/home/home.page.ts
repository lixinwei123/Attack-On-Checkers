import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AboutComponent } from '../about/about.component';
import { CreditsComponent } from '../credits/credits.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private modalCtrl: ModalController) {}

  async showAboutModal() {
    const modal = await this.modalCtrl.create({
      component: AboutComponent
    });
    await modal.present();
  }

  async showCreditsModal() {
    const modal = await this.modalCtrl.create({
      component: CreditsComponent
    });
    await modal.present();
  }

}
