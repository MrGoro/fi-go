import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private router: Router
  ) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {
    return new Promise((resolve) => {
      this.afAuth.authState.subscribe(auth => {
        if (auth !== null) {
          //console.log('access granted!');
          resolve(true);
        } else {
          console.log('access denied!');
          this.router.navigate(['/login']);
          resolve(false);
        }
      });
    });
  }
}
