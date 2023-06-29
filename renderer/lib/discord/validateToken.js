import moment from 'moment';
import { Client } from 'tomori-discord';

export default async function (token) {
    try {
        const client = new Client();

        await client.login(token);

        const info = {
            avatarURL: client.user.avatar ? client.user.avatarURL : client.user.defaultAvatarURL,
            id: client.user.id,
            tag: client.user.tag,
            createdAt: moment(client.user.createdAt).format('YYYY-MM-DD, HH:MM:SS')
        };

        await client.destroy();

        return info || false;
    }
    catch {
        return false;
    };
};