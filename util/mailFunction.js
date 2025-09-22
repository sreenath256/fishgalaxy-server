const mailSender = require("./mailSender");

const sendOTPMail = async (email, otp) => {
    const mailResponse = await mailSender(
        email,
        "Email Verification",
        `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }

            h2 {
              font-weight:500;
              color: #6b7280;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
            }
    
            .logo {
                display: block;
                margin: 0 auto 20px;
            }
    
            .header {
                background-color: #4caf50;
                color: #ffffff;
                padding: 10px 20px;
                border-radius: 5px;
                text-align: left;
            }
    
            .otp-content {
                margin-top: 30px;
                font-size: 18px;
                color: #333;
                text-align: left;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
                padding: 20px;
                border-radius: 5px;
            }

            .otp-nb {
              font-size: 14px;
            }
    
            .otp-code {
                font-size: 24px;
                font-weight: bold;
                color: #4caf50;
            }
    
            .footer {
                margin-top: 30px;
                font-size: 14px;
                color: #555;
                text-align: left;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <h2>ex.iphones.</h2>
            <div class="header">
                <h1>Email Verification</h1>
            </div>
            <div class="otp-content">
                <p>Dear User,</p>
                <p>We have received a request to verify your email address. Please use the following OTP code to complete the verification:</p>
                <p><span class="otp-code">${otp}</span></p>
                <p class="otp-nb">If you didn't request this OTP, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>Best regards,</p>
                <p>ex.iphones</p>
                <p>&copy; 2023 ex.iphones. All rights reserved.</p>
            </div>
        </div>
    </body>
    
    </html>
    
    `
    );
    console.log("Email sent successfully: ", mailResponse);
};

const passwordChangedMail = async (email) => {
    const mailResponse = await mailSender(
        email,
        "Email Verification",
        `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Authentication Notification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }

            
            h2 {
              font-weight:500;
              color: #6b7280;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
            }
    
            .logo {
                display: block;
                margin: 0 auto 20px;
            }
    
            .header {
                background-color: #4caf50;
                color: #ffffff;
                padding: 10px 20px;
                border-radius: 5px;
                text-align: left;
            }
    
            .notification-content {
                margin-top: 30px;
                font-size: 18px;
                color: #333;
                text-align: left;
            }
    
            .footer {
                margin-top: 30px;
                font-size: 14px;
                color: #555;
                text-align: left;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <h2>ex.iphones.</h2>
            <div class="header">
              <h1>Email Authentication Notification</h1>
            </div>
            <div class="notification-content">
              <p>Dear User,</p>
              <p>We want to inform you that your password has been changed. If you did not initiate this change, please contact our customer care immediately.</p>
              <p>Thank you for choosing our services.</p>
            </div>
            <div class="footer">
              <p>Best regards,</p>
              <p>ex.iphones</p>
              <p>&copy; 2023 ex.iphones. All rights reserved.</p>
            </div>
        </div>
    </body>
    
    </html>`
    );
    console.log("Email sent successfully: ", mailResponse);
};




const sendOrderDetailsMail = async (email, order, pdfBuffer) => {
    const mailResponse = await mailSender(
        email,
        "Order Confirmation & Invoice",
        `<!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Details & Invoice</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
  
              h2 {
                  font-weight: 500;
                  color: #6b7280;
              }
      
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
              }
      
              .header {
                  background-color: #4caf50;
                  color: #ffffff;
                  padding: 10px 20px;
                  border-radius: 5px;
                  text-align: left;
              }
      
              .order-details {
                  margin-top: 20px;
                  font-size: 16px;
                  color: #333;
                  text-align: left;
              }
  
              .order-table {
                  width: 100%;
                  margin-top: 20px;
                  border-collapse: collapse;
                  text-align: left;
              }
  
              .order-table th, .order-table td {
                  border: 1px solid #ddd;
                  padding: 8px;
              }
  
              .order-table th {
                  background-color: #f9f9f9;
                  font-weight: bold;
              }
      
              .footer {
                  margin-top: 30px;
                  font-size: 14px;
                  color: #555;
                  text-align: left;
              }
  
              .invoice-link {
                  margin-top: 20px;
                  display: inline-block;
                  background-color: #4caf50;
                  color: #ffffff;
                  padding: 10px 20px;
                  border-radius: 5px;
                  text-decoration: none;
                  font-size: 16px;
              }
          </style>
      </head>
      
      <body>
          <div class="container">
              <h2>Fish Galaxy</h2>
              <div class="header">
                  <h1>Order Confirmation & Invoice</h1>
              </div>
              <div class="order-details">
                  <p>Dear ${order.address.name},</p>
                  <p>Thank you for your order. Here are the details of your purchase:</p>
                  <table class="order-table">
                      <thead>
                          <tr>
                              <th>Product</th>
                              <th>Quantity</th>
                              <th>Price</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${order.products.map(product => `
                              <tr>
                                  <td>${product.productId.name}</td>
                                  <td>${product.quantity}</td>
                                  <td>${product.offer}</td>
                              </tr>
                          `).join('')}
                      </tbody>
                      <tfoot>
                          <tr>
                              <td colspan="2"><strong>Total</strong></td>
                              <td><strong>${order.totalPrice}</strong></td>
                          </tr>
                      </tfoot>
                  </table>
                <p>Your invoice has been attached to this email.</p>
              </div>
              <div class="footer">
                  <p>Best regards,</p>
                  <p>Fish Galaxy</p>
                  <p>&copy; 2025 Fish Galaxy. All rights reserved.</p>
              </div>
          </div>
      </body>
      
      </html>`,

        {
            filename: `invoice-${order._id}.pdf`,
            path: pdfBuffer,  // 👈 use path instead of content            
            contentType: 'application/pdf'
        }
    );
    console.log("Order details email sent successfully: ", mailResponse);
};

module.exports = { sendOTPMail, passwordChangedMail, sendOrderDetailsMail };
