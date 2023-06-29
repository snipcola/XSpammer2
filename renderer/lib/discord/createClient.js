import { SnowTransfer as Client } from 'snowtransfer';

export default async function (token) {
    try {
        const client = new Client(token);

        // Errors if invalid token
        await client.user.getSelf();

        return client;
    }
    catch {
        return false;
    };
};