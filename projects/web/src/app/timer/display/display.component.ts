import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { timer } from 'rxjs';
import { DataService } from '../util/data.service';
import { add, intervalToDuration, isToday, sub } from 'date-fns';
import { durationToMillis, subDurations, TimeDuration, toTimeDuration } from '../util/time-functions';
import { environment } from '../../../environments/environment';
import { Break, BreaksService } from '../breaks/breaks.service';
import { calculateTotalDuration } from '../breaks/break-functions';


@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit, OnDestroy {

  private timer!: Subscription;

  private readonly timeToWork: Duration = environment.timer.timeToWork;

  private totalPause: Duration = environment.timer.pause;

  public workTime: Duration = {};
  public startTime!: Date;
  public finishTime!: Date;
  public outWorkTime!: TimeDuration;
  public outPause!: TimeDuration;
  public outBalance: TimeDuration = {negative: false};
  public minutesTillTenHours: number | undefined

  public progressCurrent = 0;
  public progressMax: number = durationToMillis(this.timeToWork);

  constructor(private data: DataService, private breaksService: BreaksService, private router: Router) { }

  ngOnInit(): void {
    this.data.getDate('startTime').subscribe(startTime => {
      if(!isToday(startTime)) {
        this.reset();
      }
      this.startTime = startTime;
      this.pauseUpdated([]);

      this.timer = timer(0, 1000).subscribe(() => {
        this.refresh();
      });

      this.breaksService.getBreaks().subscribe(breaks => {
        this.pauseUpdated(breaks);
      });
    });
  }

  private pauseUpdated(breaks: Break[]): void {
    if(breaks.length === 0) {
      this.totalPause = environment.timer.pause;
    } else {
      this.totalPause = calculateTotalDuration(breaks);
    }
    this.finishTime = add(add(this.startTime, this.timeToWork), this.totalPause);
  }

  public refresh(): void {
    // Bisherige Arbeitszeit
    this.workTime = intervalToDuration({start: this.startTime, end: new Date()});

    // Pause
    let pause: Duration = {};
    if(this.totalPause === environment.timer.pause) {
      if (this.workTime.hours === 6 && this.workTime.minutes && this.workTime.minutes < 30) {
        pause = {hours: 0, minutes: this.workTime.minutes, seconds: this.workTime.seconds};
      } else if (this.workTime.hours && this.workTime.hours >= 6) {
        pause = this.totalPause;
      }
    } else {
      pause = this.totalPause;
    }
    this.outPause = toTimeDuration(pause);

    this.workTime = intervalToDuration({start: this.startTime, end: sub(new Date(), pause)});
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
