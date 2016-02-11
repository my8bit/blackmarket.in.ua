define("chart", ["c3", "utils"], function(c3, utils) {
    "use strict";
    return function(id) {
        return c3.generate({
            bindto: id,
            point: {
                r: function(d) {
                    return utils.mapWeight(d.id, d.index);
                }
            },
            data: {
                xs: {
                    "Курс - Продажа": "x1",
                    "Курс - Покупка": "x2"
                },
                xFormat: "%H:%M",
                columns: [
                    ["Курс - Продажа"],
                    ["x1"],
                    ["Курс - Покупка"],
                    ["x2"]
                ],
                type: "scatter"
            },
            zoom: {
                enabled: true
            },
            grid: {
                y: {
                    show: true
                }
            },
            legend: {
                show: false
            },
            axis: {
                y: {
                    show: true,
                    label: {
                        text: "Курс доллара",
                        position: "outer-middle"
                    }
                },
                x: {
                    tick: {
                        format: "%H:%M"
                    },
                    type: "timeseries",
                    label: {
                        text: "Время непростое",
                    }
                }
            }
        }
    });
});
