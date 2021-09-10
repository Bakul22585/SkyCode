import {
  Component,
  OnInit,
  Inject,
  Output,
  Input,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
  OnDestroy,
  ElementRef
} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSelect, VERSION } from '@angular/material';
import { CommonModule, DatePipe } from '@angular/common';
import * as $ from 'jquery';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import * as _moment from 'moment';

import { Subject, ReplaySubject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { TypesUtilsService } from 'src/app/core/utils/types-utils.service';
import { SpinnerButtonOptions } from 'src/app/content/partials/content/general/spinner-button/button-options.interface';
import { LayoutUtilsUsersService, MessageType } from 'src/app/core/users/utils/layout-utils-users.service';

import { UserModel } from '../../../core/users/models/user.model';
import { ExpenceModel } from '../../../core/expences/models/expence.model';
import { ExpencepayModel } from '../../../core/expences/models/expencepay.model';
import { UsersService } from '../../../core/users/services/users.service';
import { ExpencesService } from '../../../core/expences/services/expences.service';
import { EventsService } from '../../../core/events/services/events.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-expence-edit',
  templateUrl: './expence-edit.component.html',
  styleUrls: ['./expence-edit.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class ExpenceEditComponent implements OnInit {

  public model: any = ExpenceModel;
  @Output() actionChange = new Subject<string>();
  public loading = false;
  public fundId = 0;
  public data: any = [];
  hasFormErrors: boolean = false;

  @Input() action: string;
  @Input() placeholderLabel = 'Search';
  @Input() noEntriesFoundLabel = 'No Result Found';

  fundForm: FormGroup;
  errors: any = [];
  is_installment = false;
  users: any = [];
  event: any = [];
  date = new Date();
  user_id = '';
  paymentMethod = '';
  files: File[] = [];
  mindate = new Date();
  actual_amount = 0;
  payent_by = 0;
  UserData: any = [];

  spinner: SpinnerButtonOptions = {
    active: false,
    spinnerSize: 18,
    raised: true,
    buttonColor: 'primary',
    spinnerColor: 'accent',
    fullWidth: false
  };

  @ViewChild('paid_end_date') picker: ElementRef;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private typesUtilsService: TypesUtilsService,
    public userService: UsersService,
    private layoutUtilsService: LayoutUtilsUsersService,
    private datePipe: DatePipe,
    public expenceService: ExpencesService,
    public eventService: EventsService,
  ) { }

  ngOnInit() {
    this.fundId = localStorage.getItem('editExpenceId') ? Number(localStorage.getItem('editExpenceId')) : 0;
    this.UserData = JSON.parse(sessionStorage.getItem('user_data'))._value;
    this.createForm();

    if (this.fundId > 0) {
      this.model = this.expenceService.getExpenceById(this.fundId).subscribe(data => {
        this.model = data;
        this.user_id = data.user_id;
        this.fundForm.patchValue(data);
      });
    }
    this.userService.getAllUsers().subscribe(res => {
      this.users = res;
    });
    this.eventService.getAllEvents().subscribe(res => {
      this.event = res;
    });
  }

  createForm() {
    this.fundForm = this.fb.group({
      user_id: [this.model.user_id, Validators.required],
      purpose: [this.model.purpose, Validators.required],
      amount: [this.model.amount, Validators.min(1)],
      transaction_date: [this.model.transaction_date, Validators.required],
      payment_by: [this.model.payment_by, Validators.required],
      status: [this.model.status],
      cheque_clearance_date: [this.model.cheque_clearance_date],
      cheque_no: [this.model.cheque_no]
    });
  }

  prepareFund(): ExpenceModel {
    const controls = this.fundForm.controls;
    const _fund = new ExpenceModel();
    
    _fund.id = this.fundId;
    _fund.user_id = controls['user_id'].value;
    _fund.purpose = controls['purpose'].value ? controls['purpose'].value : '';
    _fund.amount = controls['amount'].value;
    _fund.transaction_date = this.datePipe.transform(controls['transaction_date'].value, 'yyyy-MM-dd');
    _fund.payment_by = controls['payment_by'].value;
    _fund.cheque_clearance_date = this.datePipe.transform(controls['cheque_clearance_date'].value, 'yyyy-MM-dd');
    _fund.cheque_no = controls['cheque_no'].value;
    _fund.status = controls['status'].value;
    _fund.image = this.files.length > 0 ? this.files[0] : '';
    return _fund;
  }

  ChequeRequired(value) {
    this.payent_by = value.value;
    const cheque_clearance_date = this.fundForm.get('cheque_clearance_date');
    const cheque_no = this.fundForm.get('cheque_no');
    this.fundForm.get('payment_by').valueChanges.subscribe( (mode: string) => {
      if (mode === '2') {
        cheque_clearance_date.setValidators([Validators.required]);
        cheque_no.setValidators([Validators.required]);
      } else {
        cheque_clearance_date.clearValidators();
        cheque_no.clearValidators();
      }
      cheque_clearance_date.updateValueAndValidity();
      cheque_no.updateValueAndValidity();
    });
  }

  onSubmit() {
    this.hasFormErrors = false;
    this.spinner.active = true;
    const controls = this.fundForm.controls;
    let error = 0;
    /** check form */
    if (this.fundForm.invalid) {
      Object.keys(controls).forEach(controlName => {
        controls[controlName].markAsTouched();
        if (controlName === 'event_id' && controls[controlName].status === 'INVALID' && error === 0) {
          this.layoutUtilsService.showActionNotification('Please select event.', 2, 3000, true, false);
          error = 1;
          return false;
        } else if (controlName === 'actual_amount' && error === 0 && controls[controlName].value === 0) {
          this.layoutUtilsService.showActionNotification('Please enter amount.', 2, 3000, true, false);
          error = 1;
          return false;
        } else if (controlName === 'payent_by' && controls[controlName].status === 'INVALID' && error === 0) {
          this.layoutUtilsService.showActionNotification('Please select payment by option.', 2, 3000, true, false);
          error = 1;
          return false;
        }
      });
      this.hasFormErrors = true;
      return;
    }

    const editedFund = this.prepareFund();
    if (editedFund.id > 0) {
      // this.updateFund(editedFund);
    } else {
      this.createFund(editedFund);
    }
  }

  /* updateFund(_fund: ExpenceModel) {
    this.expenceService.updateExpence(_fund).subscribe(res => {
      this.expenceService.getExpencepayById(this.fundId).subscribe(rese => {
        const _fundpay = new ExpencepayModel();
        _fundpay.id = rese[0].id;
        _fundpay.expence_id = this.fundId;
        _fundpay.paid_amount = (_fund.is_installment_available) ? _fund.initial_paid_amount : _fund.actual_amount;
        _fundpay.paid_datetime = _fund.paid_end_date;
        _fundpay.paid_by = _fund.payent_by;
        _fundpay.status = 1;
        this.expenceService.updateExpencepay(_fundpay);
        this.layoutUtilsService.showActionNotification('Modify expence successfully.', 2, 10000, true, false);
        this.router.navigate(['admin/fund']);
      });
    });
  } */

  createFund(_fund: ExpenceModel) {
    this.expenceService.createExpence(_fund).subscribe(res => {
      this.layoutUtilsService.showActionNotification(res['message'], 2, 10000, true, false);
      if (res['success'] === '1') {
        this.router.navigate(['admin/expence']);
      }
    });
  }

  validate(f: NgForm) {
    if (f.form.status === 'VALID') {
      return true;
    }

    this.errors = [];

    if (this.errors.length > 0) {
      this.spinner.active = false;
    }

    return false;
  }

  onAlertClose($user) {
    this.hasFormErrors = false;
  }

  onCancel() {
    this.router.navigate(['admin/expence']);
  }

  paymentmethod() {
    const controls = this.fundForm.controls;
    const Inputmonth = controls['month_duration'].value;
    const dateParts = this.datePipe.transform(new Date(), 'yyyy/MM/dd').split('/');
    const month = this.toInteger(dateParts[1]);
    // tslint:disable-next-line:prefer-const
    let result = new Date();
    result.setMonth(month + (Inputmonth - 1));
    this.date = new Date(result);
  }

  emptyfile() {
    this.files = [];
  }

  toInteger(value: any): number {
    return parseInt(`${value}`, 10);
  }
}
