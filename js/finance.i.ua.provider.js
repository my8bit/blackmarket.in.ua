define(["jquery"], function($) {
    "use strict";
    return {
        getData: function(callback, currency, invalid) {
            currency = currency || "usd";
            var ask,
                self = this,
                request = $.ajax({
                    //jsonpCallback: true,
                    url: "https://query.yahooapis.com/v1/public/yql",
                    data: {
                        q: "select * from html where " +
                            "url='http://finance.i.ua/market/kiev/" +
                            currency + "/?type=2'" +
                            " and xpath='//html/body/div[1]/div[5]/div[2]/div/div[2]/div[3]/table/tbody'",
                        format: "json"
                    }
                }),
                chained = request.then(function(askData) {
                    ask = askData;
                    return $.ajax({
                        //jsonpCallback: true,
                        url: "https://query.yahooapis.com/v1/public/yql",
                        data: {
                            q: "select * from html where " +
                                "url='http://finance.i.ua/market/kiev/" +
                                currency + "/?type=1'" +
                                " and xpath='//html/body/div[1]/div[5]/div[2]/div/div[2]/div[3]/table/tbody'",
                            format: "json"
                        }
                    });
                });
            chained.done(function(bidData) {
                self.ajaxDone(ask, bidData, callback, invalid);
            });
            return chained;
        },
        /** Filter all values that low or high the cut value
         * For example array = [100,3,90] and cut = 15
         * result will be [100, 90] because 3 is more than 15 percent
         * @param {array} array - array to filter
         * @param {number} cut - percent to cut */
        filter: function(array, cut) {
            var compare = function(cur, prev) {
                if (cur > prev) {
                    //console.log("cur > prev", cur, prev);
                    return 1 - prev / cur;
                } else {
                    //console.log("cur < prev", cur, prev);
                    return cur / prev;
                }
            };

            return array.filter(function(el, idx, arr) {
                if (idx) {
                    //console.log("cut", cut);
                    //console.log("compare", compare(el, arr[idx - 1]));
                    return cut > compare(el, arr[idx - 1]);
                } else {
                    //console.log("cut", cut);
                    //console.log("compare", compare(arr[idx + 1], el));
                    return cut > compare(arr[idx + 1], el);
                }
            });
            /*var average = this.getAverage(array),
                cutValMax = average + average * cut,
                cutValMin = average - average * cut;
            return array.filter(function(val) {
                var current = parseFloat(val);
                //console.log("current " + current + " cutValMin " + cutValMin + " cutValMax " + cutValMax);
                return current > cutValMin && current < cutValMax;
            });*/
        },
        getAverage: function(array) {
            return array.reduce(function(prev, next) {
                return parseFloat(prev) + parseFloat(next);
            }, 0) / array.length;
        },
        getLatest: function(data) {
            return {
                lastAmount: data[0][data[0].length - 1] + "$",
                lastRate: data[1][data[1].length - 1],
                lastTime: data[2][data[2].length - 1],
                lastAmountbid: data[3][data[3].length - 1] + "$",
                lastRatebid: data[4][data[4].length - 1],
                lastTimebid: data[5][data[5].length - 1]
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
                    //console.log("askData", parseInt(el.td[1].substr(0, 2)));
                    return parseInt(el.td[1]) < 50; //TODO Refactor hardcoded filter
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

            callback([amountAsk, rateAsk, timeAsk, amountBid, rateBid, timeBid]);
        }
    };
});