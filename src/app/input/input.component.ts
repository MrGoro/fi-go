import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { StorageService } from '../shared/storage.service';

import * as moment from 'moment';
import 'moment/locale/de';

@Component({
  selector: 'figo-input',
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
    let startTime: Date = this.storageService.getDate('startTime');
    if(startTime.toDateString() == new Date().toDateString()) {
      this.analyseDate(startTime);
    }
  }

  public now(): void {
    this.time = moment().format('HH:mm');
  }

  public analyse(): void {
    let startTime: Date = this.getTime();
    this.analyseDate(startTime);
  }

  public analyseNow() {
    this.analyseDate(new Date());
  }

  public analyseDate(startTime: Date): void {
    this.storageService.setDate('startTime', startTime);

    this.router.navigate(['/timer']);
  }

  private getTime(): Date {
    let hour: string = this.time.substring(0, 2);
    let minute: string = this.time.substring(3, 5);

    let time: Date = new Date();
    time.setHours(parseInt(hour), parseInt(minute), 0, 0);

    return time;
  }
}
