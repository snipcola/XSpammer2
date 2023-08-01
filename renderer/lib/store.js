import Store from 'electron-store';

export const store = new Store();

export function getInstances () {
    let instances = store.get('instances');

    if (!instances || !Array.isArray(instances)) {
        const emptyInstances = [];

        store.set('instances', emptyInstances);
        instances = emptyInstances;
    };

    return instances;
};

export function setInstances (array) {
    return store.set('instances', array);
};

export function findInstance (id) {
    let instances = getInstances();

    return instances.find((instance) => instance.id === id);
};

export function addInstance ({ token, bot, timeoutDisabled, noIntents, id, tag, avatarURL }) {
    if (findInstance(id)) removeInstance(id);

    let instances = getInstances();

    instances.push({ token, bot, timeoutDisabled, noIntents, id, tag, avatarURL });

    return setInstances(instances);
};

export function removeInstance (id) {
    let instances = getInstances();

    instances = instances.filter((instance) => instance.id !== id);

    return setInstances(instances);
};