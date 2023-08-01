import styles from './input.module.css';

import { useContext } from 'react';
import { Context } from '../lib/context';

export default function ({
    label = 'Button',
    placeholder = null,
    customClass = '',
    multiLine = false,
    ...props
}) {
    const [context] = useContext(Context);

    return (
        <>
            <h3 className={styles['input-label']}>{label}</h3>
            {multiLine ? (
                <textarea disabled={context.elementsDisabled} className={`${styles.input} ${customClass}`} placeholder={placeholder} {...props} />
            ) : (
                <input disabled={context.elementsDisabled} className={`${styles.input} ${customClass}`} placeholder={placeholder} {...props} />
            )}
        </>
    );
};