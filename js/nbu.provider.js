define("finance.i.ua.provider", ["jquery"], function($) {
    "use strict";
    return {
        getData: function(callback) {
            $.ajax({
                jsonpCallback: true,
                url: "http://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json"
            }).done(function(data) {
                //console.log(data);
                callback(data);
            });
        }
    };
});