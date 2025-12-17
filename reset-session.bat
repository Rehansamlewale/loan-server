@echo off
echo Resetting WhatsApp Session...
echo.

echo Stopping any running server...
taskkill /f /im node.exe 2>nul

echo Cleaning session data...
if exist "whatsapp-session" (
    rmdir /s /q "whatsapp-session"
    echo ✅ Session folder deleted
) else (
    echo ℹ️ No session folder found
)

if exist ".wwebjs_auth" (
    rmdir /s /q ".wwebjs_auth"
    echo ✅ Auth folder deleted
) else (
    echo ℹ️ No auth folder found
)

if exist ".wwebjs_cache" (
    rmdir /s /q ".wwebjs_cache"
    echo ✅ Cache folder deleted
) else (
    echo ℹ️ No cache folder found
)

echo.
echo ✅ Session reset complete!
echo.
echo Now run: npm start
echo.
pause