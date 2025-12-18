// WhatsApp API Server
// Run this as a separate Node.js server: node server.js

console.log('Starting WhatsApp API Server...');

try {
    const express = require('express');
    const cors = require('cors');
    const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
    const qrcode = require('qrcode');
    
    console.log('✅ All dependencies loaded successfully');
} catch (error) {
    console.error('❌ Error loading dependencies:', error.message);
    console.log('\n📦 Please run: npm install');
    console.log('Then try: npm start');
    process.exit(1);
}

const express = require('express');
const cors = require('cors');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Log environment info
console.log(`🌍 Environment: ${NODE_ENV}`);
console.log(`🚀 Port: ${PORT}`);

// Memory monitoring
const logMemoryUsage = () => {
    const used = process.memoryUsage();
    const memoryInfo = {
        rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
        heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
        heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
        external: Math.round(used.external / 1024 / 1024 * 100) / 100
    };
    console.log(`💾 Memory Usage: RSS: ${memoryInfo.rss}MB, Heap: ${memoryInfo.heapUsed}/${memoryInfo.heapTotal}MB, External: ${memoryInfo.external}MB`);
    
    // Warning if memory usage is high (approaching 512MB limit)
    if (memoryInfo.rss > 400) {
        console.log(`⚠️ HIGH MEMORY WARNING: ${memoryInfo.rss}MB RSS (limit: 512MB)`);
        
        // Force garbage collection if available
        if (global.gc) {
            console.log('🗑️ Running garbage collection...');
            global.gc();
        }
    }
    
    return memoryInfo;
};

// Log memory usage every 5 minutes
setInterval(logMemoryUsage, 5 * 60 * 1000);

// Initial memory log
logMemoryUsage();

// Middleware - More permissive CORS for development
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'https://yashasavibhava.com',
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'https://localhost:3000'
        ];
        
        // Allow any localhost origin for development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests
app.options('*', cors());

// Debug middleware to log requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    next();
});

// WhatsApp Client
let client;
let isReady = false;
let qrCodeData = null;

