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
        document.querySelector("#clear").addEventListener("click",
            function () {
                fillForm();
            }
        );
        document.querySelector("#save").addEventListener("click",
            function () {
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
            });
        document.querySelector("#delete").addEventListener("click",
            function () {
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
        );

        document.querySelector("#count").addEventListener("click",
            function () {
                db.transaction("mailing-list")
                    .objectStore("mailing-list")
                    .count()
                    .onsuccess = function (event) {
                    Dialogs.alert(event.target.result + ' objects in database');
                };
            });

        document.querySelector("#search").addEventListener("click",
            function () {
                fillForm();
                search(document.querySelector("#search-key").value, "next", 0);
            }
        );

        document.querySelector("#next").addEventListener("click",
            function () {
                search(document.querySelector("#field-last").value, "next",
                    document.querySelector("#field-primaryKey").value);
            });

        document.querySelector("#prev").addEventListener("click",
            function () {
                search(document.querySelector("#field-last").value, "prev",
                    document.querySelector("#field-primaryKey").value);
            });
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
            } else
                showMessage('Not found');
        };
    }
};
