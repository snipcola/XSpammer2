import styles from './alert.module.css';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCheck, faTriangleExclamation, faRadiation } from '@fortawesome/free-solid-svg-icons';

export default function ({
    title = 'Title',
    description = 'Description',
    variant = 'success',
    customClass = '',
    ...props
}) {
    let icon;

    if (variant === 'success') icon = faCheck;
    else if (variant === 'warning') icon = faTriangleExclamation;
    else icon = faRadiation;

    return (
        <div className={`${styles.alert} ${styles[`variant-${variant}`]}`} {...props}>
            <Icon className={styles.icon} icon={icon} />
            <div className={styles.info}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.description}>{description}</p>
            </div>
        </div>
    );
};