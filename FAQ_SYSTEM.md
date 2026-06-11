# Nexa Ledger AI — FAQ & Administration Guide

This FAQ and Administration Guide details core system operations, troubleshooting routines, integration checkpoints, and specific voice-controlled accounting features.

---

## 1. Core Platform & Navigation FAQs

### Q1.1: What is the Nexa Ledger AI?
Nexa Ledger AI is a multi-tenant corporate general ledger ERP designed for SMBs and enterprise clients. It features core double-entry accounting engines, full offline capabilities, role-based access control (RBAC), and deep AI-driven automated bookkeeping and forensics.

### Q1.2: How do I switch between different sectors or industries?
The administrator can change the Tenant's industry configuration inside the **Settings** view or via the global Command Palette (`Ctrl+K` or `Cmd+K`). The interface will automatically load the appropriate stats layouts and industry-specific copilot intelligence.

### Q1.3: How do I customize my bento dashboard layout?
Any user can click the **Customize Layout** button on the top right of the dashboard. This allows dragging and hiding bento grid widgets. The custom layouts are persisted across logins.

---

## 2. Voice-Controlled Journal Entries (STT / Voice AI)

Nexa Ledger AI includes an advanced Speech-to-Text and Natural Language Understanding engine. You can speak to the system to post journal entries hands-free.

### Q2.1: How do I activate voice commands?
To record voice commands:
1. Tap the **Microphone** icon on the AI Input Assistant panel.
2. Grant permission to your microphone when prompted by the browser.
3. Speak your transaction description naturally (e.g., *"Transfer 15,000 SAR from Checking to Salaries expense for Riyadh branch"*).
4. Select **Stop** to trigger the voice pipeline. The model parses your spoken text into debit/credit pairs, matching account codes and amounts instantly.

### Q2.2: What spoken details are required for the AI Auditor?
For optimal auto-matching, speak clearly:
- **Transaction Amount**: Say the amount with currency (e.g., *"Twelve thousand SAR"* or *"5,000 dollars"*).
- **Accounts**: Explicitly mention the target accounts or clear context (e.g., *"Petty cash"*, *"Suppliers invoice pay"*, *"Rental revenue"*).
- **Matching Codes**: You do not have to cite the numeric codes (e.g., `1010` or `5000`); the AI matches descriptions directly to your specific Chart of Accounts.

---

## 3. Offline Capabilities & Client Sync

### Q3.1: How does Nexa support offline operation?
When network connectivity is weak, the platform switches seamlessly to the local cache layer powered by our secure SQLite/LocalStorage sandbox. When connectivity is restored, the service synchronizes dirty documents with the Firestore backend without data loss.

### Q3.2: Can I access documents while offline?
Yes. Secure encryption hashes are stored matching cached documents so that they are decodable and printable even if the browser has no network link.

---

## 4. Troubleshooting & System Logs

### Q4.1: Why do I see a "Muted Index Caution" warning?
This amber alert indicates that Firestore is waiting for initial index creation to complete. It can safely be bypassed; the system automatically falls back to client-side filter sorting in the interim.

### Q4.2: How do I perform system diagnostics?
Navigate to the **System tab** in the Admin Portal and run the **System Diagnostics** suite. This checks database read/write latencies, Gemini API connection, cache eviction, and permission compliance.
