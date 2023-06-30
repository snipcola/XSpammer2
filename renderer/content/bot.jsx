import styles from './bot.module.css';
import { faCheck, faIcons, faList, faNoteSticky, faPowerOff, faScroll, faServer, faUsers } from '@fortawesome/free-solid-svg-icons';

import { useContext, useEffect, useState } from 'react';
import { Context, disableElements, enableElements } from '../lib/context';

import Button from '../components/button';
import Alert from '../components/alert';

import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { clipboard } from 'electron';

import Image from 'next/image';

export default function () {
    const _context = useContext(Context);
    const [context, setContext] = _context;

    const client = context.bot.client;
    const servers = context.bot.servers;

    const [selectedServer, setSelectedServer] = useState(null);
    const [selectedServerInfo, setSelectedServerInfo] = useState({
        members: null,
        channels: null,
        roles: null,
        emojis: null,
        stickers: null
    });

    const [serverAlerts, setServerAlerts] = useState([]);
    const [logs, setLogs] = useState([]);

    useEffect(function () {
        client.on('guildCreate', function () {
            setContext({ ...context, bot: { ...context.bot, servers: client.guilds } })
        });

        client.on('guildUpdate', function (server) {
            if (server.id === selectedServer?.id) {
                setSelectedServer(server);
            };

            setContext({ ...context, bot: { ...context.bot, servers: client.guilds } })
        });

        client.on('guildDelete', function (server) {
            if (server.id === selectedServer?.id) {
                setSelectedServer(null);
                setSelectedServerInfo({
                    members: null,
                    channels: null,
                    roles: null,
                    emojis: null,
                    stickers: null
                });
            };

            setContext({ ...context, bot: { ...context.bot, servers: client.guilds } })
        });
        
        client.on('guildMemberAdd', function (server) {
            if (server.id === selectedServer?.id) {
                setSelectedServerInfo({ ...selectedServerInfo, members: server.members });
            };
        });

        client.on('guildMemberUpdate', function (server) {
            if (server.id === selectedServer?.id) {
                setSelectedServerInfo({ ...selectedServerInfo, members: server.members });
            };
        });

        client.on('guildMemberRemove', function (server) {
            if (server.id === selectedServer?.id) {
                setSelectedServerInfo({ ...selectedServerInfo, members: server.members });
            };
        });

        client.on('channelCreate', function (channel) {
            if (channel?.guild?.id === selectedServer?.id) {
                setSelectedServerInfo({ ...selectedServerInfo, channels: channel.guild.channels });
            };
        });

        client.on('channelUpdate', function (channel) {
            if (channel?.guild?.id === selectedServer?.id) {
                setSelectedServerInfo({ ...selectedServerInfo, channels: channel.guild.channels });
            };
        });

        client.on('channelDelete', function (channel) {
            if (channel?.guild?.id === selectedServer?.id) {
                setSelectedServerInfo({ ...selectedServerInfo, channels: channel.guild.channels });
            };
        });

        client.on('guildRoleCreate', function (server) {
            if (server?.id === selectedServer?.id) {
                setSelectedServerInfo({ ...selectedServerInfo, roles: server.roles });
            };
        });

        client.on('guildRoleUpdate', function (server) {
            if (server?.id === selectedServer?.id) {
                setSelectedServerInfo({ ...selectedServerInfo, roles: server.roles });
            };
        });

        client.on('guildRoleDelete', function (server) {
            if (server?.id === selectedServer?.id) {
                setSelectedServerInfo({ ...selectedServerInfo, roles: server.roles });
            };
        });

        client.on('guildEmojisUpdate', function (server) {
            if (server?.id === selectedServer?.id) {
                setSelectedServerInfo({ ...selectedServerInfo, emojis: server.emojis });
            };
        });

        client.on('guildStickersUpdate', function (server) {
            if (server?.id === selectedServer?.id) {
                setSelectedServerInfo({ ...selectedServerInfo, stickers: server.stickers });
            };
        });
    }, [selectedServer, selectedServerInfo]);

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

    function selectServer (id) {
        disableElements(_context);
        setServerAlerts({ ...serverAlerts, [id]: false });

        try {
            const server = servers.get(id);

            if (!server) throw 'No server.';

            const members = server.members;
            const channels = server.channels;
            const roles = server.roles;
            const emojis = server.emojis;
            const stickers = server.stickers;

            setSelectedServer(server);
            setSelectedServerInfo({
                members,
                channels,
                roles,
                emojis,
                stickers
            });

            enableElements(_context);
        }
        catch {
            setServerAlerts({ ...serverAlerts, [id]: true });
            setTimeout(function () {
                setServerAlerts({ ...serverAlerts, [id]: false });
                enableElements(_context);
            }, 3000);
        };
    };

    const [currentTab, setCurrentTab] = useState('servers');

    const tabs = [
        {
            label: 'Servers',
            icon: faServer,
            content: (
                <div className={styles.servers}>
                    {servers?.map((server) => (
                        <div className={styles.server} key={server?.id}>
                            <Image className={styles.icon} src={server?.icon ? server.iconURL : 'https://cdn.discordapp.com/embed/avatars/1.png'} width={40} height={40} />
                            <div className={styles.info}>
                                <div className={styles.text}>
                                    <h3 className={styles.name}>{server?.name}</h3>
                                    <p className={styles.id}>Id: <b>{server?.id}</b></p>
                                    <Alert variant='warning' description={<p>Failed to select server; possibly not in server.</p>} style={{ marginTop: '1rem', display: serverAlerts[server.id] ? 'flex' : 'none' }} />
                                </div>
                                <div className={styles.buttons}>
                                    {selectedServer?.id === server?.id ? (
                                        <Button label='Selected' disabled={true} customClass={styles.button} iconLeft={faCheck} variant='primary' size='sm' />
                                    ) : (
                                        <Button label='Select' customClass={styles.button} iconLeft={faCheck} variant='secondary' size='sm' onClick={() => selectServer(server.id)} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )
        },
        {
            label: 'Server',
            icon: faServer,
            content: selectedServer ? (
                <>
                    <p>{selectedServer?.name}</p>
                    <p>{selectedServer?.id}</p>
                </>
            ) : <Alert variant='warning' description={<p>No server is currently selected.</p>} />
        },
        {
            label: 'Users',
            icon: faUsers,
            content: selectedServer ? (
                <>
                    {selectedServerInfo?.members?.map((member) => <p>{member?.username} ({member?.id})</p>)}
                </>
            ) : <Alert variant='warning' description={<p>No server is currently selected.</p>} />
        },
        {
            label: 'Channels',
            icon: faList,
            content: selectedServer ? (
                <>
                    {selectedServerInfo?.channels?.map((channel) => <p>{channel?.name} ({channel?.id})</p>)}
                </>
            ) : <Alert variant='warning' description={<p>No server is currently selected.</p>} />
        },
        {
            label: 'Roles',
            icon: faScroll,
            content: selectedServer ? (
                <>
                    {selectedServerInfo?.roles?.map((role) => <p>{role?.name} ({role?.id})</p>)}
                </>
            ) : <Alert variant='warning' description={<p>No server is currently selected.</p>} />
        },
        {
            label: 'Emojis',
            icon: faIcons,
            content: selectedServer ? (
                <>
                    {selectedServerInfo?.emojis?.map((emoji) => <p>{emoji?.name} ({emoji?.id})</p>)}
                </>
            ) : <Alert variant='warning' description={<p>No server is currently selected.</p>} />
        },
        {
            label: 'Stickers',
            icon: faNoteSticky,
            content: selectedServer ? (
                <>
                    {selectedServerInfo?.stickers?.map((sticker) => <p>{sticker?.name} ({sticker?.id})</p>)}
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
                    label=''
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
                            <h5>Logs</h5>
                            <div className={styles.buttons}>
                                <Button
                                    size='sm'
                                    label='Add (Dev)'
                                    customClass={styles.button}
                                    onClick={() => {
                                        setCount(count + 1);
                                        addLog(<p><span style={{ color: 'cyan' }}>[Snipcola: Community Server]</span> <span style={{ color: 'lightgreen' }}>Banned <b>Username#1234 ({count})</b></span></p>);
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