export function estimateEmailTemplate(estimate: any) {
  return {
    subject: `Estimate from ${estimate.businessName || 'Your Business'} - Ref ${estimate.estimateNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Estimate ${estimate.estimateNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .estimate-details { margin-bottom: 30px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Estimate ${estimate.estimateNumber}</h1>
          </div>
          <div class="content">
            <div class="estimate-details">
              <p>Dear ${estimate.customerName || 'Valued Customer'},</p>
              <p>Please find your estimate details below:</p>
              <ul>
                <li><strong>Estimate Number:</strong> ${estimate.estimateNumber}</li>
                <li><strong>Issue Date:</strong> ${estimate.issueDate}</li>
                <li><strong>Total Amount:</strong> ${estimate.total}</li>
              </ul>
              <p>This estimate is valid until ${estimate.expiryDate}.</p>
              <p>If you have any questions, please don't hesitate to contact us.</p>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>${estimate.businessName || 'Your Business'}</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Dear ${estimate.customerName || 'Valued Customer'},

      Please find attached your estimate (#${estimate.estimateNumber}) dated ${estimate.issueDate}, 
      with a total of ${estimate.total}.

      This estimate is valid until ${estimate.expiryDate}.
      
      If you have any questions, please don't hesitate to contact us.
      
      Kind regards,  
      ${estimate.businessName || 'Your Business'}
    `,
  };
}