import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DataService } from './data.service';

interface GuardData {
  key: string;
  redirect: string;
  present: boolean;
}

export function canActivateWithData(key: string, redirect: string) {
  return {data: {key: key, redirect: redirect, present: true}, canActivate: [DataGuard]}
}
export function canActivateWithoutData(key: string, redirect: string) {
  return {data: {key: key, redirect: redirect, present: false}, canActivate: [DataGuard]}
}

@Injectable({
  providedIn: 'root'
})
export class DataGuard implements CanActivate {

  constructor(
    private router: Router,
    private data: DataService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      const data = route.data as GuardData;
      return this.data.get(data.key).pipe(
        map(dbData => dbData !== null && dbData !== undefined),
        tap(dbData => {
          console.log(`Data-Guard: Data present ${dbData}; expected ${data.present}`);
          if(data.present !== dbData ) {
            console.log(`Data-Guard: Redirect to ${data.redirect}`)
            this.router.navigate([data.redirect]);
          }
        })
      );
  }
  
}
