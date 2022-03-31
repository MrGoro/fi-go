import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';
import { timeToDate } from './time-functions';

@Directive({
  selector: '[durationValidation]',
  providers: [{ provide: NG_VALIDATORS, useExisting: DurationValidationDirective, multi: true }]
})
export class DurationValidationDirective implements Validator {

  constructor() { }

  validate(control: AbstractControl): ValidationErrors | null {
    return durationValidator(control);
  }
}

export const durationValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const startControl = control.get('start');
  const endControl = control.get('end');

  const start = startControl?.value ? timeToDate(startControl?.value) : null;
  const end = endControl?.value ? timeToDate(endControl?.value) : null;

  if (start && end && start.getTime() >= end.getTime()) {
    endControl?.setErrors({ 'endBeforeStart': true });
    return { 'startAfterEnd': true };
  }

  return null;
};
