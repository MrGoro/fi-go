import { RoundProgressComponent } from './round-progress.component';
import { RoundProgressService } from './round-progress.service';
import { ROUND_PROGRESS_DEFAULTS_PROVIDER } from './round-progress.config';
import { RoundProgressEase } from './round-progress.ease';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [
    RoundProgressComponent
  ],
  exports: [RoundProgressComponent],
  providers: [RoundProgressService, RoundProgressEase, ROUND_PROGRESS_DEFAULTS_PROVIDER]
})
export class RoundProgressModule {
}
