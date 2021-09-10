import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator, MatSort, MatDialog, MatSnackBar, PageEvent } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { merge, fromEvent } from 'rxjs';
import { LayoutUtilsUsersService, MessageType } from 'src/app/core/users/utils/layout-utils-users.service';
import { QueryParamsModel } from 'src/app/core/models/query-params.model';

import { FundsDataSource } from 'src/app/core/funds/models/data-source/funds.datasource';
import { FundModel } from 'src/app/core/funds/models/fund.model';
import { FundsService } from 'src/app/core/funds/services';

@Component({
  selector: 'app-fund',
  templateUrl: './fund.component.html',
  styleUrls: ['./fund.component.css']
})
export class FundComponent implements OnInit {

  dataSource: FundsDataSource;
  displayedColumns = [
    'serial_id',
    'user_id',
    'purpose',
    'amount',
    'payment_by',
    'cheque_no',
    'cheque_clearance_date',
    'status',
    'actions'
  ];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  pageEvent: PageEvent;
  // Filter fields
  @ViewChild('searchInput') searchInput: ElementRef;
  filterStatus: string = '';
  filterType: string = '';
  // Selection
  selection = new SelectionModel<FundModel>(true, []);
  usersResult: FundModel[] = [];
  fundpay: any = [];
  pay_amount = 0;
  totalactual_amount = 0;
  UserData: any = [];
  SerialNumber = 1;


