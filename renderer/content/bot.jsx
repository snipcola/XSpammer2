import styles from './bot.module.css';
import { faList, faPowerOff, faScroll, faServer, faUsers } from '@fortawesome/free-solid-svg-icons';

import { useContext } from 'react';
import { Context } from '../lib/context';

import Button from '../components/button';
import Alert from '../components/alert';

import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';

export default function () {
    const [context, setContext] = useContext(Context);

    const client = context.client;

    async function exit () {
        await client.destroy();

        setContext({
            ...context,
            sidebarDisabled: false,
            content: 'bots',
            client: null
        });
    };

    return (
        <>
            {/* Content */}
            <div className={styles.title}>
                <h3>{client.user.tag}</h3>
                <Button
                    size='sm'
                    label='Exit'
                    iconLeft={faPowerOff}
                    customClass={styles.exit}
                    onClick={exit}
                />
            </div>

            {client ? (
                <div className={styles.flex}>
                    <div className={styles.content}>
                        <div className={styles.tabs}>
                            <div className={`${styles.tab} ${styles.active}`}>
                                <Icon className={styles.icon} icon={faServer} />
                                <p>Servers</p>
                            </div>
                            <div className={styles.tab}>
                                <Icon className={styles.icon} icon={faUsers} />
                                <p>Users</p>
                            </div>
                            <div className={styles.tab}>
                                <Icon className={styles.icon} icon={faList} />
                                <p>Channels</p>
                            </div>
                            <div className={styles.tab}>
                                <Icon className={styles.icon} icon={faScroll} />
                                <p>Roles</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.logs}>
                        <div className={styles.title}>
                            <h4>Logs</h4>
                            <div className={styles.buttons}>
                                <Button
                                    size='sm'
                                    label='Clear'
                                    customClass={styles.button}
                                />
                                <Button
                                    size='sm'
                                    label='Copy'
                                    customClass={styles.button}
                                />
                            </div>
                        </div>
                        <div className={styles.text}></div>
                    </div>
                </div>
            ) : <Alert variant='warning' description='No bot is currently connected.' style={{ marginTop: '1rem' }} />}
        </>
    );
};