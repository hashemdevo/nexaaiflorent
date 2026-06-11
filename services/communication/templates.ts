
export const EmailTemplates = {
    welcome: (name: string, company: string) => `
        <div style="font-family: sans-serif; padding: 20px;">
            <h1>Welcome to Nexa Ledger, ${name}!</h1>
            <p>We are thrilled to have <strong>${company}</strong> on board.</p>
            <p>Your workspace is ready. <a href="#">Login here</a>.</p>
        </div>
    `,

    invoice: (invoiceNumber: string, amount: number, dueDate: string) => `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc;">
            <h2>Invoice #${invoiceNumber}</h2>
            <p>Total Due: <strong>$${amount.toFixed(2)}</strong></p>
            <p>Due Date: ${dueDate}</p>
            <p>Please arrange payment at your earliest convenience.</p>
        </div>
    `,

    alert: (title: string, message: string) => `
        <div style="font-family: sans-serif; padding: 20px; background-color: #fff3cd;">
            <h3 style="color: #856404;">${title}</h3>
            <p>${message}</p>
        </div>
    `
};