// Initialize WhatsApp Client
const initializeWhatsApp = () => {
    console.log('🔄 Initializing WhatsApp Client...');
    
    client = new Client({
        authStrategy: new LocalAuth({
            clientId: "vardhaman-finance",
            dataPath: "./whatsapp-session"
        }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-extensions',
                '--disable-plugins',
                '--disable-default-apps',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-ipc-flooding-protection',
                '--disable-blink-features=AutomationControlled',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                // Memory optimization for Render free tier
                '--memory-pressure-off',
                '--max_old_space_size=400',
                '--disable-background-networking',
                '--disable-background-timer-throttling',
                '--disable-client-side-phishing-detection',
                '--disable-default-apps',
                '--disable-hang-monitor',
                '--disable-popup-blocking',
                '--disable-prompt-on-repost',
                '--disable-sync',
                '--disable-translate',
                '--metrics-recording-only',
                '--no-default-browser-check',
                '--no-first-run',
                '--safebrowsing-disable-auto-update',
                '--disable-features=TranslateUI,BlinkGenPropertyTrees'
            ],
            timeout: 120000,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
        },
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2413.51.html',
        }
    });

    client.on('qr', async (qr) => {
        console.log('📱 QR Code received! Generating image...');
        console.log('🔗 QR String:', qr.substring(0, 50) + '...');
        
        try {
            // Generate QR code data URL with higher quality
            qrCodeData = await qrcode.toDataURL(qr, {
                width: 400,
                margin: 4,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M'
            });
            
            console.log('✅ QR Code ready!');
            console.log('🌐 Open https://loan-server-pfyk.onrender.com/qr in your browser');
            console.log('📱 Or scan the QR code below:');
            
            // Display QR in console
            try {
                const qrTerminal = require('qrcode-terminal');
                qrTerminal.generate(qr, { small: true });
            } catch (e) {
                console.log('💡 Install qrcode-terminal for console QR: npm install qrcode-terminal');
            }
            
            // Set QR expiry timer (QR codes typically expire after 20 seconds)
            setTimeout(() => {
                if (qrCodeData && !isReady) {
                    console.log('⏰ QR Code expired, will generate new one...');
                    qrCodeData = null;
                }
            }, 20000);
            
        } catch (error) {
            console.error('❌ Error generating QR code:', error);
            qrCodeData = null;
        }
    });

    client.on('ready', () => {
        console.log('🎉 WhatsApp Client is ready!');
        console.log('✅ You can now send messages via API');
        isReady = true;
        qrCodeData = null;
    });

    client.on('authenticated', () => {
        console.log('🔐 WhatsApp Client authenticated successfully');
    });

    client.on('auth_failure', (msg) => {
        console.error('❌ Authentication failed:', msg);
        console.log('💡 Clearing session and restarting...');
        isReady = false;
        qrCodeData = null;
        
        // Auto-restart after auth failure
        setTimeout(() => {
            console.log('🔄 Restarting WhatsApp client after auth failure...');
            if (client) {
                client.destroy().then(() => {
                    initializeWhatsApp();
                }).catch(err => {
                    console.error('Error destroying client:', err);
                    initializeWhatsApp();
                });
            }
        }, 5000);
    });

    client.on('disconnected', (reason) => {
        console.log('🔌 WhatsApp Client disconnected:', reason);
        console.log('�  Memory usage at disconnect:', logMemoryUsage());
        isReady = false;
        qrCodeData = null;
        
        // Check if disconnection was due to memory issues
        const memUsage = process.memoryUsage();
        const rssInMB = memUsage.rss / 1024 / 1024;
        
        if (rssInMB > 450) {
            console.log('⚠️ Disconnection likely due to high memory usage. Waiting longer before reconnect...');
            setTimeout(() => {
                if (!isReady) {
                    console.log('🔄 Reinitializing WhatsApp Client after memory cleanup...');
                    // Force garbage collection before restart
                    if (global.gc) global.gc();
                    initializeWhatsApp();
                }
            }, 15000); // Wait 15 seconds for memory cleanup
        } else {
            // Normal reconnect
            setTimeout(() => {
                if (!isReady) {
                    console.log('🔄 Reinitializing WhatsApp Client...');
                    initializeWhatsApp();
                }
            }, 5000);
        }
    });

    client.on('loading_screen', (percent, message) => {
        console.log('⏳ Loading WhatsApp:', percent + '%', message);
    });

    console.log('🚀 Starting WhatsApp Client initialization...');
    client.initialize();
};

// Routes

