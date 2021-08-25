import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivate, CanLoad, Route, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthorizedGuard implements CanActivate, CanLoad {

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.loggedInOrRedirect();
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.loggedInOrRedirect();
  }

  loggedInOrRedirect(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        let loggedIn =  this.auth.currentUser !== null;
        if(!loggedIn) {
          this.router.navigate(['/auth/login']);
        }
        resolve(loggedIn);
      });
    });
  }
}
