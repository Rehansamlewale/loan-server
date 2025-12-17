# Quick Setup Guide

## Step 1: Install Dependencies

In your terminal, run:

```bash
cd E:\pk\MergeLoan\V\vardhaman\whatsapp-server
npm install
```

**Wait for installation to complete** (this may take 2-3 minutes)

## Step 2: Start the Server

```bash
npm start
```

## Step 3: Authenticate WhatsApp

1. **Look for QR code** in the console output
2. **Open WhatsApp** on your phone
3. **Go to**: Settings → Linked Devices → Link a Device
4. **Scan the QR code** from the console
5. **Wait for "WhatsApp Client is ready!" message**

## Alternative: Use Batch Files (Windows)

1. **Double-click `install.bat`** to install dependencies
2. **Double-click `start.bat`** to start the server

## Troubleshooting

### If you get "Cannot find module" errors:
```bash
npm install --force
```

### If installation fails:
```bash
npm cache clean --force
npm install
```

### If you need to reset WhatsApp authentication:
1. Stop the server (Ctrl+C)
2. Delete the `.wwebjs_auth` folder
3. Start the server again
4. Scan QR code again

## Expected Output

When working correctly, you should see:
```
Starting WhatsApp API Server...
✅ All dependencies loaded successfully
WhatsApp API Server running on port 3001
QR Code received
WhatsApp Client is ready!
```

## Next Steps

Once the server is running and authenticated:
1. Go back to your React app
2. Click "WhatsApp API - Auto Send" button
3. Select contacts and send messages automatically!