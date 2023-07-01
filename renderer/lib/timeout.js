export const timeoutPromise = (timeout) => new Promise((_, reject) => {
    setTimeout(() => {
        reject(new Error('Promise timed out'));
    }, timeout);
});