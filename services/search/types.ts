
export interface SearchResult {
    id: string;
    type: string; // e.g. 'CUSTOMER', 'INVOICE'
    title: string;
    description: string;
    relevance: number;
    link: string;
}

export interface IndexItem {
    id: string;
    text: string; // Tokenized text
    type: string;
    originalObject: any;
}
