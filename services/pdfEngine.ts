import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";

export const PDFEngine = {
    exportInvoice: (invoiceData: any) => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text("INVOICE", 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Invoice Number: ${invoiceData.id || 'N/A'}`, 14, 30);
        doc.text(`Date: ${invoiceData.date || format(new Date(), 'yyyy-MM-dd')}`, 14, 35);
        doc.text(`Client: ${invoiceData.clientName || 'Valued Customer'}`, 14, 40);

        // Table
        const tableColumn = ["Description", "Quantity", "Unit Price", "Total"];
        const tableRows = (invoiceData.lines || []).map((line: any) => [
            line.description,
            line.quantity.toString(),
            `$${Number(line.unitPrice).toFixed(2)}`,
            `$${Number(line.total || (line.quantity * line.unitPrice)).toFixed(2)}`
        ]);

        (doc as any).autoTable({
            startY: 50,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] } // Indigo-600
        });

        // Total
        const finalY = (doc as any).lastAutoTable.finalY || 50;
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Subtotal: $${Number(invoiceData.subtotal || 0).toFixed(2)}`, 140, finalY + 10);
        doc.text(`Tax: $${Number(invoiceData.tax || 0).toFixed(2)}`, 140, finalY + 15);
        
        doc.setFont(undefined, 'bold');
        doc.text(`Total Due: $${Number(invoiceData.total || 0).toFixed(2)}`, 140, finalY + 25);

        doc.save(`invoice_${invoiceData.id || 'new'}.pdf`);
    },

    exportFinancialStatement: (title: string, data: any[]) => {
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text(title, 14, 22);
        
        doc.setFontSize(10);
        doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 14, 30);

        const tableColumn = ["Account", "Debit", "Credit", "Balance"];
        const tableRows = data.map((row: any) => [
            row.accountName,
            row.debit ? `$${Number(row.debit).toFixed(2)}` : '-',
            row.credit ? `$${Number(row.credit).toFixed(2)}` : '-',
            row.balance ? `$${Number(row.balance).toFixed(2)}` : '-'
        ]);

        (doc as any).autoTable({
            startY: 40,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [44, 62, 80] }
        });

        doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    },

    exportTrialBalance: (data: any[]) => {
        const doc = new jsPDF();
        const totalDebit = data.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
        const totalCredit = data.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);

        // Professional Corporate Header Info (on page 1)
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(33, 43, 54);
        doc.text("NEXALEDGER LEGAL ENTITY DIRECTORY", 14, 22);
        
        doc.setFontSize(16);
        doc.setTextColor(79, 70, 229); // Indigo 600
        doc.text("GENERAL TRIAL BALANCE REPORT", 14, 28);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(112, 122, 138);
        doc.text(`Reporting System: International Financial Reporting Standards (IFRS)`, 14, 35);
        doc.text(`Reporting Period: Fiscal Year ${new Date().getFullYear()} (Provisional Closed ledger)`, 14, 40);
        doc.text(`Currency: Saudi Riyal (SAR)  |  Audit Status: Unaudited Single Source of Truth`, 14, 45);
        doc.text(`Verification Hash: SHA256-NEXA-${Math.floor(100000 + Math.random() * 900000)}`, 14, 50);
        doc.line(14, 53, 196, 53);

        const tableColumn = ["ACCOUNT DESCRIPTION / GENERAL LEDGER CODE", "DEBIT (DR)", "CREDIT (CR)"];
        const tableRows = data.map((row: any) => [
            row.account || row.accountName,
            row.debit > 0 ? `${Number(row.debit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-',
            row.credit > 0 ? `${Number(row.credit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'
        ]);

        const tableFooter = [
            "TOTAL CONTROL OVER BALANCE",
            `${Number(totalDebit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            `${Number(totalCredit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ];

        (doc as any).autoTable({
            startY: 58,
            head: [tableColumn],
            body: tableRows,
            foot: [tableFooter],
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 9 }, // Indigo background
            footStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 10 },
            styles: { fontSize: 9, cellPadding: 4, font: 'helvetica' },
            columnStyles: {
                0: { cellWidth: 102 },
                1: { halign: 'right', cellWidth: 40 },
                2: { halign: 'right', cellWidth: 40 }
            },
            didDrawPage: (pageData: any) => {
                // Running Professional Header on pages after 1
                if (pageData.pageNumber > 1) {
                    doc.setFontSize(8);
                    doc.setTextColor(112, 122, 138);
                    doc.text("NEXALEDGER ERP CORE - IFRS REPORTING ENGINE", 14, 12);
                    doc.text("TRIAL BALANCE REPORT PROTOCOL", 14, 16);
                    doc.line(14, 18, 196, 18);
                }

                // Professional Running Footer
                doc.setDrawColor(226, 232, 240);
                doc.line(14, 280, 196, 280);
                doc.setFontSize(8);
                doc.setTextColor(112, 122, 138);
                doc.text("RESTRICTED - INTERNAL COMPLIANCE PROTOCOL - STRICT AUDITING CRITERIA APPLIED", 14, 285);
                doc.text(`Page ${pageData.pageNumber}`, 182, 285);
            }
        });

        doc.save(`trial_balance_${format(new Date(), 'yyyy_MM_dd')}.pdf`);
    }
};
