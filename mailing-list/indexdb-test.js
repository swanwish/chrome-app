window.onload = function () {
    var db;

    openDatabase();

    function openDatabase() {
        var request = indexedDB.open("db1", 1);
        request.onsuccess = function (event) {
            console.log('on success');
            db = request.result;
            db.onerror = errorHandler;
            showMessage('Database opened', true);
            onDatabaseOpened(db);
        };
        request.onerror = errorHandler;
        request.onupgradeneeded = function (event) {
            console.log('on upgrade needed');
            var db = event.target.result;
            var store = db.createObjectStore("mailing-list", {autoIncrement: true});
            store.createIndex("name-index", "last", {unique: false});
        };
    }

    function onDatabaseOpened(db) {
        // populateData();
        retrieveData();
    }
    
    function populateData() {
        console.log('populate data');
        add({last: "Smith", first: "John"});
        add({last: "Jones", first: "Mary"});
        add({last: "Gonzalez", first: "Sharon"});
    }
    
    function retrieveData() {
        db
            .transaction("mailing-list")
            .objectStore("mailing-list")
            .index("name-index")
            .get("Jones")
            .onsuccess = function (event) {
            console.log("Found: ", event.target.result);
        };
    }

    function add(obj) {
        db
            .transaction("mailing-list", "readwrite")
            .objectStore("mailing-list")
            .add(obj)
            .onsuccess = function (event) {
            console.log('added', obj);
        };
    }
};