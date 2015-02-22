define("test", ["mocha", "chai", "sinon", "finance.i.ua.provider"], function(mocha, chai, sinon, provider) {
	"use strict";
	var assert = chai.assert;

	describe("Specification of provider", function() {

		it("should return data in specified format [[\"12:01\"], [100], [50]], where 12:01 - is time, 100 amount of money, and 50 is rate", function() {
			var inputData = {},
				outputData,
				callback = sinon.spy();
			inputData.query = {};
			inputData.query.results = {};
			inputData.query.results.table = {};
			inputData.query.results.table.tr = [{}, {
				"td": [{
					"p": "12:01"
				}, {
					"p": "100"
				}, {
					"p": "500$"
				}]
			}, {
				"td": [{
					"p": "12:02"
				}, {
					"p": "101"
				}, {
					"p": "550$"
				}]
			}, {
				"td": [{
					"p": "12:03"
				}, {
					"p": "102"
				}, {
					"p": "100$"
				}]
			}];
			provider.ajaxDone(inputData, callback);
			outputData = callback.args[0][0].data;
			assert.equal(outputData[0][0], "12:03");
			assert.equal(outputData[0][1], "12:02");
			assert.equal(outputData[0][2], "12:01");
			assert.equal(outputData[1][0], 102);
			assert.equal(outputData[1][1], 101);
			assert.equal(outputData[1][2], 100);
			assert.equal(outputData[2][0], 100);
			assert.equal(outputData[2][1], 550);
			assert.equal(outputData[2][2], 500);
		});
		it("should call the callback function even while data is broken", function() {
			var callback = sinon.spy();
			provider.ajaxDone([], callback);
			assert.isTrue(callback.called);
			provider.ajaxDone({}, callback);
			assert.isTrue(callback.called);
			provider.ajaxDone("", callback);
			assert.isTrue(callback.called);
			assert.equal(callback.args[0][0].lastRate, "неизвестному");
			assert.equal(callback.args[0][0].lastAmount, "что-то");
			assert.equal(callback.args[0][0].lastTime, "неизвестное время");
		});
		it("should return message that data is broken", function() {
			var callback = sinon.spy();
			provider.ajaxDone({}, callback);
			assert.equal(callback.args[0][0].lastRate, "неизвестному");
			assert.equal(callback.args[0][0].lastAmount, "что-то");
			assert.equal(callback.args[0][0].lastTime, "неизвестное время");
		});

	});
});