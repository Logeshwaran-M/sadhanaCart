import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_g6trs4g";
const TEMPLATE_ID = "template_j0ed6us";
const PUBLIC_KEY = "BC9CJEdLpemI19ubS";

export const sendOrderEmail = async (order, status) => {
  try {
    let message = "";

    switch (status.toLowerCase()) {
      case "processing":
        message = "🛠 Your order is being processed.";
        break;
      case "shipped":
        message = "🚚 Your order has been shipped.";
        break;
      case "delivered":
        message = "📦 Your order has been delivered.";
        break;
      case "cancelled":
        message = "❌ Your order has been cancelled.";
        break;
      default:
        message = `Order status updated to ${status}`;
    }

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: order.userEmail,
        to_name: order.userName,
        order_id: order._id,
        order_status: status,
        order_status_message: message
      },
      PUBLIC_KEY
    );

    console.log("📧 EmailJS Success:", response);
  } catch (error) {
    console.error("❌ EmailJS Error:", error);
  }
};