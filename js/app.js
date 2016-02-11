requirejs.config({
    baseUrl: "js",
    paths: {
        "jquery": "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min",
        "knockout-min": "//cdnjs.cloudflare.com/ajax/libs/knockout/3.2.0/knockout-min",
        "d3": "//cdnjs.cloudflare.com/ajax/libs/d3/3.5.3/d3.min",
        "c3": "//cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min",
        "lodash": "//cdnjs.cloudflare.com/ajax/libs/lodash.js/4.0.0/lodash.min"
    }
});
requirejs(["chart", "knockout-min", "jquery", "finance.i.ua.provider", "ViewModel", "randomDate", "nbu.provider", "minfin.provider", "finance.provider"],
    function(chart, ko, $, financeIUaProvider, ViewModel, random, nbuProvider, minfinProvider, miniaylo) {
        "use strict";
        var viewModel,
            dataHandler,
            dataHandlerFin = function(data) {
                if (data) {
                    if (!data.length) {
                        data.data = [
                            [],
                            [],
                            []
                        ];
                    }
                    var latest = miniaylo.getLatest(data);

                    data[0].unshift("Количество - Продажа");
                    data[1].unshift("Курс - Продажа");
                    data[2].unshift("x1");
                    data[3].unshift("Количество - Покупка");
                    data[4].unshift("Курс - Покупка");
                    data[5].unshift("x2");

                    data.splice(0, 1);
                    data.splice(2, 1);
                    //data.splice(1, 1);
                    //data.splice(3, 1);
                    var finchart = chart("#chartFin");

                    finchart.load({
                        columns: data
                    });
                    viewModel.chart2 = finchart;
                    random.stop();
                    viewModel.time(latest.lastTime);
                    viewModel.rate(latest.lastRate);
                    viewModel.amount(latest.lastAmount);
                }
            },
            dataHandlerFinIUa = function(data) {
                if (data) {
                    if (!data.length) {
                        data.data = [
                            [],
                            [],
                            []
                        ];
                    }
                    var latest = financeIUaProvider.getLatest(data);

                    data[0].unshift("Количество - Продажа");
                    data[1].unshift("Курс - Продажа");
                    data[2].unshift("x1");
                    data[3].unshift("Количество - Покупка");
                    data[4].unshift("Курс - Покупка");
                    data[5].unshift("x2");

                    data.splice(0, 1);
                    data.splice(2, 1);
                    //data.splice(1, 1);
                    //data.splice(3, 1);
                    var finchart = chart("#chartFinIUa");

                    finchart.load({
                        columns: data
                    });
                    viewModel.chart1 = finchart;

                    random.stop();
                    viewModel.time(latest.lastTime);
                    viewModel.rate(latest.lastRate);
                    viewModel.amount(latest.lastAmount);
                }
            },
            dataHandlerMinFin = function(data) {
                if (data) {
                    if (!data.length) {
                        data = [
                            [],
                            [],
                            [],
                            [],
                            [],
                            []
                        ];
                    }
                    //var latest = financeIUaProvider.getLatest(data);
                    data[0].unshift("Количество - Продажа");
                    data[1].unshift("Курс - Продажа");
                    data[2].unshift("x1");
                    data[3].unshift("Количество - Покупка");
                    data[4].unshift("Курс - Покупка");
                    data[5].unshift("x2");

                    data.splice(0, 1);
                    data.splice(2, 1);
                    //data.splice(1, 1);
                    //data.splice(3, 1);
                    var minFinchart = chart("#chartMinFin");

                    minFinchart.load({
                        columns: data
                    });
                    viewModel.chart3 = minFinchart;

                    //random.stop();
                    //viewModel.time(latest.lastTime);
                    //viewModel.rate(latest.lastRate);
                    //viewModel.amount(latest.lastAmount);
                }
            };

        viewModel = new ViewModel("?", "?", "?", "?", true, "213", chart);
        ko.applyBindings(viewModel);
        random.start(100, viewModel);

        var updateInterval;
        var progressEl = $("#progress");

        var updateProgress = function() {
            var value = parseInt(progressEl.val()) || 0;;
            if (value < 100) {;
                progressEl.val(value + 1);
            } else {
                progressEl.val(0);
                clearInterval(updateInterval);
            }
        };

        minfinProvider.getData(dataHandlerMinFin);
        miniaylo.getData(dataHandlerFin);
        financeIUaProvider.getData(dataHandlerFinIUa);

        function poll() {
            var pollingFn = function() {
                minfinProvider.getData(dataHandlerMinFin);
                miniaylo.getData(dataHandlerFin);
                financeIUaProvider.getData(dataHandlerFinIUa, "usd", viewModel.closed()).then(function() {
                    clearInterval(updateInterval);
                    updateInterval = setInterval(updateProgress, 100);
                    poll();
                });
            };
            setTimeout(pollingFn, 60000);
        };
        //poll();

        nbuProvider.getData(function(data) {
            viewModel.nbu(nbuProvider.filter(data).rate);
            var todaysRate = nbuProvider.filter(data).rate;
            nbuProvider.getYesterdayData(function(data) {
                var yesterdaysRate = 24.66, //nbuProvider.filter(data).rate,
                    trend = "",
                    diffChange
                if (todaysRate > yesterdaysRate) {
                    trend = "↗";
                    diffChange = ((todaysRate - yesterdaysRate) / yesterdaysRate) * 100;
                } else if (todaysRate < yesterdaysRate) {
                    trend = "↘";
                    diffChange = ((yesterdaysRate - todaysRate) / todaysRate) * 100;
                } else if (todaysRate === yesterdaysRate) {

                }
                diffChange = parseFloat(diffChange).toFixed(4);
                viewModel.nbuYesterday(diffChange + " " + trend);
            });
        });
    });