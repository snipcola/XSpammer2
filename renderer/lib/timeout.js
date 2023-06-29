export const timeoutPromise = (timeout) => new Promise((resolve, reject) => {
    setTimeout(() => {
        reject(new Error('Promise timed out'));
    }, timeout);
});