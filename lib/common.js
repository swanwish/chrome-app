function errorHandler(e) {
    console.dir(e);
    var msg;
    if (e.target && e.target.error)
        e = e.target.error;
    if (e.message)
        msg = e.message;
    else if (e.name)
        msg = e.name;
    else if (e.code)
        msg = "Code " + e.code;
    else
        msg = e.toString();
    showMessage('Error: ' + msg);
}

var timeoutID;

function showMessage(msg, good) {
    console.log(msg);
    var messageElement = document.querySelector("#message");
    messageElement.style.color = good ? "green" : "red";
    messageElement.innerHTML = msg;
    if (timeoutID)
        clearTimeout(timeoutID);
    timeoutID = setTimeout(
        function () {
            messageElement.innerHTML = "&nbsp;";
        },
        5000);
}

function str2ab(str) {
    var encoder = new TextEncoder('utf-8');
    return encoder.encode(str).buffer;
}

function ab2str(ab) {
    var dataView = new DataView(ab);
    var decoder = new TextDecoder('utf-8');
    return decoder.decode(dataView);
}