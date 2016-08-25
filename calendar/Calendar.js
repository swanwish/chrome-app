window.onload = function () {
    var calDiv = document.querySelector("#calendar");

    var OutputText = (function () {
        var prevRow = -1;
        var para;
        var api = {
            cellWidth: 0,
            cellHeight: 0,
            start: function () {
                calDiv.style['font-family'] = 'monospace';
            },
            text: function (row, col, type, s, xOffset, yOffset) {
                if (type === 'weekday')
                    s = s.substr(0, 2);
                else if (type === 'date' && s.length === 1)
                    s = '&nbsp;' + s;
                if (row !== prevRow || col === 0) {
                    para = document.createElement('p');
                    para.style['margin-left'] = '10px';
                    for (var i = 0; i < col; i++)
                        para.insertAdjacentHTML('beforeend', '&nbsp;&nbsp;&nbsp;');
                    calDiv.appendChild(para);
                }
                para.insertAdjacentHTML('beforeend', s + ' ');
                prevRow = row;
            },
            addPage: function () {
                calDiv.insertAdjacentHTML('beforeend', '<hr>');
            },
            pageWidth: function () {
                return 150;
            },
            line: function (x1, y1, x2, y2) {
            },
            getTextWidth: function (s, fontSize) {
                return 0;
            },
            write: function () {
            }
        };
        return api;
    })();

    var output = OutputText;

    buildCalendar((new Date()).getFullYear());

    function buildCalendar(year) {
        output.start();
        window.resizeTo(output.pageWidth(), 800);
        for (var month = 0; month < 12; month++) {
            if (month > 0)
                output.addPage();
            changeMonth(month);
            var row = 1;
            for (var day = 1; day <= 31; day++) {
                var date = new Date(year, month, day);
                if (date.getFullYear() != year || date.getMonth() != month)
                    break; // day does not exist in this month
                var dayOfWeek = date.getDay();
                if (dayOfWeek === 0 && day > 1)
                    row++;
                output.text(row, dayOfWeek, 'date', day.toString(), 5, 20);
            }
            drawGrid(row);
        }
        output.write();

        function changeMonth(monthToShow, wantLines) {
            var m = ['January', 'February', 'March', 'April', 'May',
                'June', 'July', 'August', 'September', 'October',
                'November', 'December'][monthToShow];
            output.text(0, 0, 'month', m + '  ' + year, 0, 24);
            ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
                'Thursday', 'Friday', 'Saturday'].forEach(
                function (weekday, index) {
                    output.text(0, index, 'weekday', weekday, 0, 0);
                }
            );
        }

        function drawGrid(numRows) {
        }
    }
};
