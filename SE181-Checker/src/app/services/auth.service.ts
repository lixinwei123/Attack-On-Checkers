import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
  ) { }

  signInAnonymously() {
    this.afAuth.signInAnonymously();
  }

  getUserInfo(): Observable<firebase.default.User> {
    return this.afAuth.user;
  }

  getUserId(): Observable<string> {
    return this.getUserInfo().pipe(
      map(user => user.uid)
    );
  }
}
