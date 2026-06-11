
import { Vendor, Bill, BillPayment, BillItem } from '../core/types';

export type { Vendor, Bill, BillPayment, BillItem };

export interface CreateBillDTO {
    vendorId: string;
    billNumber: string;
    date: string;
    dueDate: string;
    items: BillItem[];
}

export interface PayBillDTO {
    billId: string;
    amount: number;
    method: string;
    paymentAccountId: string;
}
