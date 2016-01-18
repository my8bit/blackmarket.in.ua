define("finance.i.ua.provider", ["jquery"], function($) {
    "use strict";
    return {
        getData: function(callback, currency, invalid) {
            currency = currency || "usd";
            var ask,
                self = this,
                request = $.ajax({
                    jsonpCallback: true,
                    url: "https://query.yahooapis.com/v1/public/yql",
                    data: {
                        q: "select * from html where " +
                            "url='http://finance.i.ua/market/kiev/" + currency + "/?type=2'" +
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
                                "url='http://finance.i.ua/market/kiev/" + currency + "/?type=1'" +
                                " and xpath='//html/body/div[1]/div[5]/div[2]/div/div[2]/div[3]/table/tbody'",
                            format: "json"
                        }
                    });
                });
            chained.done(function(bidData) {
                self.ajaxDone(ask, bidData, callback, invalid);
            });
        },
        /** Filter all values that low or high the cut value
         * For example array = [100,3,90] and cut = 15
         * result will be [100, 90] because 3 is more than 15 percent
         * @param {array} array - array to filter
         * @param {number} cut - percent to cut */
        filter: function(array, cut) {
            var average = array.reduce(function(prev, next) {
                    return parseFloat(prev) + parseFloat(next);
                }, 0) / array.length,
                cutValMax = average + average * cut,
                cutValMin = average - average * cut;
            return array.filter(function(val) {
                var current = parseFloat(val);
                console.log("current " + current + " cutValMin " + cutValMin + " cutValMax " + cutValMax);
                return current > cutValMin && current < cutValMax;
            });
        },
        getLatest: function(data) {
            return {
                lastAmount: data.data[0][data.data[0].length - 1] + "$",
                lastRate: data.data[1][data.data[1].length - 1],
                lastTime: data.data[2][data.data[2].length - 1],
                lastAmountbid: data.data[3][data.data[3].length - 1] + "$",
                lastRatebid: data.data[4][data.data[4].length - 1],
                lastTimebid: data.data[5][data.data[5].length - 1]
            };
        },
        ajaxDone: function(askData, bidData, callback) {
            var resultsSum = 150;
            try {
                askData = askData.query.results.tbody.tr;
                askData.shift();
                //askData.splice(resultsSum, askData.length);
                askData = askData.filter(function(el) {
                    return el.class === "invalid";
                });
                askData = askData.filter(function(el) {
                    console.log("askData", parseInt(el.td[0].substr(0, 2)));
                    return parseInt(el.td[1].substr(0, 2)) > 22; //TODO Refactor hardcoded filter
                });
                askData.reverse();
                bidData = bidData.query.results.tbody.tr;
                bidData.shift();
                bidData = bidData.filter(function(el) {
                    return el.class === "invalid";
                });
                /*
                bidData = bidData.filter(function(el) {
                    return parseInt(el.td[0].substr(0, 2)) < 22; //TODO Refactor hardcoded filter
                });
                */
                //bidData.splice(resultsSum, bidData.length);
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
                }),
                cut = 0.1; //TODO refactor
            //rateAsk = this.filter(rateAsk, cut);
            //rateBid = this.filter(rateBid, cut);

            callback({
                data: [amountAsk, rateAsk, timeAsk, amountBid, rateBid, timeBid],
                lastRate: rateAsk[rateAsk.length - 1],
                lastAmount: amountAsk[amountAsk.length - 1] + "$",
                lastTime: timeAsk[timeAsk.length - 1]
            });
        }
    };
});
