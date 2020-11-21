import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-join-private',
  templateUrl: './join-private.component.html',
  styleUrls: ['./join-private.component.scss'],
})
export class JoinPrivateComponent implements OnInit {
  inputCode: any;

  constructor(private modalCtrl: ModalController) { }

  async close() {
    await this.modalCtrl.dismiss();
  }

  join() {
    // do stuff regarding join a game
    //joinText = "Joining...";
    console.log("join() is work in progress.")
    console.log(this.inputCode);
  }

  ngOnInit() { }
}
