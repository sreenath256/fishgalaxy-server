const PDFDocument = require('pdfkit');
const fs = require('fs');

async function generateInvoice(order, user) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const fileName = `invoice_${order._id}.pdf`;
      const filePath = `./temp_invoices/${fileName}`;
      
      // Ensure temp directory exists
      if (!fs.existsSync('./temp_invoices')) {
        fs.mkdirSync('./temp_invoices');
      }
      
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Add header with logo and company info
      doc.image('./assets/logo.png', 50, 45, { width: 50 });
      doc
        .fontSize(20)
        .text('Fish Gallexy', 110, 50)
        .fontSize(10)
        .text('123 Business Street', 110, 75)
        .text('City, State 100001', 110, 90)
        .text('GSTIN: XXXXXXXXXXXXXX', 110, 105)
        .moveDown();

      // Invoice title and details
      doc
        .fontSize(16)
        .text('TAX INVOICE', { align: 'center' })
        .moveDown()
        .fontSize(10)
        .text(`Invoice #: ${order._id}`, { align: 'right' })
        .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' })
        .moveDown();

      // Bill to section
      doc
        .fontSize(12)
        .text('Bill To:', 50, 180)
        .fontSize(10)
        .text(user.name, 50, 200)
        .text(user.shopName || '', 50, 215)
        .text(user.address, 50, 230)
        .text(`Pincode: ${user.pincode}`, 50, 245)
        .text(`Mobile: ${user.mobile}`, 50, 260)
        .moveDown();

      // Table header
      let y = 300;
      doc
        .fontSize(10)
        .text('S.No', 50, y)
        .text('Product', 120, y)
        .text('Price', 350, y, { width: 60, align: 'right' })
        .text('Qty', 420, y, { width: 50, align: 'right' })
        .text('Amount', 480, y, { width: 70, align: 'right' })
        .moveTo(50, y + 20)
        .lineTo(550, y + 20)
        .stroke();

      // Table rows
      y += 30;
      order.products.forEach((item, index) => {
        doc
          .text(`${index + 1}`, 50, y)
          .text(item.name || 'Product', 120, y)
          .text(`${item.offer.toFixed(2)}`, 350, y, { width: 60, align: 'right' })
          .text(`${item.quantity}`, 420, y, { width: 50, align: 'right' })
          .text(`${item.totalPrice.toFixed(2)}`, 480, y, { width: 70, align: 'right' });
        y += 20;
      });

      // Summary
      y += 20;
      doc
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke()
        .text('Subtotal:', 350, y + 10, { width: 60, align: 'right' })
        .text(`${order.subTotal.toFixed(2)}`, 480, y + 10, { width: 70, align: 'right' })
        .text('Tax (0%):', 350, y + 30, { width: 60, align: 'right' })
        .text(`${order.tax.toFixed(2)}`, 480, y + 30, { width: 70, align: 'right' })
        .font('Helvetica-Bold')
        .text('Total:', 350, y + 50, { width: 60, align: 'right' })
        .text(`${order.totalPrice.toFixed(2)}`, 480, y + 50, { width: 70, align: 'right' })
        .font('Helvetica');

      // Footer
      doc
        .fontSize(8)
        .text('Thank you for your business!', 50, 750, { align: 'center' })
   

      doc.end();

      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}


module.exports = {
  generateInvoice,
};


