define("finance.i.ua.provider", ["jquery"], {
    getData: function(callback) {
        "use strict";
        var ajaxDone = this.ajaxDone;
        $.ajax({
            jsonpCallback: true,
            url: "https://query.yahooapis.com/v1/public/yql",
            data: {
                q: "select * from html where " +
                    "url='http://finance.i.ua/market/kiev/usd/?type=2'" +
                    " and xpath='//html/body/div[5]/div[2]/div/div[2]/div[1]/table'",
                format: "json"
            }
        }).done(function(data) {
            ajaxDone(data, callback);
        });
    },
    ajaxDone: function(data, callback) {
        "use strict";
        try {
            data = data.query.results.table.tr;
            data.shift();
            data.splice(50, data.length);
            data.reverse();
        } catch (err) {
            callback({
                data: [],
                lastRate: "неизвестному",
                lastAmount: "что-то",
                lastTime: "неизвестное время"
            });
            console.warn("Данные недоступны. Перезагрузите пожалуйста страницу.");
            //window.alert("Данные недоступны. Перезагрузите пожалуйста страницу.");
            return;
        }
        var amount = data.map(function(el) {
                return el.td[0].p;
            }),
            time = data.map(function(el) {
                return parseInt(el.td[2].p);
            }),
            rate = data.map(function(el) {
                return parseInt(el.td[1].p);
            });
        callback({
            data: [amount, rate, time],
            lastRate: rate[rate.length - 1],
            lastAmount: time[time.length - 1] + "$",
            lastTime: amount[amount.length - 1]
        });
    }
});