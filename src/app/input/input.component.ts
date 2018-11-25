import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { StorageService } from '../shared/storage.service';

import * as moment from 'moment';
import 'moment/locale/de';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements OnInit {

  public time: string;

  constructor(
    private storageService: StorageService,
    private router: Router
  ) { }

  public ngOnInit(): void {
    this.storageService.getDate('startTime').subscribe(startTime => {
      if (startTime && startTime.toDateString() === new Date().toDateString()) {
        this.analyseDate(startTime);
      }
    });
  }

  public now(): void {
    this.time = moment().format('HH:mm');
  }

  public analyse(): void {
    const startTime: Date = this.getTime();
    this.analyseDate(startTime);
  }

  public analyseNow() {
    this.analyseDate(new Date());
  }

  public analyseDate(startTime: Date): void {
    this.storageService.setDate('startTime', startTime).subscribe();

    this.router.navigate(['/timer']);
  }

  private getTime(): Date {
    const hour: string = this.time.substring(0, 2);
    const minute: string = this.time.substring(3, 5);

    const time: Date = new Date();
    // tslint:disable-next-line:radix
    time.setHours(parseInt(hour), parseInt(minute), 0, 0);

    return time;
  }
}
