define("ViewModel", ["knockout-min"], function(ko) {
    "use strict";
    return function ViewModel(rate, time, amount, nbu, closed, nbuYesterday) {
        this.rate = ko.observable(rate);
        this.collaps = ko.observable("Все графики вместе");
        this.time = ko.observable(time);
        this.amount = ko.observable(amount);
        this.nbu = ko.observable(nbu);
        this.closed = ko.observable(closed);
        this.nbuYesterday = ko.observable(nbuYesterday);
        this.chartSize = ko.observable("mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--12-col");
        this.onePage = function() {
            if (this.chartSize() === "mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--12-col") {
                this.chartSize("mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--4-col");
                this.collaps("Графики раздельно");
                this.menuCollapsed(false);
                this.chart1.resize();
                this.chart2.resize();
                this.chart3.resize();
                document.body.scrollTop = 0;
            } else {
                this.chartSize("mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--12-col");
                this.collaps("Все графики вместе");
                this.menuCollapsed(true);
                this.chart1.resize();
                this.chart2.resize();
                this.chart3.resize();
            }
        }
        this.chart1;
        this.chart2;
        this.chart3;
        this.menuCollapsed = ko.observable(true);
    };
});