// Serve QR code page
app.get('/qr', (req, res) => {
    if (isReady) {
        res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>WhatsApp API - Connected</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f0f0f0; }
                        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .success { color: #28a745; }
                        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin: 10px; }
                        .btn:hover { background: #0056b3; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="success">✅ WhatsApp Connected!</h1>
                        <p>Your WhatsApp API is ready to send messages.</p>
                        <a href="/api/whatsapp/status" class="btn">Check API Status</a>
                        <a href="/" class="btn">Back to Home</a>
                    </div>
                </body>
            </html>
        `);
    } else if (qrCodeData) {
        res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>WhatsApp QR Code</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <meta http-equiv="refresh" content="30">
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f0f0f0; }
                        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .qr-code { border: 2px solid #25D366; border-radius: 10px; padding: 20px; margin: 20px 0; background: white; }
                        .btn { background: #25D366; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
                        .btn:hover { background: #1da851; }
                        .steps { text-align: left; margin: 20px 0; }
                        .steps ol { padding-left: 20px; }
                        .steps li { margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>📱 Scan QR Code with WhatsApp</h1>
                        
                        <div class="steps">
                            <h3>How to scan:</h3>
                            <ol>
                                <li>Open <strong>WhatsApp</strong> on your phone</li>
                                <li>Go to <strong>Settings</strong> → <strong>Linked Devices</strong></li>
                                <li>Tap <strong>"Link a Device"</strong></li>
                                <li>Scan the QR code below</li>
                            </ol>
                        </div>
                        
                        <div class="qr-code">
                            <img src="${qrCodeData}" alt="WhatsApp QR Code" style="max-width: 100%; height: auto;">
                        </div>
                        
                        <button onclick="location.reload()" class="btn">🔄 Refresh QR Code</button>
                        <button onclick="checkStatus()" class="btn">✅ Check Connection</button>
                        
                        <p style="font-size: 12px; color: #666; margin-top: 20px;">
                            Page auto-refreshes every 30 seconds
                        </p>
                    </div>
                    
                    <script>
                        function checkStatus() {
                            fetch('/api/whatsapp/status')
                                .then(response => response.json())
                                .then(data => {
                                    if (data.connected) {
                                        alert('✅ Connected! Refreshing page...');
                                        location.reload();
                                    } else {
                                        alert('⏳ Still connecting... Please scan the QR code.');
                                    }
                                })
                                .catch(error => {
                                    console.error('Error:', error);
                                    alert('❌ Error checking status');
                                });
                        }
                        
                        // Auto-check status every 10 seconds
                        setInterval(checkStatus, 10000);
                    </script>
                </body>
            </html>
        `);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>WhatsApp API - Loading</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <meta http-equiv="refresh" content="5">
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f0f0f0; }
                        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #25D366; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 20px auto; }
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>⏳ Loading WhatsApp...</h1>
                        <div class="spinner"></div>
                        <p>Please wait while the QR code is generated...</p>
                        <p>This usually takes 10-30 seconds.</p>
                        <button onclick="location.reload()" class="btn">🔄 Refresh</button>
                        <p style="font-size: 12px; color: #666;">Page auto-refreshes every 5 seconds</p>
                    </div>
                </body>
            </html>
        `);
    }
});

// Check connection status
app.get('/api/whatsapp/status', (req, res) => {
    res.json({
        connected: isReady,
        hasQR: !!qrCodeData,
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    const memoryInfo = logMemoryUsage();
    
    res.status(200).json({
        status: 'healthy',
        whatsapp: isReady ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: memoryInfo,
        memoryWarning: memoryInfo.rss > 400 ? 'HIGH_MEMORY_USAGE' : null
    });
});

// Simple status page
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>WhatsApp API Server</title></head>
            <body style="font-family: Arial; padding: 20px;">
                <h1>📱 WhatsApp API Server</h1>
                <p><strong>Status:</strong> ${isReady ? '✅ Connected' : '⏳ Waiting for authentication'}</p>
                <p><strong>Port:</strong> ${PORT}</p>
                <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
                <hr>
                <h3>Available Endpoints:</h3>
                <ul>
                    <li><a href="/qr">📱 QR Code for Authentication</a></li>
                    <li><a href="/api/whatsapp/status">📊 API Status (JSON)</a></li>
                    <li><a href="/health">🏥 Health Check</a></li>
                </ul>
                <hr>
                <p><em>Server running since: ${new Date().toLocaleString()}</em></p>
            </body>
        </html>
    `);
});

// Get QR code for authentication
app.get('/api/whatsapp/qr-code', (req, res) => {
    if (isReady) {
        res.json({ success: true, message: 'Already connected' });
    } else if (qrCodeData) {
        res.json({ success: true, qrCode: qrCodeData });
    } else {
        res.json({ success: false, message: 'QR code not available yet. Please wait or restart the client.' });
    }
});

