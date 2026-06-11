# NEXA ERP - Architectural Debt Ledger

## Wave 1: Foundation Defaults

### UUID Compliance

- `TODO-[DEBT]: Existing default account IDs ('1010', '1200', '2000', '3000', '4000', '5000') in AccountService and Seeder are non-UUIDv7 strings. Need to perform an explicit database migration to convert 'accounts' table and related references to UUIDv7, retaining their codes separately. | owner: AI-Agent | phase:target: Wave 1 Operations`

### Outbox Processing

- `TODO-[DEBT]: Created the outbox_events table and published events from Domains (Sales, Purchasing) to the Outbox via EventBus.publish, but the background consumer loop for the Accounting Core hasn't been implemented yet. It needs to read PENDING events, generate Journal Entries securely, and mark PROCESSED. | owner: AI-Agent | phase:target: Wave 1 Operations`

### HR Domain Biometric Spoofer

- `TODO-[DEBT]: Temporary stub implementation for facial/biometric spoof recognition. | owner: AI-Agent | phase:target: Phase 6`
