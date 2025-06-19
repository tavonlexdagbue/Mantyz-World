const EmailJS = require('@emailjs/node');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const client = new EmailJS.default({ private_key: process.env.EMAILJS_PRIVATE_KEY });

    await client.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        from_name: name,
        from_email: email,
        message: message,
      }
    );

    return res.status(200).json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error('EmailJS send error:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};
