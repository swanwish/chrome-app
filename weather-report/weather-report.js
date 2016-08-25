api_key = "70d6b1551aff945c5c0c8f5e084d3852";
window.onload = function () {
    // var skt = new Socket.HttpRequest();
    // skt = new XMLHttpRequest(); // use the new request
    document.querySelector("#get").addEventListener("click",
        function () {
            getWeather(document.querySelector("#city").value);
        }
    );

    // function getWeather(city) {
    //     var textarea = document.querySelector("#textarea");
    //     textarea.value = "Wait...";
    //     skt.onload = function () {
    //         if (skt.status === 200) {
    //             var obj = JSON.parse(skt.response);
    //             // showMessage(obj.message, true);
    //             textarea.value = formatWeather(obj);
    //         } else
    //             showMessage("Error: " + skt.status);
    //     };
    //     skt.onerror = function (msg) {
    //         showMessage(msg);
    //     };
    //     skt.open("get", "http://api.openweathermap.org/data/2.5/weather" +
    //         "?units=metric&q=" + city + "&APPID=" + api_key);
    //     skt.send();
    // }

    function getWeather(city) {
        var textarea = document.querySelector("#textarea");
        textarea.value = "Wait...";
        Ajax.ajaxSend("http://api.openweathermap.org/data/2.5/weather" +
            "?units=metric&q=" + city + "&APPID=" + api_key, "json",
            function (status, obj) {
                if (status === 200) {
                    showMessage(obj.message, true);
                    textarea.value = formatWeather(obj);
                    showNotification('weather.png', 'Notification', 'Success');
                }
                else {
                    showMessage("Error: " + status);
                    showNotification('weather.png', 'Notification', 'Failed');
                }
            },
            function (e) {
                showMessage("Communication error");
                console.log('Communication error:', e);
            }
        );
    }

    function formatWeather(value) {
        var list = [];
        if (!value.list || value.list.count == 0) {
            list.push(value);
        } else {
            list = value.list;
        }
        // return "No cities found";
        var s = "";
        for (var x of list) {
            s += x.name;
            if (x.sys.country)
                s += ", " + x.sys.country;
            s += "\n";
            s += "Lat: " + x.coord.lat + ", Lon: " + x.coord.lon + "\n";
            s += "Date: " + x.dt + "\n";
            for (var d of x.weather)
                s += d.description + "\n";
            if (x.main)
                for (var k in x.main)
                    s += k + ": " + x.main[k] + "\n";
            if (x.wind)
                for (var k in x.wind)
                    s += "Wind " + k + ": " + x.wind[k] + "\n";
            if (x.rain)
                s += "Rain today: " + x.rain["3h"] + "\n";
            s += "----------------------\n";
        }
        return s;
    }

    function showNotification(icon, title, message) {
        chrome.notifications.create('', {
            type: 'basic',
            iconUrl: icon,
            title: title,
            message: message
        }, function (notificationID) {
            console.log(notificationID);
        })
    }
};
