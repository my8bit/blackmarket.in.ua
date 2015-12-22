define("refresher", [], {
    _timeout: null,
    progressCounter: null,
    progressStart: function(progressRefresh) {
        "use strict";

        var progressbar = document.getElementById("progress"),
            me = this;
        me.progressCounter = null;
        me.progressCounter = setInterval(function() {
           //var progressbarValue = progressbar.value,
                //value = parseInt(progressbarValue + 1);
            //progressbar.value = value;
        }, progressRefresh);
    },
    progressStop: function() {
        "use strict";
        var me = this;
            //progressbar = document.getElementById("progress");
        //progressbar.value = 1;
        clearInterval(me.progressCounter);
    },
    refresh: function(handler, refreshRate) {
        "use strict";
        var me = this;
        this._timeout = setInterval(handler, refreshRate);
        me.progressStart(Math.round(100000 / refreshRate) * 1000);
    },
    stopRefresh: function() {
        "use strict";
        clearInterval(this._timeout);
    }
});