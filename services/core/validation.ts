
/**
 * Enterprise Data Validation Layer
 * Enforces business rules and data integrity before DB operations.
 */

export const Validator = {
    required(value: any, fieldName: string) {
        if (value === undefined || value === null || value === '') {
            throw new Error(`${fieldName} is required.`);
        }
    },

    positive(value: number, fieldName: string) {
        if (typeof value !== 'number' || value < 0) {
            throw new Error(`${fieldName} must be a positive number.`);
        }
    },

    email(email: string) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) {
            throw new Error(`Invalid email address format: ${email}`);
        }
    },

    date(dateStr: string, fieldName: string) {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) {
            throw new Error(`${fieldName} must be a valid date string.`);
        }
    },

    // Enterprise Rule: Prevent modification of closed fiscal periods
    checkFiscalPeriod(date: string, closedUntil?: string) {
        if (closedUntil && new Date(date) <= new Date(closedUntil)) {
            throw new Error(`Cannot modify transactions in a closed fiscal period (Closed until: ${closedUntil})`);
        }
    }
};
