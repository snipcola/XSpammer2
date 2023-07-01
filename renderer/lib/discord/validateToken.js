import moment from 'moment';
import Client from 'eris';
import { timeoutPromise } from '../timeout';

export default async function (token) {
    try {
        const client = new Client(`Bot ${token}`);

        const clientReadyPromise = new Promise((resolve) => client.on('ready', async function () {
            const info = {
                avatarURL: client.user.avatar ? client.user.avatarURL : client.user.defaultAvatarURL,
                id: client.user.id,
                tag: client.user.discriminator !== '0' ? `${client.user.username}#${client.user.discriminator}` : client.user.username,
                createdAt: moment(client.user.createdAt).format('YYYY-MM-DD, HH:mm:ss')
            };

            await client.disconnect();

            resolve(info || false);
        }));

        await Promise.race([client.connect(), timeoutPromise(2500)]);

        return await clientReadyPromise;
    }
    catch {
        return false;
    };
};