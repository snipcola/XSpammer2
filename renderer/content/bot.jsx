import styles from './bot.module.css';
import { faList, faPowerOff, faScroll, faServer, faUsers } from '@fortawesome/free-solid-svg-icons';

import { useContext, useState } from 'react';
import { Context } from '../lib/context';

import Button from '../components/button';
import Alert from '../components/alert';

import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { clipboard } from 'electron';

export default function () {
    const [context, setContext] = useContext(Context);
    const client = context.client;

    const [logs, setLogs] = useState([]);

    function addLog (log) {
        setLogs([ ...logs, log ]);
    };

    async function exit () {
        await client.disconnect();
    };

    const [currentTab, setCurrentTab] = useState('servers');

    const tabs = [
        {
            label: 'Servers',
            icon: faServer,
            content: (
                <h1>Servers</h1>
            )
        },
        {
            label: 'Users',
            icon: faUsers,
            content: (
                <h1>Users</h1>
            )
        },
        {
            label: 'Channels',
            icon: faList,
            content: (
                <h1>Channels</h1>
            )
        },
        {
            label: 'Roles',
            icon: faScroll,
            content: (
                <h1>Roles</h1>
            )
        }
    ];

    function copyLogs () {
        const logs = document.querySelector(`.${styles.text}`);
        const text = Array.from(logs.childNodes)
            .map((log) => log.textContent)
            .join('\n');

        clipboard.writeText(text);
    };

    client.on('disconnect', function () {
        setContext({
            ...context,
            sidebarDisabled: false,
            content: 'bots',
            client: null
        });
    });

    return (
        <>
            {/* Content */}
            <div className={styles.title}>
                <div className={styles.tabs}>
                    {tabs.map((tab) => (
                        <div key={tab.label} className={`${styles.tab} ${currentTab === tab.label.toLowerCase() && styles.active}`} onClick={() => setCurrentTab(tab.label.toLowerCase())}>
                            <Icon className={styles.icon} icon={tab.icon} />
                            <p>{tab.label}</p>
                        </div>
                    ))}
                </div>
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
                    <div className={styles.content}>{tabs.find((tab) => currentTab === tab.label.toLowerCase()).content}</div>
                    <div className={styles.logs}>
                        <div className={styles.title}>
                            <h4>Logs</h4>
                            <div className={styles.buttons}>
                                <Button
                                    size='sm'
                                    label='Add (Dev)'
                                    customClass={styles.button}
                                    onClick={() => addLog(<p><span style={{ color: 'cyan' }}>[Snipcola: Community Server]</span> Banned <b>Username#0003</b></p>)}
                                />
                                <Button
                                    size='sm'
                                    label='Copy'
                                    customClass={styles.button}
                                    onClick={copyLogs}
                                />
                                <Button
                                    size='sm'
                                    label='Clear'
                                    customClass={styles.button}
                                    onClick={() => setLogs([])}
                                />
                            </div>
                        </div>
                        <div className={styles.text}>
                            {logs.reverse()}
                        </div>
                    </div>
                </div>
            ) : <Alert variant='warning' description='No bot is currently connected.' style={{ marginTop: '1rem' }} />}
        </>
    );
};