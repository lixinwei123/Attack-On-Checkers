import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DbService } from '../services/db.service';
import { ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map, mergeMap, switchMap } from 'rxjs/operators';
@Component({
  selector: 'app-join-game',
  templateUrl: './join-game.page.html',
  styleUrls: ['./join-game.page.scss'],
})
export class JoinGamePage implements OnInit {
  username: string;
  username$: Observable<string>;

  constructor(private route: Router,
    private authService: AuthService,
    private dbService: DbService,
    private toastCtrl: ToastController,
    ) { }

  ngOnInit() {
    this.username$ = this.authService.getUserId().pipe(
      switchMap(uid => this.dbService.getObjectValues<string>(`usernames/${uid}`))
    )
  }

  updateUsername() {
    this.authService.getUserId().subscribe(async (uid) => {
      if (this.username) {
        this.dbService.updateObjectAtPath(`usernames`, {[uid]: this.username})
        const toast = await this.toastCtrl.create({
          message: `Username updated!`,
          duration: 1000
        })
        toast.present();

      }
    })

  }
 

  generateId () {
    let id = Math.random().toString(36).substr(2, 5);
    console.log("id",id)
    this.route.navigate(['/game-board',id]);
  }
    


}
