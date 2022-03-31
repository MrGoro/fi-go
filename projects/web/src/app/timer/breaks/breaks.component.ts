import { Component, OnInit } from '@angular/core';
import { format } from 'date-fns';
import { timeToDate } from '../util/time-functions';
import { BreaksService } from './breaks.service';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-breaks',
  template: `
    <mat-dialog-content>
      <h1>Pause hinzufügen</h1>
      <form (ngSubmit)="add(inputForm);" #inputForm="ngForm" durationValidation>
        <mat-form-field class="full-width" appearance="outline">
          <mat-label>Beginn der Pause</mat-label>
          <input type="time" matInput placeholder="Beginn der Pause" autofocus required
                 [disabled]="loading"
                 [(ngModel)]="start" name="start">
          <mat-icon matSuffix aria-label="Aktuelle Uhrzeit übernehmen" (click)="start = now()">watch</mat-icon>
        </mat-form-field>

        <mat-form-field class="full-width" appearance="outline">
          <mat-label>Ende der Pause</mat-label>
          <input type="time" matInput placeholder="Ende der Pause" required
                 [disabled]="loading"
                 [(ngModel)]="end" name="end">
          <mat-icon matSuffix aria-label="Aktuelle Uhrzeit übernehmen" (click)="end = now()">watch</mat-icon>
          <mat-error *ngIf="inputForm.errors?.['startAfterEnd'] && (inputForm.touched || inputForm.dirty)">Das Ende der Pause muss nach dem Beginn liegen.</mat-error>
        </mat-form-field>

        <button mat-stroked-button color="warn" type="submit"  class="full-width"
                [disabled]="!inputForm.form.valid || loading">Hinzufügen</button>
      </form>

      <app-breaks-list [refresh]="refreshList"></app-breaks-list>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Schließen</button>
    </mat-dialog-actions>

  `
})
export class BreaksComponent implements OnInit {

  public loading = false;
  public start!: string;
  public end!: string;
  public refreshList: Subject<boolean> = new Subject();

  constructor(private service: BreaksService) { }

  ngOnInit(): void {
  }

  add(form: NgForm) {
    const startTime: Date = timeToDate(this.start);
    const endTime: Date = timeToDate(this.end);
    this.service.addBreak(startTime, endTime).subscribe(() => {
      console.debug('Break added');
      this.reset();
      form.resetForm();
    })
  }

  now(): string {
    return format(new Date(), 'HH:mm');
  }

  private reset() {
    this.start = '';
    this.end = '';
    this.loading = false;
    this.refreshList.next(true);
  }
}
