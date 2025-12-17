# WhatsApp API Server Setup Guide

This server enables automated WhatsApp messaging for Vardhaman Financial Services.

## Prerequisites

1. **Node.js** (version 16 or higher)
2. **Chrome/Chromium** browser installed
3. **WhatsApp account** (dedicated number recommended)

## Installation

1. Navigate to the whatsapp-server directory:
```bash
cd whatsapp-server
```

2. Install dependencies:
```bash
npm install
```

## Running the Server

1. Start the server:
```bash
npm start
```

2. The server will start on `http://localhost:3001`

3. Check the console for QR code generation

## First Time Setup

1. **Start the server** - it will generate a QR code
2. **Open WhatsApp** on your phone
3. **Go to Settings > Linked Devices**
4. **Scan the QR code** displayed in the console or via API
5. **Server will authenticate** and be ready to send messages

## API Endpoints

### Check Status
```
GET /api/whatsapp/status
```

### Get QR Code
```
GET /api/whatsapp/qr-code
```

### Send Single Message
```
POST /api/whatsapp/send-message
{
  "phone": "919876543210",
  "message": "Your message here"
}
```

### Send Bulk Messages
```
POST /api/whatsapp/send-bulk
{
  "contacts": [
    {"phone": "919876543210", "name": "John Doe"},
    {"phone": "919876543211", "name": "Jane Smith"}
  ],
  "message": "Your message here"
}
```

## Environment Variables

Create a `.env` file in the whatsapp-server directory:

```env
PORT=3001
NODE_ENV=production
```

## Frontend Configuration

In your React app, create a `.env` file:

```env
REACT_APP_WHATSAPP_API_URL=http://localhost:3001/api/whatsapp
```

## Production Deployment

### Using PM2 (Recommended)

1. Install PM2:
```bash
npm install -g pm2
```

2. Start with PM2:
```bash
pm2 start server.js --name "whatsapp-api"
```

3. Save PM2 configuration:
```bash
pm2 save
pm2 startup
```

### Using Docker

1. Create Dockerfile:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

2. Build and run:
```bash
docker build -t whatsapp-api .
docker run -p 3001:3001 whatsapp-api
```

## Security Considerations

1. **Use HTTPS** in production
2. **Add authentication** to API endpoints
3. **Rate limiting** to prevent abuse
4. **Firewall rules** to restrict access
5. **Dedicated WhatsApp number** for business use

## Troubleshooting

### Common Issues

1. **QR Code not generating**
   - Check if Chrome/Chromium is installed
   - Ensure sufficient system resources
   - Check console for errors

2. **Authentication fails**
   - Clear browser data and restart
   - Use a fresh WhatsApp number
   - Check internet connection

3. **Messages not sending**
   - Verify phone number format
   - Check WhatsApp connection status
   - Ensure recipient has WhatsApp

### Logs

Check server logs for detailed error information:
```bash
# If using PM2
pm2 logs whatsapp-api

# If running directly
node server.js
```

## Rate Limits

WhatsApp has built-in rate limits:
- **Individual messages**: ~20 messages per minute
- **Bulk messages**: Recommended 2-second delay between messages
- **Daily limits**: Varies by account type

## Support

For technical support, contact the development team or check the WhatsApp Web.js documentation:
- https://wwebjs.dev/
- https://github.com/pedroslopez/whatsapp-web.js