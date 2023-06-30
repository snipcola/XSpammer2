import styles from './bot.module.css';
import { faList, faPowerOff, faScroll, faServer, faUsers } from '@fortawesome/free-solid-svg-icons';

import { useContext, useState } from 'react';
import { Context } from '../lib/context';

import Button from '../components/button';
import Alert from '../components/alert';

import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { clipboard } from 'electron';

export default function () {
    const [context] = useContext(Context);
    const client = context.client;

    const [selectedServer, setSelectedServer] = useState(null);
    const [logs, setLogs] = useState([]);

    function addLog (log) {
        setLogs([ ...logs, { id: logs.length + 1, log } ]);
    };

    function copyLogs () {
        const logs = document.querySelector(`.${styles.text}`);
        const text = Array.from(logs.childNodes)
            .map((log) => log.textContent)
            .reverse()
            .join('\n');

        clipboard.writeText(text);
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
            label: 'Server',
            icon: faServer,
            content: selectedServer ? (
                <>
                    <h1>Server</h1>
                </>
            ) : <Alert variant='warning' description={<p>No server is currently selected.</p>} />
        },
        {
            label: 'Users',
            icon: faUsers,
            content: selectedServer ? (
                <>
                    <h1>Users</h1>
                </>
            ) : <Alert variant='warning' description={<p>No server is currently selected.</p>} />
        },
        {
            label: 'Channels',
            icon: faList,
            content: selectedServer ? (
                <>
                    <h1>Channels</h1>
                </>
            ) : <Alert variant='warning' description={<p>No server is currently selected.</p>} />
        },
        {
            label: 'Roles',
            icon: faScroll,
            content: selectedServer ? (
                <>
                    <h1>Roles</h1>
                </>
            ) : <Alert variant='warning' description={<p>No server is currently selected.</p>} />
        }
    ];

    const [count, setCount] = useState(0);

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
                    onClick={() => client.disconnect()}
                />
            </div>

            {client ? (
                <div className={styles.flex}>
                    <div className={styles.content}>{(tabs.find((tab) => tab.label.toLowerCase() === currentTab) || tabs.find((tab) => tab.label.toLowerCase() === 'servers')).content}</div>
                    <div className={styles.logs}>
                        <div className={styles.title}>
                            <h4>Logs</h4>
                            <div className={styles.buttons}>
                                <Button
                                    size='sm'
                                    label='Add (Dev)'
                                    customClass={styles.button}
                                    onClick={() => {
                                        setCount(count + 1);
                                        addLog(<p><span style={{ color: 'cyan' }}>[Snipcola: Community Server]</span> Banned <b>Username#1234 ({count})</b></p>);
                                    }}
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
                        <div className={styles.text}>{logs.sort((a, b) => b.id - a.id).map(({ log }) => log)}</div>
                    </div>
                </div>
            ) : <Alert variant='warning' description={<p>No bot is currently connected.</p>} style={{ marginTop: '1rem' }} />}
        </>
    );
};