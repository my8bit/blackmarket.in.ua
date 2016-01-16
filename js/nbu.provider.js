define(["jquery"], function($) {
    "use strict";
    return {
        getData: function(callback) {
            $.ajax({
                url: "http://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json"
            }).done(function(data) {
                callback(data);
            });
        },
        filter: function(data) {
            data.filter(function(cur) {
                return cur.cc.toUpperCase === "USD";
            });
            delete data[0].txt;
            delete data[0].r030;
            return data[0];
        }
    };
});