define("finance.i.ua.provider", ["jquery"], {
    getData: function(callback) {
        "use strict";

        var ask,
            self = this,
            request = $.ajax({
                jsonpCallback: true,
                url: "https://query.yahooapis.com/v1/public/yql",
                data: {
                    q: "select * from html where " +
                        "url='http://finance.i.ua/market/kiev/usd/?type=2'" +
                        " and xpath='//html/body/div[5]/div[2]/div/div[2]/div[3]/table'",
                    format: "json"
                }
            }),
            chained = request.then(function(askData) {
                ask = askData;
                return $.ajax({
                    jsonpCallback: true,
                    url: "https://query.yahooapis.com/v1/public/yql",
                    data: {
                        q: "select * from html where " +
                            "url='http://finance.i.ua/market/kiev/usd/?type=1'" +
                            " and xpath='//html/body/div[5]/div[2]/div/div[2]/div[3]/table'",
                        format: "json"
                    }
                });
            });
        chained.done(function(bidData) {
            self.ajaxDone(ask, bidData, callback);
        });
    },

    ajaxDone: function(askData, bidData, callback) {
        "use strict";
        var resultsSum = 15;
        try {
            askData = askData.query.results.table.tbody.tr;
            askData.shift();
            askData.splice(resultsSum, askData.length);
            askData.reverse();
            bidData = bidData.query.results.table.tbody.tr;
            bidData.shift();
            bidData.splice(resultsSum, bidData.length);
            bidData.reverse();
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
        var timeAsk = askData.map(function(el) {
                return el.td[0];
            }),
            amountAsk = askData.map(function(el) {
                return parseInt(el.td[2]);
            }),
            rateAsk = askData.map(function(el) {
                return el.td[1];
            }),
            amountBid = bidData.map(function(el) {
                return parseInt(el.td[2]);
            }),
            timeBid = bidData.map(function(el) {
                return el.td[0];
            }),
            rateBid = bidData.map(function(el) {
                return el.td[1];
            });
        //filterDefective(data.data[0]);
        console.log(amountAsk, rateAsk, timeAsk);
        callback({
            data: [amountAsk, rateAsk, timeAsk, amountBid, timeBid, rateBid],
            lastRate: rateAsk[rateAsk.length - 1],
            lastAmount: amountAsk[amountAsk.length - 1] + "$",
            lastTime: timeAsk[timeAsk.length - 1]
        });
    }
});