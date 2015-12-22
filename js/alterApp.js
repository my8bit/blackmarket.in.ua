requirejs.config({
    paths: {
        "jquery": "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min",
        "knockout-min": "//cdnjs.cloudflare.com/ajax/libs/knockout/3.2.0/knockout-min",
        "d3": "//cdnjs.cloudflare.com/ajax/libs/d3/3.5.3/d3.min",
        "c3": "//cdnjs.cloudflare.com/ajax/libs/c3/0.4.9/c3.min"
    }
});

requirejs(["chart", "knockout-min", "jquery", "finance.i.ua.provider", "ViewModel", "randomDate", "refresher"],
    function(chart, ko, $, fprovider, ViewModel, random, refresher) {
        "use strict";
        var dataHandler = function(data) {
                if (data) {
                    if (!data.data.length) {
                        data.data = [[],[],[]];
                    }
                    data.data[1] = data.data[1].map(function(el) {
                        return el / 4;
                    });
                    data.data[0].unshift("x");
                    data.data[1].unshift("Курс в $");
                    data.data[2].unshift("Количество");
                    chart.load({
                        columns: data.data
                    });
                    random.stop();
                    viewModel.time(data.lastTime);
                    viewModel.rate(data.lastRate / 4);
                    viewModel.amount(data.lastAmount);
                    refresher.progressStop();
                    refresher.progressStart(600);
                }
            },
            viewModel = new ViewModel("?", "?", "?");
        fprovider.getData(dataHandler);
        ko.applyBindings(viewModel);
        random.start(100, viewModel);
        refresher.refresh(function() {
            fprovider.getData(dataHandler);
        }, 10000);
    });