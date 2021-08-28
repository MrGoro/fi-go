import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { timer } from 'rxjs';
import { DataService } from '../util/data.service';
import { add, intervalToDuration, isToday, sub } from 'date-fns';
import { durationToMillis, subDurations, TimeDuration, toTimeDuration } from '../util/time-functions';


@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit {

  private timer!: Subscription;

  private timeToWork: Duration = {hours: 7, minutes: 48};
  private pause: Duration = {minutes: 30};

  public workTime: Duration = {};
  public startTime!: Date;
  public finishTime!: Date;
  public outWorkTime!: TimeDuration;
  public outBalance: TimeDuration = {negative: false};
  public minutesTillTenHours: number | undefined

  public progressCurrent = 0;
  public progressMax: number = durationToMillis(this.timeToWork);

  constructor(private data: DataService, private router: Router) { }

  ngOnInit(): void {
    this.data.getDate('startTime').subscribe(startTime => {
      if(!isToday(startTime)) {
        this.reset();
      }
      this.startTime = startTime;
      this.finishTime = add(add(startTime, this.timeToWork), this.pause);
    });

    this.timer = timer(0, 1000).subscribe(() => {
      this.refresh();
    });
  }

  public refresh(): void {
    // Bisherige Arbeitszeit
    this.workTime = intervalToDuration({start: this.startTime, end: new Date()});
    if (this.workTime.hours === 6 && this.workTime.minutes && this.workTime.minutes < 30) {
      this.workTime.minutes = 0;
    } else if (this.workTime.hours && this.workTime.hours >= 6) {
      this.workTime = intervalToDuration({start: this.startTime, end: sub(new Date(), this.pause)});
    }
    this.outWorkTime = toTimeDuration(this.workTime);

    // Saldo
    this.outBalance = subDurations(this.workTime, this.timeToWork);

    // Alarm 10 Stunden-Regelung
    const tenHours = add(this.startTime, {hours: 10, minutes: 30})
    const tillTenHours = intervalToDuration({start: new Date(), end: tenHours});
    this.minutesTillTenHours = tillTenHours.minutes;

    // Progress
    this.progressCurrent = durationToMillis(this.workTime);
    // Neuen Kreis bis 10 Stunden zeigen, wenn Arbeitszeit erfüllt
    if (!this.outBalance.negative) {
      this.progressCurrent = durationToMillis(this.outBalance);
      this.progressMax = durationToMillis({hours: 2, minutes: 12});
    }
  }

  public reset(): void {
    this.data.set('startTime', null).subscribe(() => {
      this.router.navigate(['timer', 'input']);
    });
  }

  public ngOnDestroy() {
    this.timer.unsubscribe();
  }
}
