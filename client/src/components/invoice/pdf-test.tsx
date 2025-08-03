import { jsPDF } from "jspdf";

export function testSimplePDF(): Promise<jsPDF> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Testing simple PDF generation...');
      
      const pdf = new jsPDF();
      
      // Very basic test
      pdf.setFontSize(20);
      pdf.text("Test PDF", 20, 20);
      
      console.log('Simple PDF created successfully');
      resolve(pdf);
    } catch (error) {
      console.error('Simple PDF test failed:', error);
      reject(error);
    }
  });
}