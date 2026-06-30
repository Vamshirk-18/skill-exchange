const sendEmail = async ({ to, subject, html }) => {
  // Email sending is currently disabled — this is a no-op so the app
  // doesn't crash when swapController tries to send notification emails.
  // Swap requests, scheduling, and chat all work normally without this.
  return;
};

module.exports = sendEmail;
