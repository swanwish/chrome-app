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
            bindEvents();
        };
        request.onerror = errorHandler;
        request.onupgradeneeded = function (event) {
            console.log('on upgrade needed');
            var db = event.target.result;
            var store = db.createObjectStore("mailing-list", {autoIncrement: true});
            store.createIndex("name-index", "last", {unique: false});
        };
    }

    function bindEvents() {
        document.querySelector("#clear").addEventListener("click", clearForm);
        document.querySelector("#save").addEventListener("click", saveRecord);
        document.querySelector("#delete").addEventListener("click", deleteRecord);
        document.querySelector("#count").addEventListener("click", countRecords);
        document.querySelector("#search").addEventListener("click", searchRecords);
        document.querySelector("#next").addEventListener("click", showNext);
        document.querySelector("#prev").addEventListener("click", showPrev);
        document.querySelector("#delete_db").addEventListener("click", deleteDatabase);
        document.querySelector("#import").addEventListener("click", importData);
        document.querySelector("#export").addEventListener("click", exportData);
    }

    function clearForm() {
        fillForm();
    }

    function saveRecord() {
        var store = db
            .transaction("mailing-list", "readwrite")
            .objectStore("mailing-list");
        var object = getForm();
        var key = document.querySelector("#field-primaryKey").value;
        var primaryKey = key ? parseInt(key) : 0;
        if (primaryKey === 0) {
            store
                .add(object)
                .onsuccess = function (event) {
                showMessage('Added', true);
            };
        } else {
            store
                .put(object, primaryKey)
                .onsuccess = function (event) {
                showMessage('Updated', true);
            };
        }
    }

    function deleteRecord() {
        var primaryKey =
            parseInt(document.querySelector("#field-primaryKey").value);
        if (primaryKey > 0) {
            db
                .transaction("mailing-list", "readwrite")
                .objectStore("mailing-list")
                .delete(primaryKey)
                .onsuccess = function (event) {
                fillForm();
                showMessage('Deleted', true);
            };
        }
    }

    function countRecords() {
        db.transaction("mailing-list")
            .objectStore("mailing-list")
            .count()
            .onsuccess = function (event) {
            Dialogs.alert(event.target.result + ' objects in database');
        };
    }

    function searchRecords() {
        fillForm();
        search(document.querySelector("#search-key").value, "next", 0);
    }

    function showNext() {
        search(document.querySelector("#field-last").value, "next",
            document.querySelector("#field-primaryKey").value);
    }

    function showPrev() {
        search(document.querySelector("#field-last").value, "prev",
            document.querySelector("#field-primaryKey").value);
    }

    function deleteDatabase() {
        console.log('d');
        Dialogs.confirm('Delete entire database?', 'Delete', 'Cancel',
            function () {
                fillForm();
                if (db) {
                    db.close();
                    db = null;
                }
                var request = indexedDB.deleteDatabase("db1");
                request.onsuccess = function () {
                    openDatabase();
                };
                request.onerror = errorHandler;
            }
        );
    }

    function importData() {
        chrome.fileSystem.chooseEntry(
            {
                type: 'openFile'
            },
            function (entry) {
                if (entry) {
                    entry.file(
                        function (file) {
                            var reader = new FileReader();
                            reader.onloadend = function () {
                                var objects = JSON.parse(this.result);
                                loadData(objects);
                                showMessage('Opened OK', true);
                            };
                            reader.readAsText(file);
                        },
                        errorHandler
                    );
                }
            }
        );
    }

    function exportData() {
        chrome.fileSystem.chooseEntry(
            {
                type: 'saveFile'
            },
            function (entry) {
                if (entry) {
                    saveToEntry(entry);
                }
            });
    }

    function saveToEntry(entry) {
        entry.createWriter(
            function (fileWriter) {
                fileWriter.onerror = errorHandler;
                fileWriter.onwrite = function () {
                    writeData(fileWriter);
                };
                fileWriter.truncate(0);
            },
            errorHandler
        );
    }

    function writeData(fileWriter) {
        var objects = [];
        db
            .transaction("mailing-list")
            .objectStore("mailing-list")
            .openCursor()
            .onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                objects.push(cursor.value);
                cursor.continue();
            }
            else {
                writeObjects(fileWriter, objects);
            }
        };
    }

    function writeObjects(fileWriter, objects) {
        fileWriter.onwrite = function () {
            showMessage(objects.length + ' objects exported', true);
        };
        fileWriter.onerror = errorHandler;
        fileWriter.write(new Blob([JSON.stringify(objects)]));
    }

    function getForm() {
        return {
            last: document.querySelector("#field-last").value,
            first: document.querySelector("#field-first").value,
            street: document.querySelector("#field-street").value,
            city: document.querySelector("#field-city").value,
            state: document.querySelector("#field-state").value,
            zip: document.querySelector("#field-zip").value,
            email: document.querySelector("#field-email").value
        };
    }

    function fillForm(object, primaryKey) {
        if (!object)
            object = {};
        if (!primaryKey)
            primaryKey = 0;
        document.querySelector("#field-last").value = val(object.last);
        document.querySelector("#field-first").value = val(object.first);
        document.querySelector("#field-street").value = val(object.street);
        document.querySelector("#field-city").value = val(object.city);
        document.querySelector("#field-state").value = val(object.state);
        document.querySelector("#field-zip").value = val(object.zip);
        document.querySelector("#field-email").value = val(object.email);
        document.querySelector("#field-primaryKey").value = primaryKey;
    }

    function val(x) {
        return x ? x : "";
    }

    function search(key, dir, primaryKey) {
        primaryKey = parseInt(primaryKey);
        var range;
        if (dir === "next")
            range = IDBKeyRange.lowerBound(key, false);
        else
            range = IDBKeyRange.upperBound(key, false);
        db
            .transaction("mailing-list")
            .objectStore("mailing-list")
            .index("name-index")
            .openCursor(range, dir)
            .onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                if (primaryKey > 0) {
                    if (primaryKey === cursor.primaryKey)
                        primaryKey = 0;
                    cursor.continue();
                } else {
                    showMessage('');
                    fillForm(cursor.value, cursor.primaryKey);
                }
            } else {
                showMessage('Not found');
            }
        };
    }

    function loadData(objects) {
        var transaction = db.transaction("mailing-list", "readwrite");
        transaction.oncomplete = function (event) {
            showMessage(objects.length + ' objects imported', true);
        };
        var store = transaction.objectStore("mailing-list");
        for (var x of objects)
            store.add(x);
    }

};
