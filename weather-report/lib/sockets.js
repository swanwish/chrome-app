var Socket = (function () {
    var activeSockets = [];
    var api = {
        HttpRequest: function () {
        }
    };
    api.HttpRequest.prototype.open = function (method, url) {
        var a = url.match(/^http:\/\/([^/]*)(.*)$/);
        this.host = a[1];
        this.path = a[2];
        this.req = "GET " + this.path + " HTTP/1.1\r\nHost: " +
            this.host + "\r\n\r\n";
    };
    api.HttpRequest.prototype.send = function () {
        var that = this;
        chrome.sockets.tcp.create({},
            function (createInfo) {
                activeSockets[createInfo.socketId] = that;
                chrome.sockets.tcp.connect(createInfo.socketId, that.host, 80,
                    function (result) {
                        if (chrome.runtime.lastError) {
                            if (that.onerror)
                                that.onerror(chrome.runtime.lastError.message);
                        } else {
                            chrome.sockets.tcp.send(createInfo.socketId,
                                str2ab(that.req),
                                function (sendInfo) {
                                });
                        }
                    }
                );
            }
        );
    };
    api.HttpRequest.prototype.receiveData = function (s) {
        console.log("The received data is", s);
        var a = s.split("\r\n");
        var msg;
        if (a.length > 0) {
            if (a[0].indexOf("HTTP/1.1 ") == 0)
                this.statusText = a[0].substr(9);
            else
                this.statusText = a[0];
            this.status = parseInt(this.statusText);
        }
        else {
            this.status = 0;
            this.statusText = null;
        }
        if (this.status == 200) {
            var parts = s.split("\r\n\r\n");
            this.response = parts[1];
            // var n = a[1].indexOf("{");
            // var len = parseInt(a[1], 16);
            // this.response = a[1].substr(n, len);
        } else
            this.response = null;
        console.log('The response is:', this.response);
        if (this.onload)
            this.onload();
    };
    chrome.sockets.tcp.onReceive.addListener(
        function (info) {
            var req = activeSockets[info.socketId];
            if (req) {
                if (info.data)
                    req.receiveData(ab2str(info.data));
                else
                    req.receiveData();
            }
        }
    );
    chrome.sockets.tcp.onReceiveError.addListener(
        function (info) {
            var req = activeSockets[info.socketId];
            if (req && req.onerror)
                req.onerror("Result Code: " + info.resultCode);
        }
    );
    return api;
})();
