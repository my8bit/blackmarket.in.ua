requirejs.config({
    baseUrl: "js",
    paths: {
        "jquery": "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min",
        "knockout-min": "//cdnjs.cloudflare.com/ajax/libs/knockout/3.2.0/knockout-min",
        "d3": "//cdnjs.cloudflare.com/ajax/libs/d3/3.5.3/d3.min",
        "c3": "//cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min"
    }
});

requirejs(["chart", "knockout-min", "jquery", "finance.i.ua.provider", "ViewModel", "randomDate", "nbu.provider"],
    function(chart, ko, $, fprovider, ViewModel, random, nbu) {
        "use strict";
        var viewModel,
            dataHandler;
        dataHandler = function(data) {
            if (data) {
                if (!data.length) {
                    data.data = [
                        [],
                        [],
                        []
                    ];
                }
                var latest = fprovider.getLatest(data);

                data[0].unshift("Количество");
                data[1].unshift("Продажа");
                data[2].unshift("x1");
                data[3].unshift("Количество");
                data[4].unshift("Покупка");
                data[5].unshift("x2");

                data.splice(0, 1);
                data.splice(2, 1);
                chart.load({
                    columns: data
                });

                random.stop();
                viewModel.time(latest.lastTime);
                viewModel.rate(latest.lastRate);
                viewModel.amount(latest.lastAmount);
            }
        };

        viewModel = new ViewModel("?", "?", "?", "?");
        ko.applyBindings(viewModel);
        random.start(100, viewModel);
        (function poll() {
            var pollingFn = function() {
                fprovider.getData(dataHandler).then(function() {
                    poll();
                });
            };
            setTimeout(pollingFn, 1000);
        })();
        nbu.getData(function(data) {
            viewModel.nbu(nbu.filter(data));
        });
    });