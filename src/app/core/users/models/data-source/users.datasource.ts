import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { UsersService } from '../../services/index';
import { QueryParamsModel } from '../query-models/query-params.model';
import { BaseDataSource } from './_base.datasource';
import { QueryResultsModel } from '../query-models/query-results.model';

export class UsersDataSource extends BaseDataSource {
	constructor(private usersService: UsersService) {
		super();
	}

	loadUsers(
		queryParams: QueryParamsModel
	) {
		this.loadingSubject.next(true);
		this.usersService.findUsers(queryParams).pipe(
			tap(res => {
				this.entitySubject.next(res.items);
				this.paginatorTotalSubject.next(res.totalCount);
			}),
			catchError(err => of(new QueryResultsModel([], err))),
			finalize(() => this.loadingSubject.next(false))
		).subscribe();
	}

	loadUsersWiseFinancialReport(
		queryParams: QueryParamsModel
	) {
		this.loadingSubject.next(true);
		this.usersService.GetUsersWiseFinancialReport(queryParams).pipe(
			tap(res => {
				this.entitySubject.next(res.items);
				this.paginatorTotalSubject.next(res.totalCount);
			}),
			catchError(err => of(new QueryResultsModel([], err))),
			finalize(() => this.loadingSubject.next(false))
		).subscribe();
	}

	loadFamilyWiseFinancialReport(
		queryParams: QueryParamsModel
	) {
		this.loadingSubject.next(true);
		this.usersService.GetFamilyWiseFinancialReport(queryParams).pipe(
			tap(res => {
				this.entitySubject.next(res.items);
				this.paginatorTotalSubject.next(res.totalCount);
			}),
			catchError(err => of(new QueryResultsModel([], err))),
			finalize(() => this.loadingSubject.next(false))
		).subscribe();
	}

	loadEventWiseFinancialReport(
		queryParams: QueryParamsModel
	) {
		this.loadingSubject.next(true);
		this.usersService.GetEventWiseFinancialReport(queryParams).pipe(
			tap(res => {
				this.entitySubject.next(res.items);
				this.paginatorTotalSubject.next(res.totalCount);
			}),
			catchError(err => of(new QueryResultsModel([], err))),
			finalize(() => this.loadingSubject.next(false))
		).subscribe();
	}

	loadUserDetailsFinancialReport(
		queryParams: QueryParamsModel
	) {
		this.loadingSubject.next(true);
		this.usersService.GetUserDetailsFinancialReport(queryParams).pipe(
			tap(res => {
				this.entitySubject.next(res.items);
				this.paginatorTotalSubject.next(res.totalCount);
			}),
			catchError(err => of(new QueryResultsModel([], err))),
			finalize(() => this.loadingSubject.next(false))
		).subscribe();
	}
}
