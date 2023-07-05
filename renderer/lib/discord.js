import Client from 'eris';
import moment from 'moment';

export async function createClient ({
    token,
    bot = true,
    options = {
        intents: ['all']
    },
    timeout = 5000
}) {
    if (!token || token === '') return false;

    return new Promise(function (resolve) {
        const client = new Client(bot ? `Bot ${token}` : token, options);

        try { client.connect(); }
        catch { resolve(false); };

        let timeoutId;
        let intervalId;

        timeoutId = setTimeout(function () {
            clearInterval(intervalId);
            clearTimeout(timeoutId);

            resolve(false);
        }, timeout);

        intervalId = setInterval(function () {
            if (bot ? client?.ready : client?.user) {
                clearInterval(intervalId);
                clearTimeout(timeoutId);

                resolve(client);
            };
        }, 100);
    });
};

export async function validateToken (token, bot = true) {
    const client = await createClient({ token, bot });

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