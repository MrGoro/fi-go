import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../util/data.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements OnInit {

  public loading = false;
  public time!: string;

  constructor(private router: Router, private data: DataService) { }

  ngOnInit(): void {
  }

  now(): void {
    this.time = format(new Date(), 'HH:mm');
  }

  sendNow(): void {
    this.now();
    this.send();
  }

  send(): void {
    const startTime: Date = this.getTime();
    this.sendDate(startTime);
  }

  sendDate(startTime: Date): void {
    this.loading = true;
    this.data.setDate('startTime', startTime).subscribe(() => {
      this.router.navigate(['/timer/display']);
      this.loading = false;
    });
  }

  private getTime(): Date {
    const hour: string = this.time.substring(0, 2);
    const minute: string = this.time.substring(3, 5);

    const time: Date = new Date();
    time.setHours(parseInt(hour), parseInt(minute), 0, 0);

    return time;
  }
}
