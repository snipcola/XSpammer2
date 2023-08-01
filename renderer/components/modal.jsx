import styles from './modal.module.css';

export default function ({ children, footer, customClass, active = false, ...props }) {
    return (
        <div className={`${styles.modal} ${active && styles['modal-active']}`} {...props}>
            <div className={`${styles.container} ${customClass}`}>
                <div className={styles['modal-content']}>
                    {children}
                </div>
                <div className={styles.footer}>
                    {footer}
                </div>
            </div>
        </div>
    );
};