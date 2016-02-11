define(["jquery", "lodash"], function($, _) {
    "use strict";
    return {
        getData: function(callback, currency, invalid) {
            var askDate,
                self = this,
                request = $.ajax({
                    url: "https://query.yahooapis.com/v1/public/yql",
                    data: {
                        q: "select * from html where " +
                            "url='http://miniaylo.finance.ua/data/for-table'",
                        format: "json"
                    }
                })
            request.done(function(bidData) {
                self.ajaxDone(bidData, callback);
            });
        },

        /*
select * from html where url='http://minfin.com.ua/currency/auction/usd/sell/kiev/' and xpath='/html/body/div[2]/div[1]/div[2]/div[2]/div[3]/div[last()]' and ua="Mozilla/5.0 (Linux; U; Android 4.0.1; ja-jp; Galaxy Nexus Build/ITL41D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30"';


*/

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
                lastAmount: _.last(data[0]) + "$",
                lastRate: _.last(data[1]),
                lastTime: _.last(data[2]),
                lastAmountbid: _.last(data[3]) + "$",
                lastRatebid: _.last(data[4]),
                lastTimebid: _.last(data[5])
            };
        },
        ajaxDone: function(data, callback) {
            var resultsSum = 150;
            var dataStr = data.query.results.body;
            var require = function(some, cb) {
                var Loader = {};
                Loader.load = function(data) {
                    var allData = data.currency.map(function(el, idx) {
                        if (el === "USD" && data.location[idx][0] === 2) {
                            return {
                                time: data.time[idx],
                                amount: data.amount[idx],
                                rate: data.rate[idx],
                                type: data.type[idx]
                            }
                        }
                    }).filter(function(el) {
                        return !!el;
                    });
                    var askData = allData.map(function(el) {
                        if (el.type) {
                            return {
                                time: el.time,
                                amount: el.amount,
                                rate: el.rate
                            }
                        }
                        // body...
                    }).filter(function(el) {
                        return !!el;
                    });
                    var bidData = allData.map(function(el) {
                        // body...
                        if (!el.type) {
                            return {
                                time: el.time,
                                amount: el.amount,
                                rate: el.rate
                            }
                        }
                    }).filter(function(el) {
                        return !!el;
                    });
                    callback([
                        _.map(askData, "amount"),
                        _.map(askData, "rate"),
                        _.map(askData, "time"),
                        _.map(bidData, "amount"),
                        _.map(bidData, "rate"),
                        _.map(bidData, "time")
                    ]);


                };
                cb.call(null, Loader);
            };
            eval(dataStr);
            /*try {
                askData = askData.query.results.tbody.tr;
                //askData = _.get(askData, "query.results.tbody.tr", []);
                askData.shift();
                //askData.splice(resultsSum, askData.length);
                askData = askData.filter(function(el) {
                    return invalid ? el.class === "invalid" : el.class !== "invalid";
                });
                askData = askData.filter(function(el) {
                    //console.log("askData", parseInt(el.td[1].substr(0, 2)));
                    return parseInt(el.td[1]) < 50; //TODO Refactor hardcoded filter
                });
                askData.reverse();
                bidData = bidData.query.results.tbody.tr;
                //bidData = _.get(bidData, "query.results.tbody.tr", []);
                bidData.shift();
                bidData = bidData.filter(function(el) {
                    return invalid ? el.class === "invalid" : el.class !== "invalid";
                });
                /*
                bidData = bidData.filter(function(el) {
                    return parseInt(el.td[0].substr(0, 2)) < 22; //TODO Refactor hardcoded filter
                });
                
                //bidData.splice(resultsSum, bidData.length);
                //bidData.reverse();
            //} catch (err) {
            //    callback({
                    //data: [],
                    //lastRate: "неизвестному",
                   // lastAmount: "что-то",
                  //  lastTime: "неизвестное время"
                //});
                //console.warn("Данные недоступны. Перезагрузите пожалуйста страницу.");
                //window.alert("Данные недоступны. Перезагрузите пожалуйста страницу.");
                //return;
            }*/
            /*
            var cut = 0.1; //TODO refactor*/
            //rateAsk = this.filter(rateAsk, cut);
            //rateBid = this.filter(rateBid, cut);
            // var dataMapFn = function(el) {
            //     return {
            //         time: el.td[0],
            //         amount: parseInt(el.td[2]),
            //         rate: parseFloat(el.td[1])
            //     };
            // };
            // var askRateData = askData.map(dataMapFn);
            // var bidRateData = bidData.map(dataMapFn);
            // callback([
            //     _.map(askRateData, "amount"),
            //     _.map(askRateData, "rate"),
            //     _.map(askRateData, "time"),
            //     _.map(bidRateData, "amount"),
            //     _.map(bidRateData, "rate"),
            //     _.map(bidRateData, "time")
            // ]);
        }
    };
});