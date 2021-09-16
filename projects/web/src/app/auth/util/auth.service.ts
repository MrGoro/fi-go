import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Auth, authState} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) {}

  getUser(): Observable<User | null> {
    return authState(this.auth);
  }

  isLoggedIn(): Observable<boolean> {
    return this.getUser().pipe(
      map(u => !!u)
    );
  }
}
