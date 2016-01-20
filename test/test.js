var isClient = function() {
    return typeof module == "undefined";
};

var testRunner = function(Squire, mocha, chai, sinon, finProvider, nbuProvider) {
    "use strict";
    var assert = chai.assert;
    describe("Specification of provider", function() {

        it("should return data in specified format " +
            "[[\"12:01\"], [100], [50]], " +
            "where 12:01 - is time, 100 amount of money, and 50 is rate",
            function() {
                var askData = {},
                    bidData = {},
                    outputData,
                    callback = sinon.spy();
                askData.query = {}; // askData.query.results.table.tbody.tr
                askData.query.results = {};
                askData.query.results.tbody = {};
                askData.query.results.tbody.tr = [{
                    "mock": "of table header"
                }, {
                    "td": ["12:04", "12", "501$"],
                    "class": "invalid"
                }, {
                    "td": ["12:05", "13", "551$"],
                    "class": "invalid"
                }, {
                    "td": ["12:06", "14", "101$"],
                    "class": "invalid"
                }, {
                    "td": ["12:03", "141", "111$"],
                    "class": "invalid"
                }];
                bidData.query = {};
                bidData.query.results = {};
                bidData.query.results.tbody = {};
                bidData.query.results.tbody.tr = [{
                    "mock": "of table header"
                }, {
                    "td": ["12:01", "120", "500$"],
                    "class": "invalid"
                }, {
                    "td": ["12:02", "110", "550$"],
                    "class": "invalid"
                }, {
                    "td": ["12:03", "140", "100$"],
                    "class": "invalid"
                }];
                finProvider.ajaxDone(askData, bidData, callback);
                outputData = callback.args[0][0];
                assert.equal(outputData[2][0], "12:06");
                assert.equal(outputData[2][1], "12:05");
                assert.equal(outputData[2][2], "12:04");
                assert.equal(outputData[1][0], 14);
                assert.equal(outputData[1][1], 13);
                assert.equal(outputData[1][2], 12);
                assert.equal(outputData[0][0], 101);
                assert.equal(outputData[0][1], 551);
                assert.equal(outputData[0][2], 501);
            });

        it("should call the callback even while data is broken", function() {
            var callback = sinon.spy();
            finProvider.ajaxDone([], [], callback);
            assert.isTrue(callback.called);
            finProvider.ajaxDone({}, {}, callback);
            assert.isTrue(callback.called);
            finProvider.ajaxDone("", "", callback);
            assert.isTrue(callback.called);
            assert.equal(callback.args[0][0].lastRate, "неизвестному");
            assert.equal(callback.args[0][0].lastAmount, "что-то");
            assert.equal(callback.args[0][0].lastTime, "неизвестное время");
        });

        it("should call filter latest in finance", function() {
            var data = [
                    ["3", "2", "1"],
                    [0, 1, 2],
                    [1, 2, 3],
                    ["1", "2", "3", "4"],
                    [1, 2, 3, 4, 5],
                    [1, 2, 3, 4, 5, 6]
                ],
                output = finProvider.getLatest(data),
                filtered = {
                    lastAmount: "1$",
                    lastRate: 2,
                    lastTime: 3,
                    lastAmountbid: "4$",
                    lastRatebid: 5,
                    lastTimebid: 6
                };
            assert.deepEqual(output, filtered);
        });

        it("should return same arrays filtered and unfiltered", function() {
            var cut = 1;
            assert.deepEqual(finProvider.filter([1, 2, 3], cut), [1, 2, 3]);
        });

        it("should return [2] as filtered array", function() {
            var cut = 0.5;
            assert.deepEqual(finProvider.filter([1, 2, 3], cut), [2]);
        });

        it("should return [1, 2, 3] as filtered array", function() {
            var cut = 0.51;
            assert.deepEqual(finProvider.filter([1, 2, 3], cut), [1, 2, 3]);
        });

        if (!isClient()) {
            it("should call nbu callback", function() {
                var callback = sinon.spy();
                nbuProvider.getData(callback);
                assert.isTrue(callback.called);
                //console.log(callback.args[0][0]);
            });
        }
        it("should filter only USD in nbu", function() {
            var data = nbuProvider.filter([{
                "r030": 840,
                "txt": "Долар США",
                "rate": 24.187399,
                "cc": "USD"
            }, {
                "r030": 860,
                "txt": "Узбецький сум",
                "rate": 0.008573,
                "cc": "UZS"
            }]);
            assert.deepEqual(data, {
                "rate": 24.187399,
                "cc": "USD"
            });
        });

    });
};

if (isClient()) {
    define("test", ["Squire", "mocha", "chai", "sinon", "finance.i.ua.provider", "nbu.provider"],
        function(Squire, mocha, chai, sinon, finProvider, nbuProvider) {
            "use strict";
            testRunner.apply(this, arguments);
        });
}

if (!isClient()) {
    var requirejs = require("requirejs"),
        sinon = require("sinon"),
        chai = require("chai"),
        nbuProvider,
        finProvider;

    requirejs.config({
        nodeRequire: function(config) {
            //console.log("config", config);
            return {
                ajax: function(input) {
                    return {
                        done: function(callback) {
                            callback(input);
                        }
                    };
                }
            };
        }
    });

    finProvider = requirejs("./js/finance.i.ua.provider.js");
    nbuProvider = requirejs("./js/nbu.provider.js");
    testRunner.apply(this, ["", "", chai, sinon, finProvider, nbuProvider]);
}