const { MessageEmbed } = require('discord.js');
const axios = require('axios').default;
const chartCmd = require('./chart');
const puppeteer = require('puppeteer');
require('dotenv').config();

class sdCmd {
    constructor(request, requestArg, didRequestSearch) {
        if (didRequestSearch) {
            this.requestedSearch = true;
            this.name = requestArg;
        } else {
            this.requestedSearch = false;
            this.ticker = request;
            this.time = requestArg;
        }
    }
    
    init() {
        const stock = {
            method: 'GET',
            url: 'https://alpha-vantage.p.rapidapi.com/query',
            ...((!this.requestedSearch) && {
                params: {
                    interval: `${this.time}min`,
                    function: 'TIME_SERIES_INTRADAY',
                    symbol: this.ticker,
                    datatype: 'json',
                    output_size: 'compact'
                } }),
                
            ...((this.requestedSearch) && {
                params: {keywords: `${this.name}`, function: 'SYMBOL_SEARCH', datatype: 'json'} }),
                headers: {
                    'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com',
                    'x-rapidapi-key': process.env.API_KEY
                }
        };
        return stock;
    }
            
            
    execute(message, stock) {
        axios.request(stock).then(response => {
            
            async function scrapeLogo(url) {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.goto(url);
                
                const [logo] = await page.$x('/html/body/div[2]/div[4]/div[3]/header/div/div[2]/img'); 
                const src = await logo.getProperty('src');
                const srcLink = await src.jsonValue();
                
                await browser.close();
                return srcLink;
            }
            
            if (!this.requestedSearch) {
                if (response.data.hasOwnProperty([ 'Error Message' ])) {
                    message.reply('Invalid ticker. Type !help for assistance.');
                } else {
                    const metaData = response.data[ 'Meta Data' ];
                    const last = metaData[ '3. Last Refreshed' ];
                    const data = response.data[ `Time Series (${this.time}min)` ];
                    const singleData = data[last];
                    
                    const chart = new chartCmd();
                    
                    chart.execute(data, this.time, this.ticker).then((image) => {
                        let finalStr = '';
                        for (let key in singleData) {
                            if (singleData.hasOwnProperty(key)) {
                                if (key === '5. volume') {
                                    finalStr += (`${key}` + ` ${singleData[key]}\n`);
                                } else {
                                    finalStr += (`${key}` + ` ${parseFloat(singleData[key]).toFixed(2)}\n`);
                                }
                            }
                        }
                        
                        scrapeLogo(`https://www.tradingview.com/symbols/${this.ticker}/`).then((srcLink) => {
                            const dataEmbed = new MessageEmbed()
                            .setColor('#8fe166')
                            .setTitle(`${this.ticker}`)
                            .setAuthor({ 
                                name: 'Visit Yahoo Finance', 
                                iconURL: 'https://s.yimg.com/cv/apiv2/myc/finance/Finance_icon_0919_250x252.png', 
                                url: `https://finance.yahoo.com/quote/${this.ticker}/` })
                                .setDescription(`Last Refresh: ${last.slice(0, -3)}` + ` ${metaData[ '6. Time Zone' ]} Time`)
                                .setThumbnail(`${srcLink}`) // discord does not support SVG files so it does not render
                                .addFields(
                                    { name: `Most Recent Quote (${this.time} min)`, value: finalStr, inline: true },)                                  
                                    .setImage(image)
                                    .setTimestamp()
                                    .setFooter({ text: 'Graphed with quickchart.js', iconURL: 'https://avatars.githubusercontent.com/u/10342521?s=200&v=4' });
                                    
                            message.reply({ embeds: [dataEmbed] })
                        }); 
                    });
                }
            } else if (this.requestedSearch) {
                const matches = response.data.bestMatches;
                if (matches.length === 0) {
                    message.reply('Sorry! No Matches Found. Perhaps check your spelling?');
                } else {
                    const bestMatch = matches[0];
                    const ticker = bestMatch[ '1. symbol' ];
                    
                    let finalStr = '';
                    for (let key in bestMatch) {
                        if (bestMatch.hasOwnProperty(key)) {
                            if (key != '9. matchScore' && key != '2. name' && key != '3. type' && key != '1. symbol') {
                                finalStr += (`${key}` + ` ${bestMatch[key]}\n`);
                            }
                        }
                    }
                  
                    const searchEmbed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`${bestMatch[ '2. name' ]}`)
                    .setAuthor({ 
                        name: 'Visit Yahoo Finance', 
                        iconURL: 'https://s.yimg.com/cv/apiv2/myc/finance/Finance_icon_0919_250x252.png', 
                        url: `https://finance.yahoo.com/quote/${ticker}/` })
                        .setDescription(`Ticker: ${ticker}\nType: ${bestMatch[ '3. type' ]}`)
                        .addFields(
                            { name: 'Other Information', value: finalStr, inline: true},
                            { name: '\u200B', value: '\u200B' },
                            { name: `Get a quote using the command below:`, 
                            value: `!stockdata ${ticker} <time interval>\nType !help for additional usage info`, inline: true},)
                            .setTimestamp()
                            .setFooter({ text: 'Data from Alpha Vantage API', iconURL: 'https://miro.medium.com/max/1024/1*UCZCB7Vx3EJ9FN-pen4BqQ.png' });
                            
                    message.reply({ embeds: [searchEmbed] });   
                }
            }
        }).catch(error => {console.error(error);});
    }
}
                                        
module.exports = sdCmd;