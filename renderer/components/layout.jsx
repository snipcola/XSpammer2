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

    switch (context.content) {
        case 'home':
            content = <Home />;
            break;
        case 'bots':
            content = <Bots />;
            break;
        case 'bot':
            content = <Bot />;
            break;
        default:
            content = <p>Not found</p>;
    };

    return (
        <main className={styles.main}>
            <Sidebar customClass={`${styles.sidebar} ${styles.container}`} />
            <div className={`${styles.content} ${styles.container}`}>{content}</div>
        </main>
    );
};