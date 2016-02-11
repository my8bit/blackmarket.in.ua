define(["jquery", "lodash"], function($, _) {
    "use strict";
    return {
        getData: function(callback, date) {
            var date = date || "",
                self = this;
            $.ajax({
                url: "https://query.yahooapis.com/v1/public/yql" +
                    "?q=select%20*%20from%20json%20where%20url%3D%22" +
                    "http%3A%2F%2Fbank.gov.ua%2FNBUStatService%2Fv1%2Fstatdirectory%2Fexchange%3F" +
                    date + "json" +
                    "%22&format=json&diagnostics=true&callback="
            }).done(function(data) {
                var result = _.get(data, ["query", "results", "json", "json"], [{
                    cc: "USD",
                    rate: "недоступен"
                }]);
                callback(result);
            });
        },
        getYesterdayData: function(callback) {
            var day = new Date(),
                yesterday;
            day.setDate(day.getDate() - 1);
            yesterday = day.toISOString().slice(0, 10).replace(/-/g, "");
            this.getData(callback, "date=" + yesterday + "%26");
        },
        filter: function(data) {
            if (data && data.length) {
                var usd = data.filter(function(cur) {
                    return cur.cc.toUpperCase() === "USD";
                })[0];
                delete usd.txt;
                delete usd.r030;
                return usd;
            }
        }
    };
});