define("finance.i.ua.provider", [ /*"filter"*/ ], function(filter) {
    /*console.log(filter);*/
    return {
        getData: function(callback) {
            //console.log(filter);
            "use strict";
            var ask,
                self = this,
                request = $.ajax({
                    jsonpCallback: true,
                    url: "https://query.yahooapis.com/v1/public/yql",
                    data: {
                        q: "select * from html where " +
                            "url='http://finance.i.ua/market/kiev/usd/?type=2'" +
                            " and xpath='//html/body/div[1]/div[5]/div[2]/div/div[2]/div[3]/table/tbody'",
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
                                " and xpath='//html/body/div[1]/div[5]/div[2]/div/div[2]/div[3]/table/tbody'",
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
            var resultsSum = 150;
            try {
                askData = askData.query.results.tbody.tr;
                askData.shift();
                askData.splice(resultsSum, askData.length);
                askData = askData.filter(function(el) {
                    return el.class === "invalid"
                });
                /*                var today = [];
                for (var i = askData.length - 1; i >= 0; i--) {
                    if (parseInt(askData[i].td[0].substr(0, 2)) < 22) {
                        today.push(el);
                    } else {
                        return;
                    }
                };*/
                askData.reverse();
                bidData = bidData.query.results.tbody.tr;
                bidData.shift();
                bidData.splice(resultsSum, bidData.length);
                bidData = bidData.filter(function(el) {
                    return el.class === "invalid"
                });
                bidData = bidData.filter(function(el) {
                    return parseInt(el.td[0].substr(0, 2)) < 22;
                });
                bidData.reverse();
            } catch (err) {
                callback({
                    data: [],
                    lastRate: "неизвестному",
                    lastAmount: "что-то",
                    lastTime: "неизвестное время"
                });
                //console.warn("Данные недоступны. Перезагрузите пожалуйста страницу.");
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
            callback({
                data: [amountAsk, rateAsk, timeAsk, amountBid, rateBid, timeBid],
                lastRate: rateAsk[rateAsk.length - 1],
                lastAmount: amountAsk[amountAsk.length - 1] + "$",
                lastTime: timeAsk[timeAsk.length - 1]
            });
        }
    }
});