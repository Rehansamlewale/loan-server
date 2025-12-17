# WhatsApp Server for Loan Management

A Node.js WhatsApp Web API server for the loan management system.

## Features

- WhatsApp Web integration using whatsapp-web.js
- QR code generation for authentication
- Message sending capabilities
- Contact management
- Session persistence

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Scan the QR code with your WhatsApp mobile app

## Environment Variables

Create a `.env` file with:
```
PORT=3001
NODE_ENV=production
```

## Deployment

This server is designed to be deployed on platforms like Render, Heroku, or similar Node.js hosting services.

## API Endpoints

- `GET /qr` - Get QR code for WhatsApp authentication
- `POST /send-message` - Send WhatsApp message
- `GET /status` - Check WhatsApp connection status
- `GET /contacts` - Get WhatsApp contacts

## Troubleshooting

See TROUBLESHOOTING.md for common issues and solutions.