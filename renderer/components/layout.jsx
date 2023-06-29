import styles from './layout.module.css';
import Sidebar from './sidebar';

import Home from '../content/home';
import Bots from '../content/bots';

import { useContext } from 'react';
import { Context } from '../lib/context';

export default function () {
    const [context] = useContext(Context);

    return (
        <main className={styles.main}>
            <Sidebar customClass={`${styles.sidebar} ${styles.container}`} />
            <div className={`${styles.right} ${context.logsActive && styles['logs-active']}`}>
                <div className={`${styles.content} ${styles.container}`}>
                    {context.content === 'home' ? <Home /> : <Bots customClass={styles.container} />}
                </div>
                <div className={`${styles.logs} ${styles.container}`}>
                    <p>Logs</p>
                </div>
            </div>
        </main>
    );
};