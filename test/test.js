var testRunner = function(mocha, chai, sinon, provider) {
	var assert = chai.assert;
	describe("Specification of provider", function() {
		it("should return data in specified format [[\"12:01\"], [100], [50]], where 12:01 - is time, 100 amount of money, and 50 is rate", function() {
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
				"td": ["12:04", "121", "501$"],
				"class": "invalid"
			}, {
				"td": ["12:05", "131", "551$"],
				"class": "invalid"
			}, {
				"td": ["12:06", "141", "101$"],
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
			provider.ajaxDone(askData, bidData, callback);
			outputData = callback.args[0][0].data;
			assert.equal(outputData[2][0], "12:06");
			assert.equal(outputData[2][1], "12:05");
			assert.equal(outputData[2][2], "12:04");
			assert.equal(outputData[1][0], 141);
			assert.equal(outputData[1][1], 131);
			assert.equal(outputData[1][2], 121);
			assert.equal(outputData[0][0], 101);
			assert.equal(outputData[0][1], 551);
			assert.equal(outputData[0][2], 501);
		});

		it("should call the callback function even while data is broken", function() {
			var callback = sinon.spy();
			provider.ajaxDone([], [], callback);
			assert.isTrue(callback.called);
			provider.ajaxDone({}, {}, callback);
			assert.isTrue(callback.called);
			provider.ajaxDone("", "", callback);
			assert.isTrue(callback.called);
			assert.equal(callback.args[0][0].lastRate, "неизвестному");
			assert.equal(callback.args[0][0].lastAmount, "что-то");
			assert.equal(callback.args[0][0].lastTime, "неизвестное время");
		});

	});
}


if (typeof module === "undefined") {
	define("test", ["mocha", "chai", "sinon", "finance.i.ua.provider"],
		function(mocha, chai, sinon, provider) {
			"use strict";
			testRunner.apply(this, arguments);
		});
}

if (typeof module != "undefined") { //TODO 
	require("amd-loader");
	var sinon = require("sinon"),
		chai = require("chai"),
		provider = require("../js/finance.i.ua.provider");
	testRunner.apply(this, ["", chai, sinon, provider]);
}