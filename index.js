const Discord = require('discord.js');
require('dotenv').config();

const helpCmd = require('./commands/help');
const sdCmd = require('./commands/stockdata');
const chartCmd = require('./commands/charttest'); // command for chart testing
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] }); 

const prefix = '!';

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
            chart.execute().then((image) => {message.reply(image);});
        }
    } else if (command === 'help') {
        const help = new helpCmd();
        help.execute(message);
    } else if (command === 'stockdata' || command === 'sd') {
        if (args.length != 2) {
            message.reply('Usage: !stockdata <ticker> <time_interval>  OR  !stockdata search <name>');
            return;
        }
        const request = args.shift().toUpperCase(); // ticker or "search"
        const requestArg = args.shift(); // if ticker: time_interval, else if search: name
        let didRequestSearch = true;

        // Checks time interval validity for the ticker request and updates didRequestSearch
        if (request != 'SEARCH') {
            didRequestSearch = false;
            const intervals = ['1', '5', '15', '30', '60'];
            if (!intervals.includes(requestArg)) {
                message.reply('Invalid time interval. Please choose one of 1, 5, 15, 30, or 60 (minutes)');
                return;
            }
        }
        
        const stockdata = new sdCmd(request, requestArg, didRequestSearch);
        stockdata.execute(message, stockdata.init());    
    }
});

client.login(process.env.TOKEN);