import { Component, OnInit, Inject, Output, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import * as _moment from 'moment';
import { CommonModule, DatePipe } from '@angular/common';

import { Subject } from 'rxjs';
import { TypesUtilsService } from 'src/app/core/utils/types-utils.service';
import { LayoutUtilsUsersService, MessageType } from 'src/app/core/users/utils/layout-utils-users.service';
import { MatDialog } from '@angular/material';
import * as $ from 'jquery';

import { UserModel } from '../../../core/users/models/user.model';
import { UsersService } from '../../../core/users/services/users.service';

export class LimitFlat {
	constructor(public name: string) { }
}

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
	selector: 'app-users-edit',
	templateUrl: './users-edit.component.html',
	styleUrls: ['./users-edit.component.css'],
	providers: [
		DatePipe,
		{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
	]
})

export class UsersEditComponent implements OnInit {
	public model: any = UserModel;
	@Output() actionChange = new Subject<string>();
	public loading = false;
	public userId = 0;
	public data: any = [];
	hasFormErrors: boolean = false;
	viewLoading: boolean = true;
	loadingAfterSubmit: boolean = true;
	is_main = false;
	members = false;
	@ViewChild('ref') ref;

	@Input() action: string;

	userForm: FormGroup;
	errors: any = [];
	addUser: any = [];
	files: File[] = [];
	base64textString = [];
	UserImage: any = [];
	Main_MEMBER = 0;
	public main_member: any = [];
	currentData = new Date();

	constructor(
		private userService: UsersService,
		private router: Router,
		private fb: FormBuilder,
		private typesUtilsService: TypesUtilsService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsUsersService,
		public _ref: ChangeDetectorRef,
		private datePipe: DatePipe,
	) { }

	/** LOAD DATA */
	ngOnInit() {
		this.userId = localStorage.getItem('editUserId') ? Number(localStorage.getItem('editUserId')) : 0;
		this.createForm();
		if (Number.isNaN(this.userId)) {
			this.addUser.push({});
			this._ref.detectChanges();
		}

		if (this.userId > 0) {
			this.model = this.userService.getUserById(this.userId).subscribe(data => {
				this.model = data;
				this.main_member.push(data);
				this.userForm.patchValue(data);
				console.log(data);
				this._ref.detectChanges();
			});
		}
	}

	GetMainMember() {
		this.main_member = [];
		this.userService.getUserById(this.Main_MEMBER).subscribe(data => {
			this.model = data;
			this.main_member.push(data);
			this.model.birth_date = this.typesUtilsService.getDateFromString(data.birth_date_str);
			this.userForm.patchValue(data);
			if (this.model.is_main_member == 'Yes') {
				this.members = false;
			} else {
				this.members = true;
			}
	    });
	}

	createForm() {
		this.model.birth_date = this.typesUtilsService.getDateFromString(this.model.birth_date_str);

		this.userForm = this.fb.group({
			first_name: [this.model.first_name, Validators.required],
			middle_name: [this.model.middle_name],
			last_name: [this.model.last_name, Validators.required],
			email: [this.model.email, Validators.email],
			phone_no: [this.model.phone_no, Validators.required],
			birth_date: [this.model.birth_date, Validators.required],
			profile_pic: [this.model.profile_pic],
		});
		this._ref.detectChanges();
	}

	prepareUser(): UserModel {
		const controls = this.userForm.controls;
		const _user = new UserModel();
		if (this.userId) {
			_user.id = this.userId;
		}
		
		_user.user_id = JSON.parse(sessionStorage.getItem('user_data'))._value.id;
		_user.first_name = controls['first_name'].value ? controls['first_name'].value : '';
		_user.middle_name = controls['middle_name'].value ? controls['middle_name'].value : '';
		_user.last_name = controls['last_name'].value ? controls['last_name'].value : '';
		_user.email = controls['email'].value ? controls['email'].value : '';
		_user.phone_no = controls['phone_no'].value;
		_user.birth_date = new Date(this.datePipe.transform(controls['birth_date'].value, 'yyyy/MM/dd'));
		_user.is_active = 1;
		_user.profile_pic = (this.files.length > 0) ? this.files[0] : '';
		return _user;
	}

	onSubmit() {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		const controls = this.userForm.controls;
		let error = 0;
		/** check form */
		if (this.userForm.invalid) {
			Object.keys(controls).forEach(controlName => {
				controls[controlName].markAsTouched();
				if (controlName === 'first_name' && controls[controlName].status === 'INVALID' && error === 0) {
					this.layoutUtilsService.showActionNotification('Please enter first name.', 2, 3000, true, false);
					error = 1;
					return false;
				} else if (controlName === 'last_name' && controls[controlName].status === 'INVALID' && error === 0) {
					this.layoutUtilsService.showActionNotification('Please enter last name.', 2, 3000, true, false);
					error = 1;
					return false;
				} else if (controlName === 'email' && controls[controlName].status === 'INVALID' && error === 0) {
					this.layoutUtilsService.showActionNotification('Please enter phone number.', 2, 3000, true, false);
					error = 1;
					return false;
				} else if (controlName === 'phone_no' && controls[controlName].status === 'INVALID' && error === 0) {
					this.layoutUtilsService.showActionNotification('Please enter phone number.', 2, 3000, true, false);
					error = 1;
					return false;
				} else if (controlName === 'birth_date' && controls[controlName].status === 'INVALID' && error === 0) {
					this.layoutUtilsService.showActionNotification('Please select birth date.', 2, 3000, true, false);
					error = 1;
					return false;
				}
			});
			this.hasFormErrors = true;
			return;
		}

		const editedUser = this.prepareUser();
		// console.log(editedUser);
		if (editedUser.id > 0) {
			this.updateUser(editedUser);
		} else {
			this.createUser(editedUser);
		}
	}

	updateUser(_user: UserModel) {
		$('body').css({ 'overflow': 'hidden' });
		$('#mainloader').removeAttr('style');
		this.userService.updateUser(_user).subscribe(res => {
			/* Server loading imitation. Remove this on real code */
			if (_user.is_main_member == 1) {
				this.GetMainMember();
			}
			this.files = [];
			// tslint:disable-next-line:max-line-length
			this.layoutUtilsService.showActionNotification(res['message'], 2, 3000, true, false);
			// this.router.navigate(['admin/users']);
			$('#mainloader').css({ 'display': 'none' });
			$('body').removeAttr('style');
		});
	}

	createUser(_user: UserModel) {
		this.viewLoading = true;
		this.userService.createUser(_user).subscribe(res => {
			this.layoutUtilsService.showActionNotification(res['message'], 2, 3000, true, false);
			if (res['success'] === '1') {
				this.router.navigate(['admin/users']);
			} else {
				this.layoutUtilsService.showActionNotification(res['message'], 2, 3000, true, false);
			}
		});
	}

	onAlertClose($user) {
		this.hasFormErrors = false;
	}

	onCancel() {
		this.router.navigate(['admin/users']);
	}

	UpdateUserProfilePic() {
		const obj = {};
		obj['id'] = this.userId;
		obj['profile_pic'] = this.files[0];
		obj['user_id'] = this.userId;
		this.userService.UpdateUserProfilePic(obj).subscribe(res => {
			this.files = [];
			this.main_member = [];
			this.ngOnInit();
		});
	}
}
