import styles from './sidebar.module.css';

import { faHome, faBoxesStacked, faLink } from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faYoutube } from '@fortawesome/free-brands-svg-icons';
import Button from './button';

import { useContext } from 'react';
import { Context, setContextData } from '../lib/context';

class Tab {
    constructor(label = 'Button', icon = faLink, onClick = () => {}) {
        this.label = label;
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

export default function ({ customClass }) {
    const _context = useContext(Context);
    const [context] = _context;

    const tabs = [
        new Tab('Home', faHome, function () {    
            setContextData(_context, 'content', 'home');
        }),
        new Tab('Instances', faBoxesStacked, function () {    
            setContextData(_context, 'content', 'instances');
        })
    ];
    
    const buttons = [
        new _Button('Discord', undefined, faDiscord, 'https://discord.gg/aVYw6h2SYb'),
        new _Button('YouTube', 'secondary', faYoutube, 'https://youtube.com/snipcola')
    ];

    return (
        <div className={`${styles.sidebar} ${customClass}`}>
            <div className={styles.tabs}>
                {tabs.map((tab) => {
                    return (
                        <Button key={tab.label} id={`tab-${tab.label.toLowerCase()}`} customClass={`${styles.button} ${styles.tab} ${context.content === tab.label.toLowerCase() && styles['tab-active']} ${context.sidebarDisabled && styles['tab-disabled']}`} label={tab.label} size='lg' variant='secondary' iconLeft={tab.icon} onClick={tab.onClick} />
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