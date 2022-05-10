const QuickChart = require('quickchart-js');

class chart {
    constructor() {}
    
    async execute(mydata, time, ticker) {
        let datalist = [];
        let labels = [];
        let count = 0;
        
        for (let key in mydata) {
            if (mydata.hasOwnProperty(key)) {
                labels[count] = key.slice(5, -3); // removes year and seconds
                datalist[count] = mydata[key][ '4. close' ];
                count++;
            }
        }
        
        const change = (datalist[0] - datalist[datalist.length - 1]) * 100 / datalist[0];
        datalist = datalist.reverse();
        labels = labels.reverse();
        
        let plusOrMinus = '';
        let lineColor = 'rgb(155, 155, 155)'; // grey
        
        if (change < 0) {
            plusOrMinus = '-';
            lineColor = 'rgb(235, 38, 51)'; // red
        } else if (change > 0) {
            plusOrMinus = '+';
            lineColor = 'rgb(60, 176, 14)'; // green
        }
        
        const intraday = new QuickChart();
        intraday.setConfig( {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Change: ${plusOrMinus} ${Math.abs(change.toFixed(2))}%`,
                    data: datalist,
                    fill: false,
                    borderColor: `${lineColor}`, 
                    tension: 0.1,
                    pointRadius: 0,
                    pointStyle: 'line',
                }]},
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: `Latest 100 ${ticker} Closes (${time} min)`,
                    },
                    legend: {
                        labels: {
                            usePointStyle: true,
                        },
                    },
                    scales: {
                        x: {
                            display: true,
                            type: 'timeseries',
                        },
                        y: {
                            display: true,
                            grace: '5%',
                        }
                    }
                } 
            })
        const url = await intraday.getShortUrl();
        return url;
    }
}
        
module.exports = chart;