@echo off
REM AWANA Project secret variables template
REM Copy this file to secrets\credentials.bat and fill in strong values.

REM MongoDB
set MONGO_INITDB_ROOT_USERNAME=admin
set MONGO_INITDB_ROOT_PASSWORD=change-me
set MONGO_AUTH_DB=admin
set MONGO_EVENT_DB=event-service
set MONGO_CHURCH_DB=church-service
set MONGO_RECEIPT_DB=receipt-service
set MONGO_BT_DB=bt-service

REM MySQL
set MYSQL_ROOT_PASSWORD=change-me
set MYSQL_DATABASE=tntcamp
set MYSQL_USER=tntcamp
set MYSQL_PASSWORD=change-me
set TNTCAMP_DB_PASSWORD=change-me
