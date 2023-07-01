import defaultAlertValues from './defaultAlertValues';

export function resetAlert (alert) {
    const [_, setAlert] = alert;

    setAlert(defaultAlertValues);
};

export function showAlert (_alert, variant, title, description) {
    const [alert, setAlert] = _alert;

    setAlert((state) => ({ ...state, visible: true, variant, title, description }));
};