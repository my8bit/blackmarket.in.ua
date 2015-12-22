define("chart", ["c3"], function(c3) {
    "use strict";
    return c3.generate({
        bindto: "#chart",
        data: {
            xs: {
                "Продажа": "x1",
                "Покупка": "x2"
            },
            xFormat: "%H:%M",
            columns: [
                ["Продажа", 1, 2],
                ["x1", "12:00", "12:05"],
                ["Покупка", 2, 3],
                ["x2", "12:01", "12:04"]
            ],
            type: "timeseries",
            types: {
                "Продажа": "line",
                "Покупка": "line"
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