import styles from './alert.module.css';

export default function ({
    description = 'Description',
    variant = 'success',
    customClass = '',
    ...props
}) {
    return (
        <div className={`${styles.alert} ${styles[`variant-${variant}`]}`} {...props}>
            <div className={styles.description}>{description}</div>
        </div>
    );
};