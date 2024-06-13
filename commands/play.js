/*

  ________.__                        _____.___.___________
 /  _____/|  | _____    ____  ____   \__  |   |\__    ___/
/   \  ___|  | \__  \ _/ ___\/ __ \   /   |   |  |    |   
\    \_\  \  |__/ __ \\  \__\  ___/   \____   |  |    |   
 \______  /____(____  /\___  >___  >  / ______|  |____|   
        \/          \/     \/    \/   \/                  

╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║  ## Created by GlaceYT!                                                ║
║  ## Feel free to utilize any portion of the code                       ║
║  ## DISCORD :  https://discord.com/invite/xQF9f9yUEM                   ║
║  ## YouTube : https://www.youtube.com/@GlaceYt                         ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝


*/
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

const queueNames = [];

async function play(client, interaction) {
    try {
        const query = interaction.options.getString('name');

        const player = client.riffy.createConnection({
            guildId: interaction.guildId,
            voiceChannel: interaction.member.voice.channelId,
            textChannel: interaction.channelId,
            deaf: true
        });

        await interaction.deferReply();

        // Try resolving the query and log the entire response for debugging
        const resolve = await client.riffy.resolve({ query: query, requester: interaction.user });
        console.log('Resolve response:', resolve);

        // Ensure the response structure is as expected
        if (!resolve || typeof resolve !== 'object') {
            throw new TypeError('Resolve response is not an object');
        }

        const { loadType, tracks, playlistInfo } = resolve;

        if (!Array.isArray(tracks)) {
            console.error('Expected tracks to be an array:', tracks);
            throw new TypeError('Expected tracks to be an array');
        }

        if (loadType === 'PLAYLIST_LOADED') {
            for (const track of tracks) {
                track.info.requester = interaction.user;
                player.queue.add(track);
                queueNames.push(track.info.title);
            }

            if (!player.playing && !player.paused) player.play();

        } else if (loadType === 'SEARCH_RESULT' || loadType === 'TRACK_LOADED') {
            const track = tracks.shift();
            track.info.requester = interaction.user;

            player.queue.add(track);
            queueNames.push(track.info.title);

            if (!player.playing && !player.paused) player.play();
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('There are no results found.');

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        const embeds = [
            new EmbedBuilder()
                .setColor('#4d9fd6')
                .setAuthor({
                    name: 'Request Update!',
                    iconURL: 'https://cdn.discordapp.com/avatars/779507251282968587/551c11debd9c5c01f6704bb7442068a4.png?size=1024',
                    url: 'https://discord.gg/VZK8nJ3MJX'
                })
                .setDescription('➡️ **Make by Hoàng Anh | Godez Community | 2024**'),

            new EmbedBuilder()
                .setColor('#ffea00')
                .setAuthor({
                    name: 'Request Update!',
                    iconURL: 'https://cdn.discordapp.com/avatars/779507251282968587/551c11debd9c5c01f6704bb7442068a4.png?size=1024',
                    url: 'https://discord.gg/VZK8nJ3MJX'
                })
                .setDescription('➡️ **Make by Hoàng Anh | Godez Community | 2024**'),

            new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: 'Request Update!',
                    iconURL: 'https://cdn.discordapp.com/avatars/779507251282968587/551c11debd9c5c01f6704bb7442068a4.png?size=1024',
                    url: 'https://discord.gg/VZK8nJ3MJX'
                })
                .setDescription('➡️ **Make by Hoàng Anh | Godez Community | 2024**')
        ];

        const randomIndex = Math.floor(Math.random() * embeds.length);
        await interaction.followUp({ embeds: [embeds[randomIndex]] });

    } catch (error) {
        console.error('Error processing play command:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('Đã xảy ra lỗi trong khi xử lý yêu cầu của bạn.');

        await interaction.editReply({ embeds: [errorEmbed] });
    }
}

module.exports = {
    name: "play",
    description: "Phát Nhạc",
    permissions: "0x0000000000000800",
    options: [{
        name: 'name',
        description: 'nhập tên bài hát hoặc link bài hát',
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    run: play,
    queueNames: queueNames
};


/*

  ________.__                        _____.___.___________
 /  _____/|  | _____    ____  ____   \__  |   |\__    ___/
/   \  ___|  | \__  \ _/ ___\/ __ \   /   |   |  |    |   
\    \_\  \  |__/ __ \\  \__\  ___/   \____   |  |    |   
 \______  /____(____  /\___  >___  >  / ______|  |____|   
        \/          \/     \/    \/   \/                  

╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║  ## Created by GlaceYT!                                                ║
║  ## Feel free to utilize any portion of the code                       ║
║  ## DISCORD :  https://discord.com/invite/xQF9f9yUEM                   ║
║  ## YouTube : https://www.youtube.com/@GlaceYt                         ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝


*/
