import Store from 'electron-store';

export const store = new Store();

export function getBots () {
    let bots = store.get('bots');

    if (!bots || !Array.isArray(bots)) {
        const emptyBots = [];

        store.set('bots', emptyBots);
        bots = emptyBots;
    };

    return bots;
};

export function setBots (array) {
    return store.set('bots', array);
};

export function findBot (id) {
    let bots = getBots();

    return bots.find((bot) => bot.id === id);
};

export function addBot ({ token, id, tag, avatarURL }) {
    if (findBot(id)) removeBot(id);

    let bots = getBots();

    bots.push({ token, id, tag, avatarURL });

    return setBots(bots);
};

export function removeBot (id) {
    let bots = getBots();

    bots = bots.filter((bot) => bot.id !== id);

    return setBots(bots);
};