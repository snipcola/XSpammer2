import styles from './input.module.css';

export default function ({
    label = 'Button',
    placeholder = null,
    customClass = '',
    ...props
}) {
    return (
        <>
            <h3 className={styles['input-label']}>{label}</h3>
            <input className={`${styles.input} ${customClass}`} placeholder={placeholder} {...props} />
        </>
    );
};