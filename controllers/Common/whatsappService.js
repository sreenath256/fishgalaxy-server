const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function sendWhatsAppInvoice(recipientPhone, pdfUrl, order) {
    try {

        // Convert to string if it isn't already
        const phoneString = String(recipientPhone);

        // Format number (remove non-digits and add whatsapp prefix)
        const toNumber = `whatsapp:+${phoneString.replace(/\D/g, '')}`;

        const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Your Twilio WhatsApp number

        console.log("PDF Link", pdfUrl)

        // Send message
        const message = await client.messages.create({
            body: `📄 *Invoice #${order._id}*\n\n` +
                `Dear ${order.address.name},\n\n` +
                `Your order is confirmed!\n` +
                `Total: ₹${order.totalPrice.toFixed(2)}\n\n` +
                `Thank you for your business!`,
            mediaUrl: [pdfUrl],
            from: fromNumber,
            to: toNumber
        });

        console.log(`WhatsApp message sent to ${toNumber}: ${message.sid}`);
        return message;
    } catch (error) {
        console.error('WhatsApp send error:', error);
        throw error;
    }
}

module.exports = { sendWhatsAppInvoice };