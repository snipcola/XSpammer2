import { default as Client, Constants } from 'eris';
import moment from 'moment';

const intents = [
    Constants.Intents.guildBans,
    Constants.Intents.guildEmojisAndStickers,
    Constants.Intents.guildInvites,
    Constants.Intents.guildMembers,
    Constants.Intents.guilds
];

export function createClient ({
    token,
    bot = true,
    disableTimeout = false,
    noIntents = false
}) {
    if (!token || token === '') return false;

    return new Promise(async function (resolve) {
        const client = new Client(bot ? `Bot ${token}` : token, { intents: noIntents ? [] : intents, autoreconnect: true, maxResumeAttempts: 30 });
        
        let timeoutId;
        let intervalId;

        if (!disableTimeout) timeoutId = setTimeout(function () {
            console.error("Timeout reached while logging into instance!");

            clearInterval(intervalId);
            clearTimeout(timeoutId);

            resolve(false);
        }, 15000);

        intervalId = setInterval(function () {
            if (client?.user) {
                clearInterval(intervalId);
                if (!disableTimeout) clearTimeout(timeoutId);

                resolve(client);
            };
        }, 100);

        client.on('error', function (error) {
            console.error(error);

            clearInterval(intervalId);
            if (!disableTimeout) clearTimeout(timeoutId);
            
            resolve(false);
        });

        await client.connect();
    });
};

export async function validateToken (token, bot = true, disableTimeout = false, noIntents = false) {
    const client = await createClient({ token, bot, disableTimeout, noIntents });

    if (client) {
        const info = {
            avatarURL: client.user.avatar ? client.user.avatarURL : client.user.defaultAvatarURL,
            id: client.user.id,
            tag: client.user.discriminator !== '0' ? `${client.user.username}#${client.user.discriminator}` : client.user.username,
            createdAt: moment(client.user.createdAt).format('YYYY-MM-DD, HH:mm:ss')
        };

        client.disconnect();
        
        return info || false;
    }
    else return false;
};