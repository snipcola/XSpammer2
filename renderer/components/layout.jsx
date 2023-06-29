import styles from './layout.module.css';
import Sidebar from './sidebar';

import Home from '../content/home';
import Bots from '../content/bots';
import Bot from '../content/bot';

import { useContext } from 'react';
import { Context } from '../lib/context';

export default function () {
    const [context] = useContext(Context);

    let content;

    if (context.content === 'home') content = <Home />;
    else if (context.content === 'bots') content = <Bots />;
    else if (context.content === 'bot') content = <Bot />;
    else content = <p>Not found</p>;

    return (
        <main className={styles.main}>
            <Sidebar customClass={`${styles.sidebar} ${styles.container}`} />
            <div className={`${styles.content} ${styles.container}`}>{content}</div>
        </main>
    );
};