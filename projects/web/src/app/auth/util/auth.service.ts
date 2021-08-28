import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private $user!: BehaviorSubject<User | null>;

  constructor(private auth: Auth) { }

  getUser(): Observable<User | null> {
    if(!this.$user) {
      this.$user = new BehaviorSubject<User | null>(null);
      onAuthStateChanged(this.auth, user => {
        this.$user.next(user);
      }, error => {
        this.$user.error(error);
      }, () => {
        this.$user.complete();
      })
    }
    return this.$user.asObservable();
  }

  isLoggedIn(): Observable<boolean> {
    return this.getUser().pipe(
      map(user => user !== null),
      //tap(loggedIn => console.log(`User loggedIn: ${loggedIn}`))
    );
  }
}
