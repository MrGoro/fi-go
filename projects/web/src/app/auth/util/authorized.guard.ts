import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivate, CanLoad, Route, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';
import { map, tap } from 'rxjs/operators';

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

  loggedInOrRedirect(): Observable<boolean> {
    return authState(this.auth).pipe(
      map(u => !!u),
      tap(isLoggedIn => {
        if(!isLoggedIn) {
          this.router.navigate(['/auth/login']);
        }
      })
    );
  }
}
