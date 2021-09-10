// tslint:disable-next-line:no-shadowed-variable
import { ConfigModel } from '../core/interfaces/config';

// tslint:disable-next-line:no-shadowed-variable
export class MenuConfig implements ConfigModel {
public config: any = {};

	constructor() {
		this.config = {
			header: {
				self: {},
				items: [
				]
			},
			aside: {
				self: {},
				items: [
					{
						title: 'Dashboard',
						desc: 'Some description goes here',
						root: true,
						icon: 'flaticon-line-graph',
						page: '/admin/dashboard',
						translate: 'MENU.DASHBOARD'
					},
					{
						title: 'Users',
						desc: 'Users',
						root: true,
						icon: 'flaticon-users',
						page: '/admin/users',
						translate: 'MENU.USERS'
					},
					{
						title: 'Income',
						desc: 'Income',
						root: true,
						icon: 'flaticon-piggy-bank',
						page: '/admin/fund',
						translate: 'MENU.FUND'
					},
					{
						title: 'Expense',
						desc: 'Expense',
						root: true,
						icon: 'fas fa-money-check-alt',
						page: '/admin/expence',
						translate: 'MENU.EXPENCE'
					}
				]
			}
		}
	}
}
