import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '../data.service';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit {

  startTime!: Observable<Date>;

  constructor(private data: DataService) { }

  ngOnInit(): void {
    this.startTime = this.data.getDate('startTime');
  }

}
