import { formatCurrency } from '@/lib/utils';

interface POSReceiptData {
  id: number;
  customerName?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  vatAmount: number;
  total: number;
  paymentMethod: string;
  paymentAmount: number;
  changeAmount?: number;
  reference?: string;
  cashierName?: string;
  terminalId?: string;
}

export function printPOSReceipt(receiptData: POSReceiptData) {
  const currentDate = new Date().toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const currentTime = new Date().toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>POS Receipt #${receiptData.id}</title>
          <style>
            @media print {
              body { margin: 0; padding: 10px; }
              .no-print { display: none; }
            }
            body {
              font-family: 'Courier New', monospace;
              max-width: 300px;
              margin: 0 auto;
              padding: 15px;
              background: white;
              line-height: 1.3;
              font-size: 12px;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed #333;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .company-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 3px;
            }
            .receipt-title {
              font-size: 14px;
              font-weight: bold;
              margin: 8px 0;
            }
            .receipt-info {
              margin-bottom: 15px;
              font-size: 11px;
            }
            .items-section {
              border-bottom: 1px dashed #333;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .item-desc {
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-right: 10px;
            }
            .item-qty-price {
              text-align: right;
              min-width: 80px;
            }
            .totals-section {
              margin: 10px 0;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .total-row.final {
              font-weight: bold;
              font-size: 14px;
              border-top: 1px solid #333;
              padding-top: 5px;
              margin-top: 5px;
            }
            .payment-section {
              border-top: 1px dashed #333;
              padding-top: 10px;
              margin-top: 15px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px dashed #333;
              font-size: 10px;
            }
            .thank-you {
              font-weight: bold;
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">TAXNIFY POS</div>
            <div style="font-size: 11px;">Business Management Platform</div>
            <div class="receipt-title">SALES RECEIPT</div>
          </div>
          
          <div class="receipt-info">
            Receipt #: ${receiptData.id.toString().padStart(4, '0')}<br>
            Date: ${currentDate} ${currentTime}<br>
            ${receiptData.customerName ? `Customer: ${receiptData.customerName}<br>` : 'Walk-in Customer<br>'}
            ${receiptData.cashierName ? `Cashier: ${receiptData.cashierName}<br>` : ''}
            ${receiptData.terminalId ? `Terminal: ${receiptData.terminalId}` : ''}
          </div>
          
          <div class="items-section">
            ${receiptData.items.map(item => `
              <div class="item-row">
                <div class="item-desc">${item.description}</div>
                <div class="item-qty-price">${formatCurrency(item.lineTotal)}</div>
              </div>
              <div style="font-size: 10px; color: #666; margin-bottom: 3px;">
                ${item.quantity} x ${formatCurrency(item.unitPrice)}
              </div>
            `).join('')}
          </div>
          
          <div class="totals-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(receiptData.subtotal)}</span>
            </div>
            <div class="total-row">
              <span>VAT (15%):</span>
              <span>${formatCurrency(receiptData.vatAmount)}</span>
            </div>
            <div class="total-row final">
              <span>TOTAL:</span>
              <span>${formatCurrency(receiptData.total)}</span>
            </div>
          </div>
          
          <div class="payment-section">
            <div class="total-row">
              <span>${receiptData.paymentMethod.toUpperCase()}:</span>
              <span>${formatCurrency(receiptData.paymentAmount)}</span>
            </div>
            ${receiptData.changeAmount && receiptData.changeAmount > 0 ? `
            <div class="total-row">
              <span>CHANGE:</span>
              <span>${formatCurrency(receiptData.changeAmount)}</span>
            </div>
            ` : ''}
            ${receiptData.reference ? `
            <div style="font-size: 10px; margin-top: 5px;">
              Ref: ${receiptData.reference}
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <div class="thank-you">Thank you for your purchase!</div>
            <div>Please retain this receipt</div>
            <div>for your records</div>
            <div style="margin-top: 10px; font-size: 9px;">
              Powered by Taxnify POS
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}