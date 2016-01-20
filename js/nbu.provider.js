define(["jquery"], function($) {
    "use strict";

    function checkNested(obj) {
        var args = Array.prototype.slice.call(arguments, 1);

        for (var i = 0; i < args.length; i++) {
            if (!obj || !obj.hasOwnProperty(args[i])) {
                return false;
            }
            obj = obj[args[i]];
        }
        return true;
    }

    return {
        getData: function(callback) {
            $.ajax({
                url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22http%3A%2F%2Fbank.gov.ua%2FNBUStatService%2Fv1%2Fstatdirectory%2Fexchange%3Fjson%22&format=json&diagnostics=true&callback="
            }).done(function(data) {
                if (checkNested(data, "query", "results", "json", "json")) {
                    callback(data.query.results.json.json);
                } else {
                    callback([{
                        cc: "USD",
                        rate: "недоступен"
                    }]);
                }
            });
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