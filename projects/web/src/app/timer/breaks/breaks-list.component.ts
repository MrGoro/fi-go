import { Component, Input, OnInit } from '@angular/core';
import { Break, BreaksService } from './breaks.service';
import { Subject } from 'rxjs';
import { BreaksDatasource } from './breaks-datasource';
import { format } from 'date-fns';

@Component({
  selector: 'app-breaks-list',
  template: `
    <h1>Bereits erfasste Pausen</h1>
    <table mat-table [dataSource]="dataSource" class="mat-elevation-z1 full-width">

      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell" [attr.colspan]="displayedColumns.length">
          Keine Pausen erfasst. <br/>Nach 6 Stunden wird automatisch eine Pause von 30 Minuten abgezogen.
        </td>
      </tr>

      <ng-container matColumnDef="startTime">
        <th mat-header-cell *matHeaderCellDef> Start</th>
        <td mat-cell *matCellDef="let element"> {{element.start | date:'HH:mm'}} Uhr</td>
        <td mat-footer-cell *matFooterCellDef> Summe</td>
      </ng-container>

      <ng-container matColumnDef="endTime">
        <th mat-header-cell *matHeaderCellDef> Ende</th>
        <td mat-cell *matCellDef="let element"> {{element.end | date:'HH:mm'}} Uhr</td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>

      <ng-container matColumnDef="duration">
        <th mat-header-cell *matHeaderCellDef> Dauer</th>
        <td mat-cell *matCellDef="let element"> {{ element.duration | timeDuration }} </td>
        <td mat-footer-cell *matFooterCellDef> {{ dataSource.totalDuration | timeDuration }} </td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell class="col-right" *matCellDef="let element">
          <button mat-icon-button color="warn" aria-label="Pause löschen" (click)="delete(element)">
            <mat-icon>delete</mat-icon>
          </button>
        </td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      <tr mat-footer-row *matFooterRowDef="displayedColumns"></tr>
    </table>
  `,
  styles: [`
    h1 {
      margin-top: 30px;
    }

    .col-right {
      text-align: right;
    }
  `]
})
export class BreaksListComponent implements OnInit {

  @Input() refresh!: Subject<boolean>;

  displayedColumns: string[] = ['startTime', 'endTime', 'duration', 'actions'];
  data: Break[] = [];
  dataSource!: BreaksDatasource;

  constructor(private service: BreaksService) {
  }

  ngOnInit(): void {
    this.dataSource = new BreaksDatasource(this.service);
    this.dataSource.loadBreaks();

    this.refresh.subscribe(v => {
      this.dataSource.loadBreaks();
    });
  }

  delete(element: Break) {
    console.log(`Deleting break ${element.id} from ${format(element.start, 'HH:mm')} to ${format(element.end, 'HH:mm')}`);
    this.service.deleteBreak(element.id).subscribe(() => {
      console.debug('Deleted');
    });
  }
}
