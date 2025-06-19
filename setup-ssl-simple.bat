@echo off
chcp 65001

REM Change to the script's directory
cd /d "%~dp0"

echo ====================================
echo Setting up Simple SSL (Dummy Files)
echo ====================================
echo.

echo Creating SSL directories...
if not exist "ssl" mkdir ssl
if not exist "ssl\live" mkdir ssl\live
if not exist "ssl\live\awanaevent.com" mkdir ssl\live\awanaevent.com
if not exist "ssl\www" mkdir ssl\www

echo.
echo Creating dummy SSL certificate files...
echo This will prevent nginx SSL errors and allow HTTP-only operation.
echo.

REM Create dummy private key
echo -----BEGIN PRIVATE KEY----- > ssl\live\awanaevent.com\privkey.pem
echo MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB >> ssl\live\awanaevent.com\privkey.pem
echo UcZHjkAk2xhnyMZpXRJ7B6OQWi3KChK5U8Q8nF7pJ4w4t+nTp1i9MFvCqJeN7g5s >> ssl\live\awanaevent.com\privkey.pem
echo DUMMY-CONTENT-FOR-TESTING-ONLY >> ssl\live\awanaevent.com\privkey.pem
echo -----END PRIVATE KEY----- >> ssl\live\awanaevent.com\privkey.pem

REM Create dummy certificate
echo -----BEGIN CERTIFICATE----- > ssl\live\awanaevent.com\fullchain.pem
echo MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiIMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV >> ssl\live\awanaevent.com\fullchain.pem
echo BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX >> ssl\live\awanaevent.com\fullchain.pem
echo DUMMY-CERTIFICATE-FOR-TESTING-ONLY >> ssl\live\awanaevent.com\fullchain.pem
echo -----END CERTIFICATE----- >> ssl\live\awanaevent.com\fullchain.pem

echo ✅ Dummy SSL files created!
echo.
echo Files created:
echo - ssl\live\awanaevent.com\privkey.pem (dummy)
echo - ssl\live\awanaevent.com\fullchain.pem (dummy)
echo.
echo ⚠️  IMPORTANT: These are dummy files!
echo - HTTPS will NOT work properly
echo - Use HTTP port 8080 for testing: http://awanaevent.com:8080
echo - This prevents nginx SSL configuration errors
echo.
echo For real SSL certificates:
echo 1. Use Let's Encrypt: setup-letsencrypt.bat
echo 2. Or install OpenSSL and run: setup-ssl-selfsigned.bat
echo.
echo Ready to start services!
echo Run: restart-awanaevent-simple.bat
echo.
pause 