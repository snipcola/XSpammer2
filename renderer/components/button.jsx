import styles from './button.module.css';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';

import { useContext } from 'react';
import { Context } from '../lib/context';

export default function ({
    label = 'Button',
    variant = 'secondary',
    size = 'sm',
    iconLeft = null,
    iconRight = null,
    customClass = '',
    ...props
}) {
    const [context] = useContext(Context);

    return (
        <button disabled={context.elementsDisabled} className={`${styles.button} ${styles[`size-${size}`]} ${styles[`variant-${variant}`]} ${customClass}`} {...props}>
            {iconLeft && <Icon className={styles.icon} icon={iconLeft} />}
            <span>{label}</span>
            {iconRight && <Icon className={styles.icon} icon={iconRight} />}
        </button>
    );
};