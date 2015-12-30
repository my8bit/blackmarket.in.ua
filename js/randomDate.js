define("randomDate", [], {
	_timer: 0,
	randomDate: function(start, end) {
		"use strict";
		return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	},
	start: function(interval, viewModel) {
		"use strict";
		if (!this._timer) {
			var me = this;
			this._timer = setInterval(function() {
				var randomTime = me.randomDate(new Date(2012, 0, 1), new Date());
				viewModel.time(randomTime.getHours() + ":" + randomTime.getMinutes());
				viewModel.rate(Math.round(Math.random() * 100));
				viewModel.amount(Math.round(Math.random() * 1000) + " $");
			}, interval);
		}
	},
	stop: function() {
		"use strict";
		clearInterval(this._timer);
	}
});