// Validate phone number endpoint
app.post('/api/whatsapp/validate-phone', async (req, res) => {
    try {
        if (!isReady) {
            return res.status(400).json({
                success: false,
                error: 'WhatsApp client not ready'
            });
        }

        const { phone } = req.body;
        
        if (!phone) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        // Clean phone number
        const cleanPhone = phone.toString().replace(/[^\d]/g, '');
        const formattedPhone = cleanPhone.includes('@c.us') ? cleanPhone : `${cleanPhone}@c.us`;
        
        console.log(`🔍 Validating phone: ${formattedPhone}`);
        
        // Check if number is registered on WhatsApp
        const isRegistered = await client.isRegisteredUser(formattedPhone);
        
        let contactInfo = null;
        if (isRegistered) {
            try {
                const contact = await client.getContactById(formattedPhone);
                contactInfo = {
                    name: contact.name || contact.pushname || 'Unknown',
                    isMyContact: contact.isMyContact,
                    profilePicUrl: contact.profilePicUrl || null
                };
            } catch (contactError) {
                console.log('Could not get contact info:', contactError.message);
            }
        }
        
        res.json({
            success: true,
            phone: cleanPhone,
            formattedPhone: formattedPhone,
            isRegistered: isRegistered,
            contactInfo: contactInfo,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Phone validation failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Test message endpoint (for debugging)
app.post('/api/whatsapp/test-message', async (req, res) => {
    try {
        if (!isReady) {
            return res.status(400).json({
                success: false,
                error: 'WhatsApp client not ready'
            });
        }

        // Send a test message to yourself (the connected WhatsApp number)
        const testMessage = `🧪 Test message from WhatsApp API\nTime: ${new Date().toLocaleString()}\nServer: Render\nStatus: Connected ✅`;
        
        // Get the current user's WhatsApp ID
        const currentUser = client.info.wid._serialized;
        console.log(`🧪 Sending test message to current user: ${currentUser}`);
        
        const sentMessage = await client.sendMessage(currentUser, testMessage);
        
        res.json({
            success: true,
            messageId: sentMessage.id.id,
            recipient: currentUser,
            timestamp: new Date().toISOString(),
            message: 'Test message sent to your own WhatsApp'
        });

    } catch (error) {
        console.error('❌ Test message failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Reset WhatsApp session (for troubleshooting)
app.post('/api/whatsapp/reset-session', async (req, res) => {
    try {
        console.log('🔄 Resetting WhatsApp session...');
        
        isReady = false;
        qrCodeData = null;
        
        if (client) {
            await client.destroy();
        }
        
        // Wait a moment before reinitializing
        setTimeout(() => {
            initializeWhatsApp();
        }, 2000);
        
        res.json({ 
            success: true, 
            message: 'Session reset initiated. New QR code will be generated shortly.' 
        });
        
    } catch (error) {
        console.error('Error resetting session:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Send single message
app.post('/api/whatsapp/send-message', async (req, res) => {
    try {
        if (!isReady || !client) {
            return res.status(400).json({
                success: false,
                error: 'WhatsApp client not ready or disconnected'
            });
        }

        // Check if client is still connected
        try {
            const state = await client.getState();
            if (state !== 'CONNECTED') {
                console.log(`⚠️ Client state is ${state}, not CONNECTED`);
                isReady = false;
                return res.status(400).json({
                    success: false,
                    error: `WhatsApp client state is ${state}. Please wait for reconnection.`
                });
            }
        } catch (stateError) {
            console.error('❌ Error checking client state:', stateError.message);
            isReady = false;
            return res.status(400).json({
                success: false,
                error: 'WhatsApp client connection lost. Please wait for reconnection.'
            });
        }

        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({
                success: false,
                error: 'Phone number and message are required'
            });
        }

        // Clean and validate phone number
        const cleanPhone = phone.toString().replace(/[^\d]/g, '');
        if (cleanPhone.length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format'
            });
        }

        // Format phone number for WhatsApp
        const formattedPhone = cleanPhone.includes('@c.us') ? cleanPhone : `${cleanPhone}@c.us`;

        console.log(`📤 Attempting to send message to: ${formattedPhone}`);
        console.log(`📝 Message preview: ${message.substring(0, 50)}...`);

        // Check if contact exists first
        try {
            const contact = await client.getContactById(formattedPhone);
            console.log(`👤 Contact found: ${contact.name || contact.pushname || 'Unknown'}`);
        } catch (contactError) {
            console.log(`⚠️ Contact not found, but will try to send anyway: ${contactError.message}`);
        }

        // Send message with retry logic
        let sentMessage;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                attempts++;
                console.log(`📤 Send attempt ${attempts}/${maxAttempts} to ${formattedPhone}`);
                
                sentMessage = await client.sendMessage(formattedPhone, message);
                console.log(`✅ Message sent successfully on attempt ${attempts}`);
                break;
            } catch (sendError) {
                console.error(`❌ Send attempt ${attempts} failed:`, sendError.message);
                
                if (attempts === maxAttempts) {
                    throw sendError;
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        res.json({
            success: true,
            messageId: sentMessage.id.id,
            timestamp: new Date().toISOString(),
            attempts: attempts
        });

    } catch (error) {
        console.error('❌ Error sending message:', error);
        
        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.message.includes('Evaluation failed')) {
            errorMessage = 'WhatsApp Web interface error. Please try again or restart the session.';
        } else if (error.message.includes('Phone number is not a valid')) {
            errorMessage = 'Invalid phone number. Please check the number format.';
        } else if (error.message.includes('Chat not found')) {
            errorMessage = 'Contact not found on WhatsApp. Please verify the phone number.';
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage,
            originalError: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Send bulk messages
app.post('/api/whatsapp/send-bulk', async (req, res) => {
    try {
        if (!isReady) {
            return res.status(400).json({
                success: false,
                error: 'WhatsApp client not ready'
            });
        }

        const { contacts, message } = req.body;

        if (!contacts || !Array.isArray(contacts) || !message) {
            return res.status(400).json({
                success: false,
                error: 'Contacts array and message are required'
            });
        }

        const results = [];

        for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            console.log(`📤 Bulk send ${i + 1}/${contacts.length}: ${contact.name} (${contact.phone})`);
            
            try {
                // Clean and validate phone number
                const cleanPhone = contact.phone.toString().replace(/[^\d]/g, '');
                if (cleanPhone.length < 10) {
                    throw new Error('Invalid phone number format');
                }

                const formattedPhone = cleanPhone.includes('@c.us') ? cleanPhone : `${cleanPhone}@c.us`;
                
                // Send with retry logic
                let sentMessage;
                let attempts = 0;
                const maxAttempts = 2; // Fewer attempts for bulk to avoid delays

                while (attempts < maxAttempts) {
                    try {
                        attempts++;
                        sentMessage = await client.sendMessage(formattedPhone, message);
                        console.log(`✅ Bulk message sent to ${contact.name} on attempt ${attempts}`);
                        break;
                    } catch (sendError) {
                        console.error(`❌ Bulk send attempt ${attempts} failed for ${contact.name}:`, sendError.message);
                        
                        if (attempts === maxAttempts) {
                            throw sendError;
                        }
                        
                        // Short wait before retry
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                
                results.push({
                    contact: contact,
                    success: true,
                    messageId: sentMessage.id.id,
                    attempts: attempts
                });

                // Add delay between messages to avoid rate limiting
                if (i < contacts.length - 1) {
                    console.log(`⏳ Waiting 3 seconds before next message...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }

            } catch (error) {
                console.error(`❌ Failed to send to ${contact.name}:`, error.message);
                
                let errorMessage = error.message;
                if (error.message.includes('Evaluation failed')) {
                    errorMessage = 'WhatsApp Web interface error';
                } else if (error.message.includes('Phone number is not a valid')) {
                    errorMessage = 'Invalid phone number format';
                } else if (error.message.includes('Chat not found')) {
                    errorMessage = 'Contact not found on WhatsApp';
                }
                
                results.push({
                    contact: contact,
                    success: false,
                    error: errorMessage,
                    originalError: error.message
                });
            }
        }

        res.json({
            success: true,
            results: results,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error sending bulk messages:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get chat list
app.get('/api/whatsapp/chats', async (req, res) => {
    try {
        if (!isReady) {
            return res.status(400).json({
                success: false,
                error: 'WhatsApp client not ready'
            });
        }

        const chats = await client.getChats();
        const chatList = chats.slice(0, 20).map(chat => ({
            id: chat.id._serialized,
            name: chat.name,
            isGroup: chat.isGroup,
            lastMessage: chat.lastMessage?.body || '',
            timestamp: chat.timestamp
        }));

        res.json({
            success: true,
            chats: chatList
        });

    } catch (error) {
        console.error('Error getting chats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`WhatsApp API Server running on port ${PORT}`);
    initializeWhatsApp();
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down WhatsApp client...');
    if (client) {
        await client.destroy();
    }
    process.exit(0);
});