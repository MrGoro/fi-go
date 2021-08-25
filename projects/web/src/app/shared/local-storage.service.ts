import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  get(key: string): string | null {
    return localStorage.getItem(key);
  }

  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  getBoolean(key: string): boolean {
    const origin = this.get(key);
    return (origin === 'true');
  }

  setBoolean(key: string, value: boolean) {
    this.set(key, String(value));
  }
}
