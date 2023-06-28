import styles from './sidebar.module.css';
import Image from 'next/image';

import { faHome, faBoxesStacked, faTerminal, faLink } from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faYoutube } from '@fortawesome/free-brands-svg-icons';
import Button from './button';

class Tab {
    constructor(label = 'Button', icon = faLink, active = false, onClick = () => {}) {
        this.label = label;
        this.active = active;
        this.icon = icon;
        this.onClick = onClick;
    }
};

class _Button {
    constructor(label, variant, icon = faLink, link) {
        this.label = label || 'Button';
        this.variant = variant || 'primary';
        this.icon = icon;
        this.link = link;
    }
};

export default function ({ customClass, setContent, logsActive, setLogsActive }) {
    const tabs = [
        new Tab('Home', faHome, true, function () {
            const home = document.querySelector(`#tab-home`);
            const bots = document.querySelector(`#tab-bots`);
    
            home.classList.add(styles['tab-active']);
            bots.classList.remove(styles['tab-active']);
    
            setContent('home');
        }),
        new Tab('Bots', faBoxesStacked, false, function () {
            const home = document.querySelector(`#tab-home`);
            const bots = document.querySelector(`#tab-bots`);
    
            home.classList.remove(styles['tab-active']);
            bots.classList.add(styles['tab-active']);
    
            setContent('bots');
        }),
        new Tab('Logs', faTerminal, logsActive, function () {
            const logs = document.querySelector(`#tab-logs`);
    
            setLogsActive(!logsActive);
            logs.classList.toggle(styles['tab-active']);
        })
    ];
    
    const buttons = [
        new _Button('Discord', undefined, faDiscord, 'https://discord.gg/aVYw6h2SYb'),
        new _Button('YouTube', 'secondary', faYoutube, 'https://youtube.com/snipcola')
    ];

    return (
        <div className={`${styles.sidebar} ${customClass}`}>
            <div className={styles.branding}>
                <Image alt='XSpammer 2' src='/images/icon-text.png' className={styles.icon} width={200} height={50} />
                <p className={styles.info}>Snipcola ~ v0.0.1</p>
            </div>
            <div className={styles.tabs}>
                {tabs.map((tab) => {
                    return (
                        <Button key={tab.label} id={`tab-${tab.label.toLowerCase()}`} customClass={`${styles.button} ${styles.tab} ${tab.active && styles['tab-active']}`} label={tab.label} size='lg' variant='secondary' iconLeft={tab.icon} onClick={tab.onClick} />
                    );
                })}
            </div>
            <div className={styles.buttons}>
                {buttons.map((button) => {
                    return (
                        <a key={button.label} className={styles.link} target='_blank' href={button.link}>
                            <Button customClass={styles.button} label={button.label} size='md' variant={button.variant} iconLeft={button.icon} />
                        </a>
                    );
                })}
            </div>
        </div>
    );
};