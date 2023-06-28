import styles from './button.module.css';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';

export default function ({
    label = 'Button',
    variant = 'secondary',
    size = 'sm',
    iconLeft = null,
    iconRight = null,
    customClass = '',
    ...props
}) {
    return (
        <button className={`${styles.button} ${styles[`size-${size}`]} ${styles[`variant-${variant}`]} ${customClass}`} {...props}>
            {iconLeft && <Icon className={styles.icon} icon={iconLeft} />}
            {label}
            {iconRight && <Icon className={styles.icon} icon={iconRight} />}
        </button>
    );
};