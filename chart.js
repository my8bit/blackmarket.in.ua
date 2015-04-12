define("chart", ["c3"], function(c3) {
    "use strict";
    return c3.generate({
        bindto: "#chart",
        data: {
            x: "x",
            xFormat: "%H:%M",
            columns: [
                ["x", 0, 1],
                ["Курс в $", 0, 1]
            ],
            type: "timeseries",
            types: {
                "Курс в $": "line"
            }
        },
        zoom: {
            enabled: true
        },
        bar: {
            width: {
                ratio: 0.25
            }
        },
        // subchart: {
        //     show: true
        // },
        // grid: {
        //     y: {
        //         show: true
        //     }
        // },
        legend: {
            show: false
        },
        axis: {
            y: {
                show: true,
                label: {
                    text: "Курс доллара.",
                    position: "outer-middle"
                }
            },
            x: {
                tick: {
                    format: "%H:%M"
                },
                type: "timeseries"
            }
        }
    });
});