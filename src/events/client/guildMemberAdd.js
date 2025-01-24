const { AttachmentBuilder, Events, EmbedBuilder } = require("discord.js");
const { createCanvas, Image} = require('@napi-rs/canvas');
const { readFile } = require('fs/promises');
const { request } = require('undici');
const { SALON_WELCOME } = process.env;
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const prisma = new PrismaClient();

const applyText = (canvas, text) => {
    const context = canvas.getContext('2d');
    let fontSize = 70;

    do {
        context.font = `${fontSize -= 10}px Roboto`;
    } while (context.measureText(text).width > canvas.width - 300);

    return context.font;
};

function createEmbed(user) {
    const msgWelcome = new EmbedBuilder()
        .setColor("#6441a5")
        .setTitle(`Bienvenue sur le discord de "La minute de code" ${user.username}`)
        .setDescription(`L'équipe staff te souhaite la bienvenue. N'hésites pas à discuter avec nous et les membres dans l'espace discussion et à te présenter dans le chan adéquat ! N'oublie pas de valider le réglement dans le salon <#${process.env.SALON_REGLEMENT}> , Si tu souhaite contacter le support il te suffit de DM le bot.`)
        .addFields(
            { name: 'Site Web', value: 'https://laminutedecode.io', inline: false },
            { name: 'Instagram', value: 'https://www.instagram.com/laminutedecode/' },
            { name: 'TikTok', value: 'https://www.tiktok.com/@laminutedecode', inline: false },
            { name: 'Youtube', value: 'https://www.youtube.com/channel/UCR9yKZuUdmEsC8jt8SFi1LA/videos?view=0&sort=dd&shelf_id=0', inline: false },
        )
        .setTimestamp()
        .setFooter({ text: "L'équipe de La Minute De Code" });

    return msgWelcome;
}

function roundedRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x, y + radius);
    context.lineTo(x, y + height - radius);
    context.arcTo(x, y + height, x + radius, y + height, radius);
    context.lineTo(x + width - radius, y + height);
    context.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    context.lineTo(x + width, y + radius);
    context.arcTo(x + width, y, x + width - radius, y, radius);
    context.lineTo(x + radius, y);
    context.arcTo(x, y, x, y + radius, radius);
    context.closePath();
}

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        try {
            await prisma.user.upsert({
                where: {
                    id: member.id,
                },
                update: {
                    username: member.user.username,
                    roles: member.roles.cache.map(role => role.id).join(','),
                },
                create: {
                    id: member.id,
                    username: member.user.username,
                    roles: member.roles.cache.map(role => role.id).join(','),
                }
            });

            const channel = member.client.channels.cache.get(SALON_WELCOME);
            if (!channel) return;
            
            channel.send(`👋 Bienvenue ${member} ! Quel plaisir de te voir sur notre discord. 💯 N'oublie pas de valider le réglement dans le salon <#${process.env.SALON_REGLEMENT}>`);

            const canvas = createCanvas(1100, 500);
            const context = canvas.getContext('2d');

            // Chargement de l'image de fond
            console.log('🖼️ Chargement de l\'image de fond...');
            const backgroundPath = path.join(process.cwd(), 'assets', 'img', 'wallpaper.jpg');
            console.log('📂 Chemin de l\'image:', backgroundPath);
            
            try {
                const background = await readFile(backgroundPath);
                console.log('✅ Image de fond chargée avec succès');
                
                const backgroundImage = new Image();
                backgroundImage.src = background;
                
                // Attendre que l'image soit chargée
                await new Promise((resolve, reject) => {
                    backgroundImage.onload = resolve;
                    backgroundImage.onerror = reject;
                });
                
                console.log('🎨 Dessin de l\'image de fond...');
                context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
                console.log('✅ Image de fond dessinée sur le canvas');
            } catch (error) {
                console.error('❌ Erreur lors du chargement de l\'image de fond:', error);
                // Continuer sans l'image de fond
                context.fillStyle = '#36393f';
                context.fillRect(0, 0, canvas.width, canvas.height);
            }

            context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            roundedRect(context, 50, 50, canvas.width - 100, canvas.height - 100, 20);
            context.fill();

            console.log('👤 Chargement de l\'avatar...');
            const { body } = await request(member.user.displayAvatarURL({ extension: 'jpg', size: 256 }));
            console.log('✅ Avatar récupéré depuis Discord');
            const avatar = new Image();
            const buffer = Buffer.from(await body.arrayBuffer());
            avatar.src = buffer;

            await new Promise((resolve) => {
                avatar.onload = resolve;
            });

            context.beginPath();
            let yPosition = 170;
            let radius = 100;
            context.arc(canvas.width / 2, yPosition, radius, 0, Math.PI * 2, true);
            context.closePath();
            context.save();
            context.clip();
            context.drawImage(avatar, canvas.width / 2 - radius, yPosition - radius, radius * 2, radius * 2);
            context.restore();

            context.beginPath();
            context.arc(canvas.width / 2, yPosition, radius, 0, Math.PI * 2, false);
            context.lineWidth = 10;
            context.strokeStyle = '#ffffff';
            context.stroke();

            context.font = applyText(canvas, `${member.user.username}`);

            context.fillStyle = '#ffffff';
            context.textAlign = 'center';
            context.fillText(`${member.user.username}`, canvas.width / 2, 350);

            context.font = '34px Roboto ';
            context.fillText(`Bienvenue sur le discord : ${member.guild.name}`, canvas.width / 2, 400);

            const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'profile-image.png' });

            channel.send({ files: [attachment] });
            await member.client.users.send(member.id, { embeds: [createEmbed(member.user)] })
                .catch(err => console.log('Impossible d\'envoyer le DM au nouveau membre'));

            if (member.client.updateMemberCount) await member.client.updateMemberCount();
        } catch (error) {
            console.error('❌ Erreur dans guildMemberAdd:', error);
        }
    },
};