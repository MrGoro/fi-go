import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';
import { isValidPhoneNumber, ParseError, parsePhoneNumberWithError } from 'libphonenumber-js'

export const phoneNumberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if(!control.value || isValidPhoneNumber(control.value, 'DE')) {
    return null;
  }
  try {
    parsePhoneNumberWithError(control.value, 'DE');
  } catch (error) {
    if (error instanceof ParseError) {
      return { phoneNumber: { error: error.message } };
    }
  }
  return { phoneNumber: {invalid: true } };
};

@Directive({
  selector: '[validatePhone]',
  providers: [{provide: NG_VALIDATORS, useExisting: PhoneValidateDirectives, multi: true}]
})
export class PhoneValidateDirectives implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return phoneNumberValidator(control);
  }
}
