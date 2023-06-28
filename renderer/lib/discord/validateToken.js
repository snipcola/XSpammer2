import { Client } from 'tomori-discord';

export default async function (token) {
    const client = new Client({ intents: [] });
    
    try {
        await client.login(token);
        await client.destroy();

        return true;
    }
    catch {
        return false;
    };
};