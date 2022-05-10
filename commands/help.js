const { MessageEmbed } = require('discord.js');
require('dotenv').config();

class helpCmd {
    constructor() {}
    
    execute(message) {
        const helpEmbed = new MessageEmbed()
        .setColor('#edea53')
        .setTitle('StockBot Help Menu')
        .setAuthor({ 
            name: 'Contact Author', 
            iconURL: 'https://blog.waalaxy.com/wp-content/uploads/2021/01/LinkedIn-Symbole.png', 
            url: process.env.LINKEDIN })
            .setDescription("I provide stock quotes and equity data for convenient access on Discord")
            .setThumbnail('https://ih1.redbubble.net/image.1059099685.8962/st,small,845x845-pad,1000x1000,f8f8f8.u1.jpg')
            .addFields(
                { name: 'Check Stock Data', 
                value: 'Usage: !stockdata <ticker> <time_interval>\nAcceptable Time Intervals (min) :   1, 5, 15, 30, 60'},
                { name: 'Search for a Company', value: 'Usage: !stockdata search <name>', inline: false },
                { name: 'NOTE: Usage Cap', 
                value: '!stockdata limited to 5 times/minute and 500 times/day\nAdditional Note: Data includes After-Hours trading', 
                inline: false },
                { name: '\u200B', value: '\u200B' },) // spacing for visual enhancement
                
                .addField('Other Commands', 'help', true)
                .setTimestamp()
                .setFooter({ text: 'Made with discord.js', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
                
        message.reply({ embeds: [helpEmbed] }); 
    }
}
        
module.exports = helpCmd;