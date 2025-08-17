const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function sendWhatsAppInvoice(recipientPhone, pdfUrl, order) {
    try {
        // Format number
        const phoneString = String(recipientPhone);
        const toNumber = `whatsapp:+${phoneString.replace(/\D/g, '')}`;
        const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

        console.log("PDF Link", pdfUrl);

        // Use the template
        const message = await client.messages.create({
            from: fromNumber,
            to: toNumber,
            contentSid: "HX926c07c1eb333a2dc8b96c7b4dab4f41", // your template SID from Twilio
            contentVariables: JSON.stringify({
                "1": String(order.address.name),   // Dear {{1}}
                "2": String(order._id),           // Order ID: {{2}}
                "3": String(order.totalPrice)     // Total: ₹{{3}}
            }),
            mediaUrl: [pdfUrl]  // attach PDF
        });

        console.log(`WhatsApp template message sent to ${toNumber}: ${message.sid}`);
        return message;
    } catch (error) {
        console.error('WhatsApp send error:', error);
        throw error;
    }
}

module.exports = { sendWhatsAppInvoice };
