import styles from './alert.module.css';

export default function ({
    description = 'Description',
    variant = 'success',
    customClass = '',
    ...props
}) {
    return (
        <div className={`${styles.alert} ${styles[`variant-${variant}`]}`} {...props}>
            <p className={styles.description}>{description}</p>
        </div>
    );
};