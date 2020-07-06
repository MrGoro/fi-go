import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription, timer } from 'rxjs';
import * as moment from 'moment';
import 'moment/locale/de';

import { StorageService } from '../shared/storage.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  private sixHours: moment.Duration = moment.duration(6, 'hours');
  public timeToWork: moment.Duration = moment.duration({ hours: 7, minutes: 48 });
  public workTime: moment.Duration = moment.duration();

  public myStartTime: moment.Moment;
  public myFinishTime: moment.Moment;
  public outWorkTime: string;
  public outBalance: string;
  public outTillTenHours: string;

  public balanceNegative: boolean;
  public alertTenHours: boolean;

  public progressCurrent = 0;
  public progressMax: number = this.timeToWork.asMilliseconds();

  constructor(
    private storageService: StorageService,
    private router: Router
  ) { }

  public ngOnInit(): void {
    moment.locale('de');

    this.storageService.getDate('startTime').subscribe(startTime => {

      this.myStartTime = moment(startTime);

      this.myFinishTime = this.myStartTime.clone().add({
        minutes: 30,
        milliseconds: this.timeToWork.asMilliseconds()
      });

      // If no time saved => redirect to beginning
      if (!(startTime instanceof Date) || startTime.toDateString() !== new Date().toDateString()) {
        this.reset();
      }

      this.subscription = timer(0, 1000).subscribe(() => {
        this.refresh();
      });
    });
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public refresh(): void {
    const startOfDay: Date = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Bisherige Arbeitszeit
    this.workTime = moment.duration(moment().diff(this.myStartTime));
    if (this.workTime.hours() === 6 && this.workTime.minutes() < 30) {
      this.workTime = this.sixHours;
    } else if (this.workTime.hours() >= 6) {
      this.workTime = this.workTime.subtract(30, 'minutes');
    }
    this.outWorkTime = moment.utc(this.workTime.asMilliseconds()).format('HH:mm:ss');

    // Saldo
    const myBalance: moment.Duration = this.workTime.clone().subtract(this.timeToWork.clone());
    if (myBalance.asMilliseconds() < 0) {
      this.outBalance = '-' + moment.utc(myBalance.asMilliseconds() * -1).format('HH:mm:ss');
      this.balanceNegative = true;
    } else {
      this.outBalance = moment.utc(myBalance.asMilliseconds()).format('HH:mm:ss');
      this.balanceNegative = false;
    }


    // Alarm 10 Stunden-Regelung
    if (this.workTime.clone().subtract({ hour: 9, minute: 30 }).asMilliseconds() > 0 &&
        this.workTime.clone().subtract({ hour: 10}).asMilliseconds() < 0) {
      this.alertTenHours = true;
      this.outTillTenHours = moment.utc(this.workTime.clone().subtract({ hour: 10 }).asMilliseconds() * -1).format('mm') + ' Minuten';
    }

    // Progress
    this.progressCurrent = this.workTime.asMilliseconds();
    // Neuen Kreis bis 10 Stunden zeigen, wenn Arbeitszeit erfüllt
    if (this.timeToWork.asMilliseconds() < this.progressCurrent) {
      this.progressCurrent = myBalance.asMilliseconds();
      this.progressMax = moment.duration('2:12').asMilliseconds();
    }
  }

  public reset(): void {
    this.storageService.set('startTime', null).subscribe(() =>
      this.router.navigate(['/'])
    );
  }
}
