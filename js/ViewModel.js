define("ViewModel", ["knockout-min"], function(ko) {
    "use strict";
    return function ViewModel(rate, time, amount, nbu) {
        this.rate = ko.observable(rate);
        this.time = ko.observable(time);
        this.amount = ko.observable(amount);
        this.nbu = ko.observable(nbu);
    };
});