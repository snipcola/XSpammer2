import { Client } from 'tomori-discord';

export default async function (token) {
    try {
        const client = new Client();

        await client.login(token);

        return client;
    }
    catch {
        return false;
    };
};