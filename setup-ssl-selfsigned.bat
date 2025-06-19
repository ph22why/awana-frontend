@echo off
chcp 65001

REM Change to the script's directory
cd /d "%~dp0"

echo ====================================
echo Setting up Self-Signed SSL Certificate
echo ====================================
echo.

echo Creating SSL directories...
if not exist "ssl" mkdir ssl
if not exist "ssl\live" mkdir ssl\live
if not exist "ssl\live\awanaevent.com" mkdir ssl\live\awanaevent.com
if not exist "ssl\www" mkdir ssl\www

echo.
echo Generating self-signed SSL certificate for awanaevent.com...
echo.

REM Generate private key
openssl genrsa -out ssl\live\awanaevent.com\privkey.pem 2048

REM Generate certificate signing request
openssl req -new -key ssl\live\awanaevent.com\privkey.pem -out ssl\live\awanaevent.com\cert.csr -subj "/C=KR/ST=Seoul/L=Seoul/O=AWANA/OU=IT/CN=awanaevent.com/emailAddress=admin@awanaevent.com"

REM Generate self-signed certificate
openssl x509 -req -days 365 -in ssl\live\awanaevent.com\cert.csr -signkey ssl\live\awanaevent.com\privkey.pem -out ssl\live\awanaevent.com\fullchain.pem -extensions v3_req -extfile openssl_san.cnf

echo.
echo Creating OpenSSL SAN configuration...
echo [req] > openssl_san.cnf
echo distinguished_name = req_distinguished_name >> openssl_san.cnf
echo req_extensions = v3_req >> openssl_san.cnf
echo. >> openssl_san.cnf
echo [req_distinguished_name] >> openssl_san.cnf
echo. >> openssl_san.cnf
echo [v3_req] >> openssl_san.cnf
echo keyUsage = keyEncipherment, dataEncipherment >> openssl_san.cnf
echo extendedKeyUsage = serverAuth >> openssl_san.cnf
echo subjectAltName = @alt_names >> openssl_san.cnf
echo. >> openssl_san.cnf
echo [alt_names] >> openssl_san.cnf
echo DNS.1 = awanaevent.com >> openssl_san.cnf
echo DNS.2 = www.awanaevent.com >> openssl_san.cnf
echo DNS.3 = localhost >> openssl_san.cnf
echo IP.1 = 127.0.0.1 >> openssl_san.cnf
echo IP.2 = 182.231.199.64 >> openssl_san.cnf

REM Re-generate certificate with SAN
openssl x509 -req -days 365 -in ssl\live\awanaevent.com\cert.csr -signkey ssl\live\awanaevent.com\privkey.pem -out ssl\live\awanaevent.com\fullchain.pem -extensions v3_req -extfile openssl_san.cnf

if exist "ssl\live\awanaevent.com\fullchain.pem" (
    echo.
    echo ✅ SSL Certificate generated successfully!
    echo.
    echo Certificate files:
    echo - Private Key: ssl\live\awanaevent.com\privkey.pem
    echo - Certificate: ssl\live\awanaevent.com\fullchain.pem
    echo.
    echo Certificate details:
    openssl x509 -in ssl\live\awanaevent.com\fullchain.pem -text -noout | findstr "Subject:\|DNS:\|IP:"
    echo.
    echo ⚠️  WARNING: This is a self-signed certificate!
    echo Your browser will show a security warning.
    echo Click "Advanced" and "Proceed to awanaevent.com" to continue.
    echo.
    echo For production, use a real SSL certificate from Let's Encrypt:
    echo https://letsencrypt.org/
    
) else (
    echo ❌ Error: Failed to generate SSL certificate
    echo.
    echo Make sure OpenSSL is installed:
    echo - Download from: https://slproweb.com/products/Win32OpenSSL.html
    echo - Or install via Chocolatey: choco install openssl
    echo - Or install via Git Bash (includes OpenSSL)
)

echo.
echo Cleaning up temporary files...
del openssl_san.cnf 2>nul
del ssl\live\awanaevent.com\cert.csr 2>nul

echo.
pause 