import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../util/data.service';
import { format } from 'date-fns';
import { timeToDate } from '../util/time-functions';

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
    const startTime: Date = timeToDate(this.time);
    this.sendDate(startTime);
  }

  sendDate(startTime: Date): void {
    this.loading = true;
    this.data.setDate('startTime', startTime).subscribe(() => {
      this.router.navigate(['/timer/display']);
      this.loading = false;
    });
  }
}
