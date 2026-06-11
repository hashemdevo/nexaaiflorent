
import { SearchIndexer } from './indexer';
import { SearchResult } from './types';

export const SearchEngine = {
    
    async search(query: string): Promise<SearchResult[]> {
        if (!query || query.length < 2) return [];

        const index = SearchIndexer.getIndex();
        
        // Auto-rebuild if empty (lazy loading)
        if (index.length === 0) {
            await SearchIndexer.buildIndex();
        }

        const terms = query.toLowerCase().split(' ');
        const results: SearchResult[] = [];

        index.forEach(item => {
            let matchScore = 0;
            
            terms.forEach(term => {
                if (item.text.includes(term)) matchScore += 1;
            });

            if (matchScore > 0) {
                let link = '#';
                let title = 'Unknown';
                let description = '';

                if (item.type === 'CUSTOMER') {
                    title = item.originalObject.name;
                    description = item.originalObject.email;
                    link = `/sales/customers/${item.id}`;
                } else if (item.type === 'INVOICE') {
                    title = item.originalObject.invoiceNumber;
                    description = `Amount: $${item.originalObject.totalAmount}`;
                    link = `/sales/invoices/${item.id}`;
                } else if (item.type === 'PRODUCT') {
                    title = item.originalObject.name;
                    description = `SKU: ${item.originalObject.sku}`;
                    link = `/inventory/${item.id}`;
                }

                results.push({
                    id: item.id,
                    type: item.type,
                    title,
                    description,
                    relevance: matchScore,
                    link
                });
            }
        });

        return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
    }
};
