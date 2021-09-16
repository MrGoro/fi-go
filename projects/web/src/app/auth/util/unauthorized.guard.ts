import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivate, CanLoad, Route, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UnauthorizedGuard implements CanActivate, CanLoad {

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.notLoggedInOrRedirect();
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.notLoggedInOrRedirect();
  }

  notLoggedInOrRedirect(): Observable<boolean> {
    return authState(this.auth).pipe(
      map(u => !!u),
      tap(isLoggedIn => {
        if(isLoggedIn) {
          this.router.navigate(['/']);
        }
      }),
      map(isLoggedIn => !isLoggedIn)
    );
  }
}
