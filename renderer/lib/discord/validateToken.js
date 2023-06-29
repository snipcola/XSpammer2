/* import moment from 'moment';

export default async function (token) {
    try {
        const { client, gateway } = createClient(token);

        await gateway.connect();

        const user = await client.api.users.getCurrent();

        console.log(user);

        const info = {
            avatarURL: user.avatar(),
            tag: user.username,
            createdAt: moment(user.).format('YYYY-MM-DD, HH:MM:SS')
        };

        await gateway.destroy();

        return info ?? false;
    }
    catch {
        return false;
    };
}; */

export default async function (_) {
    return false;
};