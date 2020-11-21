import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-join-game',
  templateUrl: './join-game.page.html',
  styleUrls: ['./join-game.page.scss'],
})
export class JoinGamePage implements OnInit {

  constructor(private route: Router) { }

  ngOnInit() {
  }
 

  generateId () {
    let id = Math.random().toString(36).substr(2, 5);
    console.log("id",id)
    this.route.navigate(['/game-board',id]);
  }
    


}
