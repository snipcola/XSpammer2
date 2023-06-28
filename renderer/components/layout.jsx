import styles from './layout.module.css';
import Sidebar from './sidebar';

import Home from '../content/home';
import Bots from '../content/bots';

import { useState } from 'react';

export default function () {
    let [content, setContent] = useState('home');
    let [logsActive, setLogsActive] = useState(true);

    return (
        <main className={styles.main}>
            <Sidebar customClass={`${styles.sidebar} ${styles.container}`} setContent={setContent} logsActive={logsActive} setLogsActive={setLogsActive} />
            <div className={`${styles.right} ${logsActive && styles['logs-active']}`}>
                <div className={`${styles.content} ${styles.container}`}>
                    {content === 'home' ? <Home /> : <Bots customClass={styles.container} />}
                </div>
                <div className={`${styles.logs} ${styles.container}`}>
                    <p>Logs</p>
                </div>
            </div>
        </main>
    );
};