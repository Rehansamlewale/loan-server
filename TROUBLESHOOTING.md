# WhatsApp Server Troubleshooting

## QR Code Issues

### Problem: QR Code not appearing quickly

**Solutions:**

1. **Wait 30-60 seconds** - Initial startup can be slow
2. **Check console output** for error messages
3. **Refresh browser** at `http://localhost:3001/qr`
4. **Reset session** if stuck

### Problem: QR Code appears but scanning fails

**Solutions:**

1. **Use fresh QR code** - refresh the page
2. **Check phone connection** - ensure good internet
3. **Try different phone** - some phones have scanning issues
4. **Reset WhatsApp session** - see below

### Problem: "Loading WhatsApp..." stuck

**Solutions:**

1. **Wait longer** - can take up to 2 minutes
2. **Check internet connection**
3. **Restart server** - Ctrl+C then `npm start`
4. **Reset session** - run `reset-session.bat`

## Quick Fixes

### Reset WhatsApp Session
```bash
# Stop server (Ctrl+C)
# Run reset script
reset-session.bat
# Start server again
npm start
```

### Manual Session Reset
```bash
# Stop server
# Delete folders:
rmdir /s /q whatsapp-session
rmdir /s /q .wwebjs_auth
rmdir /s /q .wwebjs_cache
# Start server
npm start
```

### Check Server Status
- **Home page**: `http://localhost:3001/`
- **QR Code**: `http://localhost:3001/qr`
- **API Status**: `http://localhost:3001/api/whatsapp/status`

## Common Error Messages

### "Cannot find module"
```bash
npm install
```

### "Port 3001 already in use"
```bash
# Kill existing process
taskkill /f /im node.exe
# Or change port in server.js
```

### "Authentication failed"
```bash
# Reset session and try again
reset-session.bat
npm start
```

## Performance Tips

### Faster QR Code Generation
1. **Close other Chrome instances**
2. **Free up RAM** (close unnecessary programs)
3. **Use wired internet** (more stable than WiFi)
4. **Disable antivirus** temporarily during setup

### Stable Connection
1. **Keep server running** continuously
2. **Don't restart unnecessarily**
3. **Use dedicated WhatsApp number**
4. **Avoid using WhatsApp Web elsewhere**

## Expected Timeline

- **Server start**: 5-10 seconds
- **QR code generation**: 10-60 seconds
- **After scanning**: 5-15 seconds to connect
- **Total setup time**: 1-3 minutes

## Getting Help

If issues persist:

1. **Check console logs** for specific errors
2. **Try different browser** for QR code page
3. **Use different phone** for scanning
4. **Reset everything** and start fresh

## Success Indicators

You'll know it's working when you see:
```
✅ All dependencies loaded successfully
🚀 Starting WhatsApp Client initialization...
📱 QR Code received! Generating image...
✅ QR Code ready!
🔐 WhatsApp Client authenticated successfully
🎉 WhatsApp Client is ready!
```