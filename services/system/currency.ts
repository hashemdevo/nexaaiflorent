
import { DbEngine } from '../core/db';
import { ExchangeRate } from '../core/types';

export const CurrencyService = {
    
    async updateRate(currencyCode: string, rate: number, date: string = new Date().toISOString().split('T')[0]): Promise<ExchangeRate> {
        const existing = await DbEngine.select<ExchangeRate>('exchange_rates', { where: { currencyCode, date } });
        
        if (existing.length > 0) {
            return DbEngine.update<ExchangeRate>('exchange_rates', existing[0].id, { rateToHomeCurrency: rate });
        } else {
            const newRate: ExchangeRate = {
                id: `rate-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                currencyCode,
                rateToHomeCurrency: rate,
                date,
                source: 'Manual'
            };
            return DbEngine.insert('exchange_rates', newRate);
        }
    },

    async getRate(currencyCode: string, date?: string): Promise<number> {
        // In real system, fallback to most recent date if specific date not found
        const targetDate = date || new Date().toISOString().split('T')[0];
        const rates = await DbEngine.select<ExchangeRate>('exchange_rates', { where: { currencyCode, date: targetDate } });
        
        if (rates.length > 0) return rates[0].rateToHomeCurrency;
        
        // Fallback query: most recent rate
        const recent = await DbEngine.select<ExchangeRate>('exchange_rates', { 
            where: { currencyCode },
            orderBy: 'date',
            orderDir: 'desc',
            limit: 1
        });
        
        return recent[0]?.rateToHomeCurrency || 1; // Default to 1 if unknown
    },

    async convert(amount: number, fromCurrency: string, toCurrency: string, date?: string): Promise<number> {
        if (fromCurrency === toCurrency) return amount;
        
        // Assuming Base Currency is the bridge. (e.g. Home Currency = USD)
        // Rate is stored as [Foreign] -> [Home]
        
        const fromRate = await this.getRate(fromCurrency, date); // Amount * fromRate = Home
        const toRate = await this.getRate(toCurrency, date); // Amount * toRate = Home => Amount = Home / toRate
        
        const amountInHome = amount * fromRate;
        return amountInHome / toRate;
    }
};
