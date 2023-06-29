import moment from 'moment';
import { SnowTransfer as Client } from 'snowtransfer';

export default async function (token) {
    try {
        const client = new Client(token);
        const info = await client.user.getSelf();

        let avatarURL;

        if (info.avatar) avatarURL = `https://cdn.discordapp.com/avatars/${info.id}/${info.avatar}`;
        else if (info.discriminator) avatarURL = `https://cdn.discordapp.com/embed/avatars/${info.discriminator % 5}.png`;
        else avatarURL = 'https://cdn.discordapp.com/embed/avatars/1.png';

        return {
            avatarURL,
            id: info.id,
            tag: info.discriminator ? `${info.username}#${info.discriminator}` : `@${info.username}`,
            createdAt: moment((parseInt(info.id) / 4194304) + 1420070400000).format('YYYY-MM-DD, HH:MM:SS')
        };
    }
    catch (err) {
        return false;
    };
};