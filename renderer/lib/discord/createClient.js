import Client from 'eris';
import { timeoutPromise } from '../timeout';

export default async function (token) {
    try {
        const client = new Client(`Bot ${token}`, { intents: ['all'] });
        const clientReadyPromise = new Promise((resolve) => client.on('ready', async function () {
            resolve(client);
        }));

        await Promise.race([client.connect(), timeoutPromise(2500)]);

        return await Promise.race([clientReadyPromise, timeoutPromise(2500)]);
    }
    catch {
        return false;
    };
};