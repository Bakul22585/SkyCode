import { BaseModel } from './_base.model';

export class FundModel extends BaseModel {
	id: number;
	user_id: string;
	purpose: string;
	amount: number;
	paid_end_date: Date;
	payment_by: number;
	cheque_no: number;
	cheque_clearance_date: any;
	status: number;
	created_date: Date;
	updated_date: Date;
	created_by: number;
	updated_by: number;
	image: any;
	cheque_clear: any;
	transaction_date: any;

	clear() {
		this.user_id = '';
		this.purpose = '';
		this.paid_end_date = new Date();
		this.cheque_clearance_date = new Date();
		this.status = 0;
		this.cheque_no = 0;
		this.created_date = new Date();
		this.updated_date = new Date();
		this.created_by = 0;
		this.updated_by = 0;
	}
}
