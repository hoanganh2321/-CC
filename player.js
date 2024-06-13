const { Riffy } = require("riffy");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { queueNames } = require("./commands/play");

function initializePlayer(client) {
    const nodes = [
        {
            host: "lava-v4.ajieblogs.eu.org",
            password: "https://dsc.gg/ajidevserver",
            port: 443,
            secure: true
        },
    ];

    client.riffy = new Riffy(client, nodes, {
        send: (payload) => {
            const guildId = payload.d.guild_id;
            if (!guildId) return;

            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        },
        defaultSearchPlatform: "ytmsearch",
        restVersion: "v3"
    });

    client.riffy.on("nodeConnect", node => {
        console.log(`Node "${node.name}" connected.`);
    });

    client.riffy.on("nodeError", (node, error) => {
        console.error(`Node "${node.name}" encountered an error: ${error.message}.`);
    });

    client.riffy.on("trackStart", async (player, track) => {
        const channel = client.channels.cache.get(player.textChannel);

        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setAuthor({
                name: 'Now Playing',
                iconURL: 'https://cdn.discordapp.com/attachments/1230824451990622299/1236664581364125787/music-play.gif?ex=6638d524&is=663783a4&hm=5179f7d8fcd18edc1f7d0291bea486b1f9ce69f19df8a96303b75505e18baa3a&',
                url: ''
            })
            .setDescription(`:exclamation~1:  **Tên Bài Hát:** [${track.info.title}](${track.info.uri})\n:exclamation~1:   **Tác giả:** ${track.info.author}\n:exclamation~1:    **Nền Tảng :** YouTube, Spotify`)
            .setImage(`https://cdn.discordapp.com/attachments/1004341381784944703/1165201249331855380/RainbowLine.gif?ex=663939fa&is=6637e87a&hm=e02431de164b901e07b55d8f8898ca5b1b2832ad11985cecc3aa229a7598d610&`)
            .setThumbnail(track.info.thumbnail)
            .setTimestamp()
            .setFooter({ text: 'Make by Hoàng Anh | Godez Community | 2024' });


        const queueLoopButton = new ButtonBuilder()
            .setCustomId("loopQueue")
            .setLabel("Bật Lặp Lại")
            .setStyle(ButtonStyle.Primary);

        const disableLoopButton = new ButtonBuilder()
            .setCustomId("disableLoop")
            .setLabel("Tắt Lặp Lại")
            .setStyle(ButtonStyle.Primary);

        const skipButton = new ButtonBuilder()
            .setCustomId("skipTrack")
            .setLabel("Bỏ Qua")
            .setStyle(ButtonStyle.Success);

        const showQueueButton = new ButtonBuilder()
            .setCustomId("showQueue")
            .setLabel("Hiển Thị Danh Sách Phát")
            .setStyle(ButtonStyle.Primary);
        const clearQueueButton = new ButtonBuilder()
            .setCustomId("clearQueue")
            .setLabel("Xóa Danh Sách Phát")
            .setStyle(ButtonStyle.Danger);


        const actionRow = new ActionRowBuilder()
            .addComponents(queueLoopButton, disableLoopButton, showQueueButton, clearQueueButton, skipButton);


        const message = await channel.send({ embeds: [embed], components: [actionRow] });


        const filter = i => i.customId === 'loopQueue' || i.customId === 'skipTrack' || i.customId === 'disableLoop' || i.customId === 'showQueue' || i.customId === 'clearQueue';
        const collector = message.createMessageComponentCollector({ filter, time: 180000 });
        setTimeout(() => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    queueLoopButton.setDisabled(true),
                    disableLoopButton.setDisabled(true),
                    skipButton.setDisabled(true),
                    showQueueButton.setDisabled(true),
                    clearQueueButton.setDisabled(true)
                );


            message.edit({ components: [disabledRow] })
                .catch(console.error);
        }, 180000);
        collector.on('collect', async i => {
            await i.deferUpdate();
            if (i.customId === 'loopQueue') {
                setLoop(player, 'queue');
                const loopEmbed = new EmbedBuilder()
                    .setAuthor({
                        name: ' Bật Lặp Lại',
                        iconURL: 'https://cdn.discordapp.com/avatars/779507251282968587/551c11debd9c5c01f6704bb7442068a4.png?size=1024',
                        url: ''
                    })
                    .setColor("#00FF00")
                    .setTitle("**Lặp Lại Đã Được Bật!**")


                await channel.send({ embeds: [loopEmbed] });
            } else if (i.customId === 'skipTrack') {
                player.stop();
                const skipEmbed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setAuthor({
                        name: 'Bỏ Qua Bài Khác',
                        iconURL: 'https://cdn.discordapp.com/avatars/779507251282968587/551c11debd9c5c01f6704bb7442068a4.png?size=1024',
                        url: ''
                    })
                    .setTitle("**Người chơi sẽ phát bài hát tiếp theo!**")
                    .setTimestamp();


                await channel.send({ embeds: [skipEmbed] });
            } else if (i.customId === 'disableLoop') {
                setLoop(player, 'none');
                const loopEmbed = new EmbedBuilder()
                    .setColor("#0099ff")
                    .setAuthor({
                        name: 'Tắt Lặp Lại',
                        iconURL: 'https://cdn.discordapp.com/avatars/779507251282968587/551c11debd9c5c01f6704bb7442068a4.png?size=1024',
                        url: ''
                    })
                    .setDescription('**Lặp Lại Đã Tắt!**');
                    

                    await channel.send({ embeds: [loopEmbed] });
                } else if (i.customId === 'showQueue') {
    
                    const pageSize = 10;
    
                    const queueMessage = queueNames.length > 0 ?
                        queueNames.map((song, index) => `${index + 1}. ${song}`).join('\n') :
                        "Danh Sách Phát Trống";
    
    
                    const pages = [];
                    for (let i = 0; i < queueNames.length; i += pageSize) {
                        const page = queueNames.slice(i, i + pageSize);
                        pages.push(page);
                    }
    
                    for (let i = 0; i < pages.length; i++) {
                        const numberedSongs = pages[i].map((song, index) => `${index + 1}. ${song}`).join('\n');
    
                        const queueEmbed = new EmbedBuilder()
                            .setColor("#0099ff")
                            .setTitle(`Current Queue (Page ${i + 1}/${pages.length})`)
                            .setDescription(numberedSongs);
    
                        await channel.send({ embeds: [queueEmbed] });
                    }
    
                } else if (i.customId === 'clearQueue') {
                    clearQueue(player);
                    const queueEmbed = new EmbedBuilder()
                        .setColor("#0099ff")
                        .setAuthor({
                            name: 'Xóa Danh Sách Chờ',
                            iconURL: 'https://cdn.discordapp.com/avatars/779507251282968587/551c11debd9c5c01f6704bb7442068a4.png?size=1024',
                            url: 'https://discord.gg/xQF9f9yUEM'
                        })
                        .setDescription('**Danh Sách Chờ Đã Xóa Thành Công**');
    
    
                    await channel.send({ embeds: [queueEmbed] });
                }
            });
    
            collector.on('end', collected => {
                console.log(`Collected ${collected.size} interactions.`);
            });
        });
    
        client.riffy.on("queueEnd", async (player) => {
            const channel = client.channels.cache.get(player.textChannel);
            const autoplay = false;
    
            if (autoplay) {
                player.autoplay(player);
            } else {
                player.destroy();
                const queueEmbed = new EmbedBuilder()
                    .setColor("#0099ff")
                    .setDescription('**Bài hát đã kết thúc! Ngắt kết nối Bot!**');
    
    
                await channel.send({ embeds: [queueEmbed] });
            }
        });
    
    
        function setLoop(player, loopType) {
            if (loopType === "queue") {
                player.setLoop("queue");
            } else {
                player.setLoop("none");
            }
        }
    
    
        function clearQueue(player) {
            player.queue.clear();
            queueNames.length = 0;
        }
    
    
        function showQueue(channel, queue) {
            const queueList = queue.map((track, index) => `${index + 1}. ${track.info.title}`).join('\n');
            const queueEmbed = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle("Queue")
                .setDescription(queueList);
            channel.send({ embeds: [queueEmbed] });
        }
    
        module.exports = { initializePlayer, setLoop, clearQueue, showQueue };
    }
    
    module.exports = { initializePlayer };
    
