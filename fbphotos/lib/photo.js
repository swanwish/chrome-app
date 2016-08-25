var Photo = (function () {
    var api = {
        getBlobUri: function (url, callback) {
            Ajax.ajaxSend(url, "blob",
                function (status, response) {
                    callback(URL.createObjectURL(response));
                });
        }
    };
    return api;
})();
