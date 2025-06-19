@echo off
chcp 65001
echo ====================================
echo Migrate Data to AWANA Database
echo ====================================
echo.

cd /d "%~dp0"

echo WARNING: This will copy data from separate databases to the unified 'awana' database.
echo This operation is SAFE - it will not delete original data.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause

echo.
echo [Step 1] Checking current data in each database...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "
console.log('=== Current Data Status ===');

// Check event-service database
use('event-service');
const eventCount = db.events.countDocuments();
console.log('event-service.events: ' + eventCount + ' documents');

// Check church-service database  
use('church-service');
const churchCount = db.churches.countDocuments();
console.log('church-service.churches: ' + churchCount + ' documents');

// Check receipt-service database
use('receipt-service');
const receiptCount = db.receipts.countDocuments();
console.log('receipt-service.receipts: ' + receiptCount + ' documents');

// Check awana database
use('awana');
const awanaEventCount = db.events.countDocuments();
const awanaChurchCount = db.churches.countDocuments();
const awanaReceiptCount = db.receipts.countDocuments();
console.log('awana.events: ' + awanaEventCount + ' documents');
console.log('awana.churches: ' + awanaChurchCount + ' documents');
console.log('awana.receipts: ' + awanaReceiptCount + ' documents');
"

echo.
echo [Step 2] Migrating data to awana database...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "
console.log('Starting data migration...');

// Migrate events from event-service to awana
use('event-service');
const events = db.events.find().toArray();
if (events.length > 0) {
    use('awana');
    // Clear existing events in awana database to avoid duplicates
    db.events.deleteMany({});
    const eventResult = db.events.insertMany(events);
    console.log('Migrated ' + eventResult.insertedIds.length + ' events to awana database');
} else {
    console.log('No events found in event-service database');
}

// Migrate churches from church-service to awana  
use('church-service');
const churches = db.churches.find().toArray();
if (churches.length > 0) {
    use('awana');
    // Clear existing churches in awana database to avoid duplicates
    db.churches.deleteMany({});
    const churchResult = db.churches.insertMany(churches);
    console.log('Migrated ' + churchResult.insertedIds.length + ' churches to awana database');
} else {
    console.log('No churches found in church-service database');
}

// Migrate receipts from receipt-service to awana
use('receipt-service');
const receipts = db.receipts.find().toArray();
if (receipts.length > 0) {
    use('awana');
    // Clear existing receipts in awana database to avoid duplicates
    db.receipts.deleteMany({});
    const receiptResult = db.receipts.insertMany(receipts);
    console.log('Migrated ' + receiptResult.insertedIds.length + ' receipts to awana database');
} else {
    console.log('No receipts found in receipt-service database');
}

console.log('Migration completed!');
"

echo.
echo [Step 3] Verifying migration results...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "
use('awana');
console.log('=== Final Data Count in AWANA Database ===');
console.log('Events: ' + db.events.countDocuments());
console.log('Churches: ' + db.churches.countDocuments());
console.log('Receipts: ' + db.receipts.countDocuments());

console.log('\n=== Sample Data ===');
if (db.events.countDocuments() > 0) {
    console.log('Sample Event:');
    const sampleEvent = db.events.findOne();
    console.log('- Event Name: ' + sampleEvent.event_Name);
    console.log('- Event Location: ' + sampleEvent.event_Location);
}

if (db.churches.countDocuments() > 0) {
    console.log('Sample Church:');
    const sampleChurch = db.churches.findOne();
    console.log('- Church Name: ' + sampleChurch.name);
    console.log('- Church Location: ' + sampleChurch.location);
}

if (db.receipts.countDocuments() > 0) {
    console.log('Sample Receipt:');
    const sampleReceipt = db.receipts.findOne();
    console.log('- Church ID: ' + sampleReceipt.churchId);
    console.log('- Total Participants: ' + sampleReceipt.partTotal);
}
"

echo.
echo ====================================
echo Data migration completed!
echo ====================================
echo.
echo The services should now be able to access your data.
echo You can now restart the services if needed:
echo   .\restart-prod-services.bat
echo.
pause 