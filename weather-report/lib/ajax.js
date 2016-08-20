var Ajax = (function () {
    var api = {
        ajaxSend: function (url, responseType, successCallback, errorCallback,
                            headers) {
            var req = new XMLHttpRequest();
            req.onload = function (e) {
                successCallback(req.status, req.response);
            };
            req.onerror = errorCallback;
            req.responseType = responseType ? responseType : "text";
            req.open("get", url);
            if (headers)
                for (var v in headers)
                    req.setRequestHeader(v, headers[v]);
            req.send();
        }
    };
    return api;
})();