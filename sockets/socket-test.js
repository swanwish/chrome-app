window.onload = function () {
    var req = "GET /data/2.1/find/name?units=imperial&q=Chicago HTTP/1.1\r\n" +
        "Host: api.openweathermap.org\r\n\r\n";
    req = "GET /data/sk/101010100.html HTTP/1.1\r\n"+
            "Host: www.weather.com.cn\r\n\r\n";

    chrome.sockets.tcp.create({},
        function (createInfo) {
            console.log(createInfo.socketId);
            chrome.sockets.tcp.connect(createInfo.socketId,
                "www.weather.com.cn", 80,
                function (result) {
                    if (chrome.runtime.lastError)
                        console.log(chrome.runtime.lastError.message);
                    else {
                        console.log(result);
                        chrome.sockets.tcp.send(createInfo.socketId,
                            str2ab(req),
                            function (sendInfo) {
                                console.log(sendInfo);
                            }
                        );
                    }
                }
            );
        }
    );

    chrome.sockets.tcp.onReceive.addListener(
        function (info) {
            if (info.data)
                console.log(ab2str(info.data));
        });

    function str2ab(str) {
        var encoder = new TextEncoder('utf-8');
        return encoder.encode(str).buffer;
    }

    function ab2str(ab) {
        var dataView = new DataView(ab);
        var decoder = new TextDecoder('utf-8');
        return decoder.decode(dataView);
    }
};