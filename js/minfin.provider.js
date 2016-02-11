define(["jquery", "lodash"], function($, _) {
    "use strict";
    return {
        /*

select * from html where url='http://minfin.com.ua/currency/auction/usd/sell/kiev/' and xpath='/html/body/div[2]/div[1]/div[2]/div[2]/div[3]/div[last()]'
        */
        getData: function(callback, currency) {
            currency = currency || "usd";
            var askData,
                self = this,
                request = $.ajax({
                    url: "https://query.yahooapis.com/v1/public/yql",
                    data: {
                        q: "select * from html where " +
                            "url='http://minfin.com.ua/currency/auction/" + currency + "/sell/kiev'" +
                            " and xpath='/html/body/div[2]/div[1]/div[2]/div[2]/div[3]/div[last()]'",
                        //" and xpath='/html/body'",
                        format: "json"
                    }
                }),
                chained = request.then(function(data) {
                    askData = data;
                    return $.ajax({
                        url: "https://query.yahooapis.com/v1/public/yql",
                        data: {
                            q: "select * from html where " +
                                "url='http://minfin.com.ua/currency/auction/" + currency + "/buy/kiev'" +
                                " and xpath='//html/body/div[2]/div[1]/div[2]/div[2]/div[3]/div[last()]'",
                            //" and xpath='//html/body'",
                            format: "json"
                        }
                    });
                });
            chained.done(function(bidData) {
                self.ajaxDone(askData, bidData, callback);
            });
            return chained;
        },
        /** Filter all values that low or high the cut value
         * For example array = [100,3,90] and cut = 15
         * result will be [100, 90] because 3 is more than 15 percent
         * @param {array} array - array to filter
         * @param {number} cut - percent to cut */
        filter: function(array, cut) {
            //return false;
            var b = {},
                i,
                sum = 0;
            array.forEach(function(el) {
                var currentEl = el + "";
                if (b[currentEl]) {
                    b[currentEl]++;
                } else {
                    b[currentEl] = 1;
                }
            });
            /*
            _.reduce(function(sum, n) {
                return sum + n;
            });
            */
            return _.reduce(array, function(sum, n) {
                return sum + n;
            }) / array.length;
            /*a = [1, 2, 3, 3, 3, 3, 4, 5, 6, 6];
            b = {};
            sum = 0;
            a.forEach(function(el) {
                var currentEl = el + "";
                //console.log("currentEl", currentEl);
                if (b[currentEl]) {
                    b[currentEl]++;
                } else {
                    b[currentEl] = 1;
                }

            });

            
            result = a.forEach(function(previousValue, idx, array) {
                //debugger;     
                sum += b[previousValue + ""] * (1 / previousValue);
                //console.log(b[currentValue + ""]);
                //console.log("currentValue", currentValue);
                //return previousValue + sum;
            });
*/

            var compare = function(cur, prev) {
                if (cur > prev) {
                    //console.log("cur > prev", cur, prev);
                    return 1 - prev / cur;
                } else {
                    //console.log("cur < prev", cur, prev);
                    return cur / prev;
                }
            };
            //return [];
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
        ajaxDone: function(askData, bidData, callback, invalid) {
            var resultsSum = 150;
            try {
                askData = askData.query.results.div.div;
                //askData.shift();
                //askData.splice(resultsSum, askData.length);
                /*askData = askData.filter(function(el) {
                    return invalid ? el.class === "invalid" : el.class !== "invalid";
                });*/
                /*
                askData = askData.filter(function(el) {
                    //console.log("askData", parseInt(el.td[1].substr(0, 2)));
                    return parseInt(el.td[1]) < 50; //TODO Refactor hardcoded filter
                });*/
                askData.reverse();
                //TODO fix premium deal     
                bidData = bidData.query.results.div.div;
                //bidData.shift();
                /*bidData = bidData.filter(function(el) {
                    return invalid ? el.class === "invalid" : el.class !== "invalid";
                });*/
                /*
                bidData = bidData.filter(function(el) {
                    return parseInt(el.td[0].substr(0, 2)) < 22; //TODO Refactor hardcoded filter
                });
                */
                //bidData.splice(resultsSum, bidData.length);

                bidData.reverse();

            } catch (err) {
                callback(
                    [], [], [], [], [], []
                );
                //console.warn("Данные недоступны. Перезагрузите пожалуйста страницу.");
                //window.alert("Данные недоступны. Перезагрузите пожалуйста страницу.");
                return;
            }
            /*
            var cut = 0.1; //TODO refactor*/
            //rateAsk = this.filter(rateAsk, cut);
            //rateBid = this.filter(rateBid, cut);
            var dataMapFn = function(el) {
                if (el.div && el.div.small) {
                    return {
                        time: el.div.small.content,
                        amount: el.div.span[1].content.trim(),
                        rate: el.div.span[0].content.replace(",", ".")
                    };
                } else {
                    return false;
                }
            };
            var askRateData = askData.map(dataMapFn);
            askRateData = askRateData.filter(function(el) {
                return !!el;
            });
            var bidRateData = bidData.map(dataMapFn).filter(function(el) {
                return !!el;
            });
            bidRateData = bidRateData.filter(function(el) {
                return !!el;
            });
            bidRateData = bidRateData.filter(function(el) {
                return parseInt(el.time.substr(0, 2)) > 1; //TODO Refactor hardcoded filter
            });
            askRateData = askRateData.filter(function(el) {
                return parseInt(el.time.substr(0, 2)) > 1; //TODO Refactor hardcoded filter
            });
            callback([
                _.map(askRateData, "amount"),
                _.map(askRateData, "rate"),
                _.map(askRateData, "time"),
                _.map(bidRateData, "amount"),
                _.map(bidRateData, "rate"),
                _.map(bidRateData, "time")
            ]);
        }
    };
});