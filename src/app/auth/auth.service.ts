import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { Observable, bindCallback } from 'rxjs';
import { map } from 'rxjs/operators';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) { }

  getUser(): Observable<User | null> {
    const getUserAsObservable = bindCallback(onAuthStateChanged)
    return getUserAsObservable(this.auth);
  }

  isLoggedIn(): Observable<boolean> {
    return this.getUser().pipe(
      map(user => user !== null)
    );   
  }
}