  constructor(
    private fundsService: FundsService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private layoutUtilsService: LayoutUtilsUsersService,
    private translate: TranslateService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.UserData = JSON.parse(sessionStorage.getItem('user_data'))._value;
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.loadFundsList();
        })
      )
      .subscribe();

    fromEvent(this.searchInput.nativeElement, 'keyup')
      .pipe(
        // tslint:disable-next-line:max-line-length
        debounceTime(150), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
        distinctUntilChanged(), // This operator will eliminate duplicate values
        tap(() => {
          this.paginator.pageIndex = 0;
          this.loadFundsList();
        })
      )
      .subscribe();

    // Init DataSource
    const queryParams = new QueryParamsModel(this.filterConfiguration(false));
    this.dataSource = new FundsDataSource(this.fundsService);
    // First load
    this.dataSource.loadFunds(queryParams);
    this.dataSource.entitySubject.subscribe(res => {
      this.usersResult = res;
      this.totalactual_amount = 0;
      if (res.length > 0) {
        this.totalactual_amount = res[0]['total_paid_amount'];
      }
    });
  }

  loadFundsList() {
    this.selection.clear();
    const queryParams = new QueryParamsModel(
      this.filterConfiguration(true),
      this.sort.direction,
      this.sort.active,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
    this.dataSource.loadFunds(queryParams);
    this.selection.clear();
  }

  /** FILTRATION */
  filterConfiguration(isGeneralSearch: boolean = true): any {
    const filter: any = {};
    const searchText: string = this.searchInput.nativeElement.value;

    if (this.filterStatus && this.filterStatus.length > 0) {
      filter.status = +this.filterStatus;
    }

    if (this.filterType && this.filterType.length > 0) {
      filter.type = +this.filterType;
    }

    if (!isGeneralSearch) {
      return filter;
    }

    filter.event_id = searchText;
    filter.user_id = searchText;

    return filter;
  }

  /** ACTIONS */
  /** Delete */
  deleteFund(_item: FundModel) {
    const _title: string = this.translate.instant('FUND.DELETE_FUND_SIMPLE.TITLE');
    const _description: string = this.translate.instant('FUND.DELETE_FUND_SIMPLE.DESCRIPTION');
    const _waitDesciption: string = this.translate.instant('FUND.DELETE_FUND_SIMPLE.WAIT_DESCRIPTION');
    const _deleteMessage = this.translate.instant('FUND.DELETE_FUND_SIMPLE.MESSAGE');

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
      const obj = {};
      obj['id'] = _item.id;
      obj['user_id'] = _item.user_id;
      this.fundsService.deleteFund(obj).subscribe(() => {
        this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
        this.loadFundsList();
      });
    });
  }

  deleteFunds() {
    const _title: string = this.translate.instant('FUND.DELETE_FUND_MULTY.TITLE');
    const _description: string = this.translate.instant('FUND.DELETE_FUND_MULTY.DESCRIPTION');
    const _waitDesciption: string = this.translate.instant('FUND.DELETE_FUND_MULTY.WAIT_DESCRIPTION');
    const _deleteMessage = this.translate.instant('FUND.DELETE_FUND_MULTY.DELETE_FUND_MULTY.MESSAGE');

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }

      const idsForDeletion: number[] = [];
      for (let i = 0; i < this.selection.selected.length; i++) {
        idsForDeletion.push(this.selection.selected[i].id);
      }
      this.fundsService.deleteFunds(idsForDeletion).subscribe(() => {
        this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
        this.loadFundsList();
        this.selection.clear();
      });
    });
  }

  /** Fetch */
  fetchFunds() {
    const messages = [];
    this.selection.selected.forEach(elem => {
      messages.push({
        // text: `${elem.month_duration} Month duration in finish ${elem.initial_paid_amount} amount`
        /* id: elem.id.toString(),
        status: elem.status */
      });
    });
    this.layoutUtilsService.fetchElements(messages);
  }

  /** Update Status */
  updateStatusForFunds() {
    const _title = this.translate.instant('FUND.UPDATE_STATUS.TITLE');
    const _updateMessage = this.translate.instant('FUND.UPDATE_STATUS.MESSAGE');
    const _statuses = [{ value: 2, text: 'Pending' }, { value: 0, text: 'Remaining' }, { value: 1, text: 'Completed' }];
    const _messages = [];
    const _fund = [];
    const _chnagefund = [];

    this.selection.selected.forEach(elem => {
      _messages.push({
        /* text: `${elem.event_id}, ${elem.user_id}`,
        id: elem.id.toString(),
        status: elem.status,
        statusTitle: this.getItemStatusString(elem.status),
        statusCssClass: this.getItemCssClassByStatus(elem.status) */
      });
      _fund.push(elem);
    });

    const dialogRef = this.layoutUtilsService.updateStatusForUsers(_title, _statuses, _messages);
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        this.selection.clear();
        return;
      }
      _fund.forEach(element => {
        // console.log(element);
        const _newfund = new FundModel();
        _newfund.id = element.id;
        _newfund.user_id = element.user_id;
        _newfund.purpose = element.purpose;
        _newfund.payment_by = element.payent_by;
        _newfund.status = res;
        if (res == 1) {
          _newfund.amount = element.amount;
        } else {
        }
        this.fundsService.updateFund(_newfund).subscribe(responce => {
          this.layoutUtilsService.showActionNotification(_updateMessage, MessageType.Update);
          this.loadFundsList();
          this.selection.clear();
        });
      });
      
      this.fundsService.updateStatusForFund(_chnagefund, +res).subscribe(() => {
        const status = res === 0 ? 'Remaining' : res === 1 ? 'Completed' : 'Pending';
        this.layoutUtilsService.showActionNotification(_updateMessage, MessageType.Update);
        this.loadFundsList();
        this.selection.clear();
      });
    });
  }

  addFund() {
    const newFund = new FundModel();
    newFund.clear(); // Set all defaults fields
    this.editFund(newFund);
  }

  /** Edit */
  editFund(fund: FundModel) {
    let saveMessageTranslateParam = 'FUND.EDIT.';
    saveMessageTranslateParam += fund.id > 0 ? 'UPDATE_MESSAGE' : 'ADD_MESSAGE';
    const _saveMessage = this.translate.instant(saveMessageTranslateParam);
    const _messageType = fund.id > 0 ? MessageType.Update : MessageType.Create;
    localStorage.removeItem('editFundId');
    if (fund.id !== 0) {
      localStorage.setItem('editFundId', '' + fund.id);
    }

    fund.id > 0 ? this.router.navigate(['admin/fund/addedit', fund.id]) : this.router.navigate(['admin/fund/addedit']);
  }

  previewFund(fund: FundModel) {
    let saveMessageTranslateParam = 'FUND.EDIT.';
    saveMessageTranslateParam += fund.id > 0 ? 'UPDATE_MESSAGE' : 'ADD_MESSAGE';
    const _saveMessage = this.translate.instant(saveMessageTranslateParam);
    const _messageType = fund.id > 0 ? MessageType.Update : MessageType.Create;
  }

  payFund(fund: FundModel) {
    let saveMessageTranslateParam = 'FUND.EDIT.';
    saveMessageTranslateParam += fund.id > 0 ? 'UPDATE_MESSAGE' : 'ADD_MESSAGE';
    const _saveMessage = this.translate.instant(saveMessageTranslateParam);
    const _messageType = fund.id > 0 ? MessageType.Update : MessageType.Create;
  }

  /** SELECTION */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.usersResult.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.selection.selected.length === this.usersResult.length) {
      this.selection.clear();
    } else {
      this.usersResult.forEach(row => this.selection.select(row));
    }
  }

  /** UI */
  getItemCssClassByStatus(status: number = 0): string {
    switch (status) {
      case 0:
        return 'metal';
      case 1:
        return 'success';
      case 2:
        return 'danger';
    }
    return '';
  }

  getItemStatusString(status: number = 0): string {
    switch (status) {
      case 0:
        return 'Remaining';
      case 1:
        return 'Completed';
      case 2:
        return 'Pending';
    }
    return '';
  }

  getItemCssClassByType(status: number = 0): string {
    switch (status) {
      case 0:
        return 'accent';
      case 1:
        return 'primary';
      case 2:
        return '';
    }
    return '';
  }

  getItemPayentByTypeString(status): string {
    const type = Number(status);
    switch (type) {
      case 1:
        return 'Cash';
      case 2:
        return 'Cheque';
    }
    return '';
  }

  getItemStatusStering(status) {
    const type = Number(status);
    switch (type) {
      case 0:
        return 'Remaining';
      case 1:
        return 'Completed';
      case 2:
        return 'Pending';
    }
    return '';
  }

  remaining_amount(user) {
    return user.actual_amount;
  }

  SetPagination(PageDetail) {
    // console.log(PageDetail);
    // this.SerialNumber = PageDetail.length - (PageDetail.pageIndex) * (PageDetail.pageSize);
    this.SerialNumber = (PageDetail.pageIndex) * (PageDetail.pageSize);
    if (PageDetail.pageIndex === 0) {
      this.SerialNumber = 1;
    } else {
      this.SerialNumber = this.SerialNumber + 1;
    }
    // if (PageDetail.pageIndex > 0) {
    //   this.SerialNumber = this.SerialNumber - 1;
    // } else {
    //   this.SerialNumber = PageDetail.length;
    // }
  }

}
