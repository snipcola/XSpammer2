import React from 'react';

export const Context = React.createContext();

export function setContextData (_context, data, newData) {
    const [context, setContext] = _context;

    setContext({ ...context, [data]: newData });
};

export function disableElements (_context) {
    setContextData(_context, 'elementsDisabled', true);
};

export function enableElements (_context) {
    setContextData(_context, 'elementsDisabled', false);
};