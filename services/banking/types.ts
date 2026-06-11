
import { BankAccount, BankTransaction } from '../core/types';

export type { BankAccount, BankTransaction };

export interface CreateBankAccountDTO {
    name: string;
    accountNumber: string;
    bankName: string;
    currency: string;
    glAccountId: string;
    initialBalance?: number;
}
