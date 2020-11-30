import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss'],
})

export class CreditsComponent implements OnInit {
  constructor(private modalCtrl: ModalController) { }

  async close() {
    await this.modalCtrl.dismiss();
  }

  ngOnInit() {}
}
