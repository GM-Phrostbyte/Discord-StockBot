const Discord = require('discord.js');
require('dotenv').config();

const helpCmd = require('./commands/help');
const sdCmd = require('./commands/stockdata');
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] }); 

const prefix = '!';

// testing
const chartCmd = require('./commands/charttest');

client.once('ready', () => {
    console.log('The bot is online!');
});    

client.on('messageCreate', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    
    const regex = /\s+/; // matches one or more whitespace chars
    const args = message.content.slice(prefix.length).split(regex);
    const command = args.shift().toLowerCase();
    
    
    if (command === 'test') {
        if (process.env.TEST === 'OFF') {
            message.reply('Sorry! Testing is currently off.');
        }
        else {
            const chart = new chartCmd();
            chart.execute().then((image) => {message.reply(image); });
        }
    } else if (command === 'help') {
        const help = new helpCmd();
        help.execute(message);
    } else if (command === 'stockdata' || command === 'sd') {
        if (args.length != 2) {
            message.reply('Usage: !stockdata <ticker> <time_interval>  OR  !stockdata search <name>');
            return;
        }
        const request = args.shift().toUpperCase(); // ticker data or search
        const request2 = args.shift(); // associated search
        
        if (request != 'SEARCH') {
            let found = false;
            let intervals = ['1', '5', '15', '30', '60'];
            for (let i = 0; i < intervals.length; i++) {
                if (request2 == intervals[i]) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                message.reply('Invalid time interval. Please choose one of 1, 5, 15, 30, or 60 (minutes)');
                return;
            }
        }
        
        const stockdata = new sdCmd(request, request2);
        stockdata.execute(message, stockdata.init());    
    }
});

client.login(process.env.TOKEN);