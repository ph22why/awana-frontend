@echo off
chcp 65001
echo ====================================
echo MongoDB Data Structure Check
echo ====================================
echo.

cd /d "%~dp0"

echo Checking MongoDB container status...
docker ps --filter "name=mongodb" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo Connecting to MongoDB and checking databases...
echo.

docker exec -it awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "
console.log('=== Available Databases ===');
db.adminCommand('listDatabases').databases.forEach(function(db) {
    console.log('Database: ' + db.name + ' (Size: ' + (db.sizeOnDisk/(1024*1024)).toFixed(2) + ' MB)');
});

console.log('\n=== Checking awana database ===');
use awana;
console.log('Collections in awana database:');
db.getCollectionNames().forEach(function(collection) {
    const count = db.getCollection(collection).countDocuments();
    console.log('- ' + collection + ': ' + count + ' documents');
});

console.log('\n=== Sample data from each collection ===');
if (db.events.countDocuments() > 0) {
    console.log('\nSample Event:');
    console.log(JSON.stringify(db.events.findOne(), null, 2));
}

if (db.churches.countDocuments() > 0) {
    console.log('\nSample Church:');
    console.log(JSON.stringify(db.churches.findOne(), null, 2));
}

if (db.receipts.countDocuments() > 0) {
    console.log('\nSample Receipt:');
    console.log(JSON.stringify(db.receipts.findOne(), null, 2));
}

console.log('\n=== Checking other databases ===');
['event-service', 'church-service', 'receipt-service'].forEach(function(dbName) {
    use(dbName);
    const collections = db.getCollectionNames();
    if (collections.length > 0) {
        console.log('\nCollections in ' + dbName + ':');
        collections.forEach(function(collection) {
            const count = db.getCollection(collection).countDocuments();
            console.log('- ' + collection + ': ' + count + ' documents');
        });
    } else {
        console.log('\n' + dbName + ': No collections found');
    }
});
"

echo.
echo Data check completed!
pause 