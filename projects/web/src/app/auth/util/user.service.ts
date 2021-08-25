import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Database, ref, update } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private db: Database, private authService: AuthService) { }

  public updateUser(key: string, value: any): Observable<void> {
    return this.authService.getUser().pipe(
      map(user => {
        const data: any = {
          phoneNumber: user?.phoneNumber,
          providerId: user?.providerId
        };
        data[key] = value;
        return update(ref(this.db, `users/${user?.uid}`), data);
      }),
      switchMap(result => from(result))
    );
  }
}
