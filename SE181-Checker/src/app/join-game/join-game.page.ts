import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { JoinPrivateComponent } from "../join-private/join-private.component";
import { Router } from '@angular/router';
import { AlertController } from  '@ionic/angular';

@Component({
  selector: 'app-join-game',
  templateUrl: './join-game.page.html',
  styleUrls: ['./join-game.page.scss'],
})

export class JoinGamePage implements OnInit {
  constructor(private modalCtrl: ModalController, private alertCtrl: AlertController,private route: Router) { }

  async showJoinPrivateModal() {
    const modal = await this.modalCtrl.create({
      component: JoinPrivateComponent
    });
    await modal.present();
  }

  ngOnInit() {

  }
 

  generateId () {
    let id = Math.random().toString(36).substr(2, 5);
    console.log("id",id)
    this.route.navigate(['/game-board',id]);
  }
  checkCode(){
    
  }
  async presentPrompt() {
    let alert = await this.alertCtrl.create({
      inputs: [
        {
          id: 'id',
          placeholder: 'Enter id'
        },
      ],
      buttons: [
        {
          text: 'Submit',
          handler: data => {
            // if (User.isValid(data.username, data.password)) {
            //   // logged in!
            // } else {
            //   // invalid login
            //   return false;
            // }
            this.route.navigate(['/game-board',data[0]]); //TODO
          }
        }
      ]
    });
    await alert.present();
  }
}
