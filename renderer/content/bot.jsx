import styles from './bot.module.css';
import { faCheck, faIcons, faList, faNoteSticky, faPowerOff, faScroll, faServer, faTrash, faUsers } from '@fortawesome/free-solid-svg-icons';

import { useCallback, useContext, useEffect, useState } from 'react';
import { Context, disableElements, enableElements } from '../lib/context';

import Button from '../components/button';
import Alert from '../components/alert';

import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { clipboard } from 'electron';

import Image from 'next/image';
import Table from 'react-data-table-component';

import moment from 'moment';
import Modal from '../components/modal';
import Input from '../components/input';

import fs from 'fs/promises';
import { useOpenFileDialog } from 'react-use-open-file-dialog';

export default function () {
    const _context = useContext(Context);
    const [context, setContext] = _context;

    const client = context.bot.client;
    const servers = context.bot.servers;

    const dialog = useOpenFileDialog();

    const [selectedServer, setSelectedServer] = useState(null);
    const [selectedServerInfo, setSelectedServerInfo] = useState({
        members: null,
        channels: null,
        roles: null,
        emojis: null,
        stickers: null,
        bans: null,
        templates: null
    });

    const [serverAlerts, setServerAlerts] = useState([]);
    const [logs, setLogs] = useState([]);

    useEffect(function () {
        client.on('guildCreate', function () {
            setContext((state) => ({ ...state, bot: { ...state.bot, servers: client.guilds } }))
        });

        client.on('guildUpdate', function (server) {
            if (server.id === selectedServer?.id) {
                setSelectedServer(server);
            };

            setContext((state) => ({ ...state, bot: { ...state.bot, servers: client.guilds } }))
        });

        client.on('guildDelete', function (server) {
            if (server.id === selectedServer?.id) {
                setSelectedServer(null);
                setSelectedServerInfo({
                    members: null,
                    channels: null,
                    roles: null,
                    emojis: null,
                    stickers: null,
                    bans: null,
                    templates: null
                });
            };

            setContext((state) => ({ ...state, bot: { ...state.bot, servers: client.guilds } }))
        });
        
        client.on('guildMemberAdd', function (server) {
            if (server.id === selectedServer?.id) {
                setSelectedServerInfo((state) => ({ ...state, members: server.members }));
            };
        });

        client.on('guildMemberUpdate', function (server) {
            if (server.id === selectedServer?.id) {
                setSelectedServerInfo((state) => ({ ...state, members: server.members }));
            };
        });

        client.on('guildMemberRemove', function (server) {
            if (server.id === selectedServer?.id) {
                setSelectedServerInfo((state) => ({ ...state, members: server.members }));
            };
        });

        client.on('channelCreate', function (channel) {
            if (channel?.guild?.id === selectedServer?.id) {
                setSelectedServerInfo((state) => ({ ...state, channels: channel.guild.channels }));
            };
        });

        client.on('channelUpdate', function (channel) {
            if (channel?.guild?.id === selectedServer?.id) {
                setSelectedServerInfo((state) => ({ ...state, channels: channel.guild.channels }));
            };
        });

        client.on('channelDelete', function (channel) {
            if (channel?.guild?.id === selectedServer?.id) {
                setSelectedServerInfo((state) => ({ ...state, channels: channel.guild.channels }));
            };
        });

        client.on('guildRoleCreate', function (server) {
            if (server?.id === selectedServer?.id) {
                setSelectedServerInfo((state) => ({ ...state, roles: server.roles }));
            };
        });

        client.on('guildRoleUpdate', function (server) {
            if (server?.id === selectedServer?.id) {
                setSelectedServerInfo((state) => ({ ...state, roles: server.roles }));
            };
        });

        client.on('guildRoleDelete', function (server) {
            if (server?.id === selectedServer?.id) {
                setSelectedServerInfo((state) => ({ ...state, roles: server.roles }));
            };
        });

        client.on('guildEmojisUpdate', function (server) {
            if (server?.id === selectedServer?.id) {
                setSelectedServerInfo((state) => ({ ...state, emojis: server.emojis }));
            };
        });

        client.on('guildStickersUpdate', function (server) {
            if (server?.id === selectedServer?.id) {
                setSelectedServerInfo((state) => ({ ...state, stickers: server.stickers }));
            };
        });

        client.on('guildBanAdd', async function (server) {
            try {
                const bans = await server.getBans();

                setSelectedServerInfo((state) => ({ ...state, bans }));
            }
            catch { }; 
        });

        client.on('guildBanRemove', async function (server) {
            try {
                const bans = await server.getBans();

                setSelectedServerInfo((state) => ({ ...state, bans }));
            }
            catch { }; 
        });
    }, [selectedServer, setContext, setSelectedServer, setSelectedServerInfo]);

    function addLog (log) {
        setLogs((state) => [ ...state, { id: state.length + 1, log } ]);
    };

    function copyLogs () {
        const logs = document.querySelector(`.${styles.text}`);
        const text = Array.from(logs.childNodes)
            .map((log) => log.textContent)
            .reverse()
            .join('\n');

        clipboard.writeText(text);
    };

    async function selectServer (id) {
        disableElements(_context);
        setServerAlerts((state) => ({ ...state, [id]: false }));

        try {
            const server = servers.get(id);

            if (!server) throw 'No server.';

            const members = server.members;
            const channels = server.channels;
            const roles = server.roles;
            const emojis = server.emojis;
            const stickers = server.stickers;

            const bans = await server.getBans();
            const templates = await server.getTemplates();

            setSelectedServer(server);
            setSelectedServerInfo({
                members,
                channels,
                roles,
                emojis,
                stickers,
                bans,
                templates
            });

            enableElements(_context);
        }
        catch {
            setServerAlerts((state) => ({ ...state, [id]: true }));
            setTimeout(function () {
                setServerAlerts((state) => ({ ...state, [id]: false }));
                enableElements(_context);
            }, 3000);
        };
    };

    async function leaveServer (server) {
        disableElements(_context);

        const name = server.name;

        try {
            await server?.leave();

            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Left server</span>
            </p>);
        }
        catch {
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to leave server</span>
            </p>);
        };

        enableElements(_context);
    };

    const [currentTab, setCurrentTab] = useState('servers');

    function getTimeUnitMultiplier (timeUnit) {
        const millisecondsMap = { s: 1000, m: 1000 * 60, h: 1000 * 60 * 60, d: 1000 * 60 * 60 * 24 };
        
        return millisecondsMap[timeUnit];
    };
    
    function convertStringToDate (timeString) {
        const timeRegex = /(\d+[smhd])/g;
        
        let totalMilliseconds = 0;
        let match;
        
        while ((match = timeRegex.exec(timeString)) !== null) {
            const [timeValue, timeUnit] = match[0].split(/(?=[smhd])/);
        
            totalMilliseconds += parseInt(timeValue) * getTimeUnitMultiplier(timeUnit);
        };
        
        return new Date(new Date().getTime() + totalMilliseconds);
    };

    const userColumns = [
        {
            name: 'User',
            selector: row => row.user,
            sortable: true
        },
        {
            name: 'Online',
            selector: row => row.online,
            sortable: true
        },
        {
            name: 'Bot',
            selector: row => row.bot,
            sortable: true
        }
    ];

    const roleColumns = [
        {
            name: 'Id',
            selector: row => row.id,
            sortable: true
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true
        },
        {
            name: 'Created',
            selector: row => row.created,
            sortable: true
        }
    ];

    const banColumns = [
        {
            name: 'Id',
            selector: row => row.id,
            sortable: true
        },
        {
            name: 'User',
            selector: row => row.user,
            sortable: true
        },
        {
            name: 'Bot',
            selector: row => row.bot,
            sortable: true
        }
    ];

    const templateColumns = [
        {
            name: 'Code',
            selector: row => row.id,
            sortable: true
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true
        },
        {
            name: 'Synced',
            selector: row => row.synced,
            sortable: true
        }
    ];
    
    const [selectedUsers, setSelectedUsers] = useState([]);
    const handleUserSelected = useCallback((s) => setSelectedUsers(s.selectedRows), []);

    const [selectedBanUsers, setSelectedBanUsers] = useState([]);
    const handleBanUserSelected = useCallback((s) => setSelectedBanUsers(s.selectedRows), []);

    const [selectedTemplates, setSelectedTemplates] = useState([]);
    const handleTemplateSelected = useCallback((s) => setSelectedTemplates(s.selectedRows), []);

    const [selectedRemoveRoles, setSelectedRemoveRoles] = useState([]);
    const handleRemoveRoleSelected = useCallback((s) => setSelectedRemoveRoles(s.selectedRows), []);

    const [selectedAddRoles, setSelectedAddRoles] = useState([]);
    const handleAddRoleSelected = useCallback((s) => setSelectedAddRoles(s.selectedRows), []);

    const [userNicknameModalActive, setUserNicknameModalActive] = useState(false);
    const [userNicknameValue, setUserNicknameValue] = useState('');
    const [userNicknameReasonValue, setUserNicknameReasonValue] = useState('');

    async function usersNickname () {
        setUserNicknameModalActive(false);

        try {
            const members = await selectedServer.fetchMembers({ userIDs: selectedUsers.map((u) => u?.id) });
            const promises = members.map(function (member) {
                return new Promise(async function (resolve) {
                    try {
                        await member.edit({ nick: userNicknameValue }, userNicknameReasonValue || undefined);
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>Nicknamed <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> to <b>"{userNicknameValue}"</b> (reason: <b>"{userNicknameReasonValue}"</b>)</span>
                        </p>);
                    }
                    catch {
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crimson' }}>Failed to nickname <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> to <b>"{userNicknameValue}"</b> (reason: <b>"{userNicknameReasonValue}"</b>)</span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch {
            selectedUsers.forEach(function user () {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to nickname <b>{user.user}</b> to <b>"{userNicknameValue}"</b> (reason: <b>"{userNicknameReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [userTimeoutModalActive, setUserTimeoutModalActive] = useState(false);
    const [userTimeoutValue, setUserTimeoutValue] = useState('');
    const [userTimeoutReasonValue, setUserTimeoutReasonValue] = useState('');

    async function usersTimeout () {
        setUserTimeoutModalActive(false);

        try {
            const members = await selectedServer.fetchMembers({ userIDs: selectedUsers.map((u) => u?.id) });
            const time = convertStringToDate(userTimeoutValue);
            const promises = members.map(function (member) {
                return new Promise(async function (resolve) {
                    try {
                        await member.edit({ communicationDisabledUntil: time }, userTimeoutReasonValue || undefined);
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>Timed out <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> for <b>"{userTimeoutValue}"</b> (reason: <b>"{userTimeoutReasonValue}"</b>)</span>
                        </p>);
                    }
                    catch {
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crimson' }}>Failed to time out <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> for <b>"{userTimeoutValue}"</b> (reason: <b>"{userTimeoutReasonValue}"</b>)</span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch {
            selectedUsers.forEach(function user () {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to time out <b>{user.user}</b> for <b>"{userTimeoutValue}"</b> (reason: <b>"{userTimeoutReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [userKickModalActive, setUserKickModalActive] = useState(false);
    const [userKickReasonValue, setUserKickReasonValue] = useState('');

    async function usersKick () {
        setUserKickModalActive(false);

        try {
            const members = await selectedServer.fetchMembers({ userIDs: selectedUsers.map((u) => u?.id) });
            const promises = members.map(function (member) {
                return new Promise(async function (resolve) {
                    try {
                        await member.kick(userKickReasonValue);
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>Kicked <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> (reason: <b>"{userKickReasonValue}"</b>)</span>
                        </p>);
                    }
                    catch {
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crimson' }}>Failed to kick <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> (reason: <b>"{userKickReasonValue}"</b>)</span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch {
            selectedUsers.forEach(function user () {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to kick <b>{user.user}</b> (reason: <b>"{userKickReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [userBanModalActive, setUserBanModalActive] = useState(false);
    const [userBanValue, setUserBanValue] = useState('');
    const [userBanReasonValue, setUserBanReasonValue] = useState('');

    async function usersBan () {
        setUserBanModalActive(false);

        try {
            const members = await selectedServer.fetchMembers({ userIDs: selectedUsers.map((u) => u?.id) });
            const promises = members.map(function (member) {
                return new Promise(async function (resolve) {
                    try {
                        await member.ban(userBanValue && userBanValue !== "" ? parseInt(userBanValue) : 0, userBanReasonValue);
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>Banned <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> and deleted messages from last <b>{userBanValue && userBanValue !== "" ? parseInt(userBanValue) : 0}</b> days (reason: <b>"{userBanReasonValue}"</b>)</span>
                        </p>);
                    }
                    catch {
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crimson' }}>Failed to ban <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> and delete messages from last <b>{userBanValue && userBanValue !== "" ? parseInt(userBanValue) : 0}</b> days (reason: <b>"{userBanReasonValue}"</b>)</span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch {
            selectedUsers.forEach(function user () {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to ban <b>{user.user}</b> and delete messages from last <b>{userBanValue && userBanValue !== "" ? parseInt(userBanValue) : 0}</b> days (reason: <b>"{userBanReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [userDMModalActive, setUserDMModalActive] = useState(false);
    const [userDMValue, setUserDMValue] = useState('');

    async function usersDM () {
        setUserDMModalActive(false);

        try {
            const members = await selectedServer.fetchMembers({ userIDs: selectedUsers.map((u) => u?.id) });
            const promises = members.map(function (member) {
                return new Promise(async function (resolve) {
                    try {
                        const dmChannel = await member.user.getDMChannel();
    
                        await dmChannel.createMessage(userDMValue);
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>DMed <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> with <b>{userDMValue}</b></span>
                        </p>);
                    }
                    catch {
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crimson' }}>Failed to DM <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> with <b>{userDMValue}</b></span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch {
            selectedUsers.forEach(function user () {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to DM <b>{user.user}</b> with <b>{userDMValue}</b></span>
                </p>);
            });
        };
    };

    const [serverRenameModalActive, setServerRenameModalActive] = useState(false);
    const [serverNameValue, setServerNameValue] = useState('');
    const [serverNameReasonValue, setServerNameReasonValue] = useState('');

    async function serverRename () {
        setServerRenameModalActive(false);

        try {
            await selectedServer?.edit({ name: serverNameValue }, serverNameReasonValue || undefined);

            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Renamed to <b>"{serverNameValue}"</b> (reason: <b>"{serverNameReasonValue}"</b>)</span>
            </p>);
        }
        catch {
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to rename to <b>"{serverNameValue}"</b> (reason: <b>"{serverNameReasonValue}"</b>)</span>
            </p>);
        };
    };

    async function serverChangeIcon () {
        try {
            const response = await dialog();

            if (response.length < 1) throw 'No file selected.';

            const icon = await fs.readFile(response[0].file.path);
            const iconBuffer = `data:image/${response[0].file.name.split('.').reverse()[0]};base64,${icon.toString('base64')}`;

            await selectedServer?.edit({ icon: iconBuffer });

            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Changed server icon to <b>"{response[0].file.name}"</b></span>
            </p>);
        }
        catch {
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Failed to change server icon</span>
            </p>);
        };
    };

    const [serverUnbanModalActive, setServerUnbanModalActive] = useState(false);
    const [serverUnbanReasonValue, setServerUnbanReasonValue] = useState('');

    async function serverUnban () {
        setServerUnbanModalActive(false);

        const promises = selectedBanUsers.map(function (user) {
            return new Promise(async function (resolve) {
                try {
                    await selectedServer?.unbanMember(user.id, serverUnbanReasonValue || undefined);
    
                    addLog(<p>
                        <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                        <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                        <span style={{ color: 'lightgreen' }}>Unbanned <b>{user.user}</b> (reason: <b>"{serverUnbanReasonValue}"</b>)</span>
                    </p>);
                }
                catch {
                    addLog(<p>
                        <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                        <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                        <span style={{ color: 'crimson' }}>Failed to unban <b>{user.user}</b> (reason: <b>"{serverUnbanReasonValue}"</b>)</span>
                    </p>);
                };

                resolve();
            });
        });

        await Promise.all(promises);
    };

    async function serverLeave () {
        const name = selectedServer.name;

        try {
            await selectedServer?.leave();

            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Left server</span>
            </p>);
        }
        catch {
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to leave server</span>
            </p>);
        };
    };

    async function serversCopyInviteLink () {        
        try {
            const application = await client.getOAuthApplication();
            const inviteURL = `https://discord.com/api/oauth2/authorize?client_id=${application.id}&permissions=8&scope=bot`;

            clipboard.writeText(inviteURL);

            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'gold' }}>[{client.user.discriminator ? `${client.user.username}#${client.user.discriminator}` : client.user.username}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Copied bot invite link</span>
            </p>);
        }
        catch {
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'gold' }}>[{client.user.discriminator ? `${client.user.username}#${client.user.discriminator}` : client.user.username}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to copy bot invite link</span>
            </p>);
        };
    };

    async function serversOpenInviteLink () {        
        try {
            const application = await client.getOAuthApplication();
            const inviteURL = `https://discord.com/api/oauth2/authorize?client_id=${application.id}&permissions=8&scope=bot`;

            window.open(inviteURL);

            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'gold' }}>[{client.user.discriminator ? `${client.user.username}#${client.user.discriminator}` : client.user.username}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Opened bot invite link</span>
            </p>);
        }
        catch {
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'gold' }}>[{client.user.discriminator ? `${client.user.username}#${client.user.discriminator}` : client.user.username}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to open bot invite link</span>
            </p>);
        };
    };

    const [serverPruneModalActive, setServerPruneModalActive] = useState(false);
    const [serverPruneValue, setServerPruneValue] = useState('');
    const [serverPruneReasonValue, setServerPruneReasonValue] = useState('');

    async function serverPrune () {
        setServerPruneModalActive(false);

        try {
            await selectedServer?.pruneMembers({ days: serverPruneValue && serverPruneValue !== "" ? parseInt(serverPruneValue) : 7, reason: serverPruneReasonValue || undefined });

            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Pruned guild (days: <b>"{serverPruneValue && serverPruneValue !== "" ? parseInt(serverPruneValue) : 7}"</b>, reason: <b>"{serverPruneReasonValue}"</b>)</span>
            </p>);
        }
        catch {
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to prune guild (days: <b>"{serverPruneValue && serverPruneValue !== "" ? parseInt(serverPruneValue) : 7}"</b>, reason: <b>"{serverPruneReasonValue}"</b>)</span>
            </p>);
        };
    };

    async function serverTemplatesRefresh () {
        try {
            const templates = await selectedServer?.getTemplates();

            setSelectedServerInfo((state) => ({ ...state, templates }));

            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Refreshed templates</span>
            </p>);
        }
        catch {
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to refresh templates</span>
            </p>);
        }; 
    };

    async function serverTemplatesSync () {
        const promises = selectedTemplates.map(function (template) {
            return new Promise(async function (resolve) {
                try {
                    await selectedServer?.syncTemplate(template.id);
                    await serverTemplatesRefresh();
    
                    addLog(<p>
                        <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                        <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                        <span style={{ color: 'lightgreen' }}>Synced template <b>"{template.name}"</b> (code: <b>"{template.id}"</b>)</span>
                    </p>);
                }
                catch {
                    addLog(<p>
                        <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                        <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                        <span style={{ color: 'crimson' }}>Failed to sync template <b>"{template.name}"</b> (code: <b>"{template.id}"</b>)</span>
                    </p>);
                };

                resolve();
            });
        });
        
        await Promise.all(promises);
    };

    async function serverTemplatesDelete () {
        const promises = selectedTemplates.map(function (template) {
            return new Promise(async function (resolve) {
                try {
                    await selectedServer?.deleteTemplate(template.id);
                    await serverTemplatesRefresh();
    
                    addLog(<p>
                        <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                        <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                        <span style={{ color: 'lightgreen' }}>Deleted template <b>"{template.name}"</b> (code: <b>"{template.id}"</b>)</span>
                    </p>);
                }
                catch {
                    addLog(<p>
                        <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                        <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                        <span style={{ color: 'crimson' }}>Failed to delete template <b>"{template.name}"</b> (code: <b>"{template.id}"</b>)</span>
                    </p>);
                };

                resolve();
            });
        });

        await Promise.all(promises);
    };

    const [userRemoveRoleModalActive, setUserRemoveRoleModalActive] = useState(false);
    const [userRemoveRoleReasonValue, setUserRemoveRoleReasonValue] = useState('');

    async function usersRemoveRoles () {
        setUserRemoveRoleModalActive(false);

        try {
            const members = await selectedServer.fetchMembers({ userIDs: selectedUsers.map((u) => u?.id) });
            const promises = members.map(function (member) {
                return new Promise(async function (resolve) {
                    const rolePromises = selectedRemoveRoles.map(function (role) {
                        return new Promise(async function (resolve) {
                            try {
                                await member.removeRole(role.id, userRemoveRoleReasonValue);
            
                                addLog(<p>
                                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                                    <span style={{ color: 'lightgreen' }}>Removed role <b>"{role.name}"</b> from <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> (reason: <b>{userRemoveRoleReasonValue}</b>)</span>
                                </p>);
                            }
                            catch {
                                addLog(<p>
                                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                                    <span style={{ color: 'crimson' }}>Failed to remove role <b>"{role.name}"</b> from <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> (reason: <b>{userRemoveRoleReasonValue}</b>)</span>
                                </p>);
                            };

                            resolve();
                        });
                    });

                    await Promise.all(rolePromises);
                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch {
            selectedUsers.forEach(function user () {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to remove <b>{selectedRemoveRoles.length}</b> roles from <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> (reason: <b>{userRemoveRoleReasonValue}</b>)</span>
                </p>);
            });
        };
    };

    const [userAddRoleModalActive, setUserAddRoleModalActive] = useState(false);
    const [userAddRoleReasonValue, setUserAddRoleReasonValue] = useState('');

    async function usersAddRoles () {
        setUserAddRoleModalActive(false);

        try {
            const members = await selectedServer.fetchMembers({ userIDs: selectedUsers.map((u) => u?.id) });
            const promises = members.map(function (member) {
                return new Promise(async function (resolve) {
                    const rolePromises = selectedAddRoles.map(function (role) {
                        return new Promise(async function (resolve) {
                            try {
                                await member.addRole(role.id, userAddRoleReasonValue);
            
                                addLog(<p>
                                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                                    <span style={{ color: 'lightgreen' }}>Added role <b>"{role.name}"</b> to <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> (reason: <b>{userAddRoleReasonValue}</b>)</span>
                                </p>);
                            }
                            catch {
                                addLog(<p>
                                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                                    <span style={{ color: 'crimson' }}>Failed to add role <b>"{role.name}"</b> to <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> (reason: <b>{userAddRoleReasonValue}</b>)</span>
                                </p>);
                            };

                            resolve();
                        });
                    });

                    await Promise.all(rolePromises);
                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch {
            selectedUsers.forEach(function user () {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to add <b>{selectedAddRoles.length}</b> roles to <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> (reason: <b>{userAddRoleReasonValue}</b>)</span>
                </p>);
            });
        };
    };

    const tabs = [
        {
            label: 'Servers',
            icon: faServer,
            content: (
                <>
                    {/* Servers */}
                    <div className={styles.title} style={{ marginBottom: '.5rem' }}>
                        <h4>Servers</h4>
                        <div className={styles.buttons}>
                                <Button
                                    size='sm'
                                    label='Copy Invite Link'
                                    customClass={styles.button}
                                    onClick={serversCopyInviteLink}
                                />
                                <Button
                                    size='sm'
                                    label='Open Invite Link'
                                    customClass={styles.button}
                                    onClick={serversOpenInviteLink}
                                />
                        </div>
                    </div>

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
                                        <Button label='Leave' customClass={styles.button} iconLeft={faTrash} variant='secondary' size='sm' onClick={() => leaveServer(server)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )
        },
        {
            label: 'Server',
            icon: faServer,
            content: selectedServer ? (
                <>
                    {/* Rename Modal */}
                    <Modal
                        active={serverRenameModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={serverRename} />
                                <Button label='Cancel' size='md' onClick={() => { setServerRenameModalActive(false) }} />
                            </>
                        }
                    >
                        <Input label='Name' value={serverNameValue} onInput={(e) => setServerNameValue(e.target.value)} />
                        <div style={{ marginTop: '1rem' }}><Input value={serverNameReasonValue} onInput={(e) => setServerNameReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Prune Modal */}
                    <Modal
                        active={serverPruneModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={serverPrune} />
                                <Button label='Cancel' size='md' onClick={() => { setServerPruneModalActive(false) }} />
                            </>
                        }
                    >
                        <Input label='Days of inactivity to prune (optional)' value={serverPruneValue} onInput={(e) => setServerPruneValue(e.target.value)} />
                        <div style={{ marginTop: '1rem' }}><Input value={serverPruneReasonValue} onInput={(e) => setServerPruneReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>
                    
                    {/* Server */}
                    <div className={styles.title} style={{ marginBottom: '.5rem' }}>
                        <h4>Server</h4>
                        <div className={styles.buttons}>
                                <Button
                                    size='sm'
                                    label='Leave'
                                    customClass={styles.button}
                                    onClick={serverLeave}
                                />
                                <Button
                                    size='sm'
                                    label='Prune (avoid overuse)'
                                    customClass={styles.button}
                                    onClick={() => { setServerPruneValue(''); setServerPruneReasonValue(''); setServerPruneModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Change Icon'
                                    customClass={styles.button}
                                    onClick={serverChangeIcon}
                                />
                                <Button
                                    size='sm'
                                    label='Rename'
                                    customClass={styles.button}
                                    onClick={() => { setServerNameValue(''); setServerNameReasonValue(''); setServerRenameModalActive(true) }}
                                />
                        </div>
                    </div>

                    <div className={styles.server} style={{ display: 'flex', alignItems: 'center' }}>
                        <Image className={styles.icon} src={selectedServer?.icon ? selectedServer.iconURL : 'https://cdn.discordapp.com/embed/avatars/1.png'} width={40} height={40} />
                        <div style={{ marginLeft: '1rem' }}>
                            <h2 style={{ fontSize: '1.25rem' }}>{selectedServer?.name}</h2>
                            <p style={{ opacity: '50%', fontSize: '.75rem' }}>Id: {selectedServer?.id}</p>
                        </div>
                    </div>

                    {/* Unban Modal */}
                    <Modal
                        active={serverUnbanModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={serverUnban} />
                                <Button label='Cancel' size='md' onClick={() => { setServerUnbanModalActive(false) }} />
                            </>
                        }
                    >
                        <div style={{ marginTop: '1rem' }}><Input value={serverUnbanReasonValue} onInput={(e) => setServerUnbanReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Bans */}
                    <div className={styles.title} style={{ marginBottom: '.5rem', marginTop: '1rem' }}>
                        <h4>Bans</h4>
                        <div className={styles.buttons}>
                                <Button
                                    size='sm'
                                    label='Unban'
                                    customClass={styles.button}
                                    onClick={() => { setServerUnbanReasonValue(''); setServerUnbanModalActive(true) }}
                                />
                        </div>
                    </div>

                    <Table
                        theme='dark'
                        columns={banColumns}
                        data={selectedServerInfo?.bans
                            ?.map((ban) => ({
                                id: ban.user.id,
                                user: ban.user.discriminator !== '0' ? `${ban.user.username}#${ban.user.discriminator}` : ban.user.username,
                                bot: ban.user.bot ? '✅' : '🚫'
                            }))}
                        dense
                        selectableRowsHighlight
                        selectableRows
                        pagination
                        paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                        onSelectedRowsChange={handleBanUserSelected}
                    />

                    {/* Templates */}
                    <div className={styles.title} style={{ marginBottom: '.5rem', marginTop: '1rem' }}>
                        <h4>Templates</h4>
                        <div className={styles.buttons}>
                            <Button
                                size='sm'
                                label='Refresh'
                                customClass={styles.button}
                                onClick={serverTemplatesRefresh}
                            />
                            <Button
                                size='sm'
                                label='Sync'
                                customClass={styles.button}
                                onClick={serverTemplatesSync}
                            />
                             <Button
                                size='sm'
                                label='Delete'
                                customClass={styles.button}
                                onClick={serverTemplatesDelete}
                            />
                        </div>
                    </div>

                    <Table
                        theme='dark'
                        columns={templateColumns}
                        data={selectedServerInfo?.templates
                            ?.map((template) => ({
                                id: template.code,
                                name: template.name,
                                synced: template.isDirty ? '🚫' : '✅'
                            }))}
                        dense
                        selectableRowsHighlight
                        selectableRows
                        pagination
                        paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                        onSelectedRowsChange={handleTemplateSelected}
                    />
                </>
            ) : <Alert variant='warning' description={<p>No server is currently selected.</p>} />
        },
        {
            label: 'Users',
            icon: faUsers,
            content: selectedServer ? (
                <>
                    {/* DM Modal */}
                    <Modal
                        active={userDMModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={usersDM} />
                                <Button label='Cancel' size='md' onClick={() => { setUserDMModalActive(false) }} />
                            </>
                        }
                    >
                        <Input multiLine={true} label='Message' value={userDMValue} onInput={(e) => setUserDMValue(e.target.value)} />
                    </Modal>

                    {/* Nickname Modal */}
                    <Modal
                        active={userNicknameModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={usersNickname} />
                                <Button label='Cancel' size='md' onClick={() => { setUserNicknameModalActive(false) }} />
                            </>
                        }
                    >
                        <Input label='Nickname' value={userNicknameValue} onInput={(e) => setUserNicknameValue(e.target.value)} />
                        <div style={{ marginTop: '1rem' }}><Input value={userNicknameReasonValue} onInput={(e) => setUserNicknameReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Timeout Modal */}
                    <Modal
                        active={userTimeoutModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={usersTimeout} />
                                <Button label='Cancel' size='md' onClick={() => { setUserTimeoutModalActive(false) }} />
                            </>
                        }
                    >
                        <Input label='Timeout (examples: 1s, 1m, 1h, 1d)' value={userTimeoutValue} onInput={(e) => setUserTimeoutValue(e.target.value)} />
                        <div style={{ marginTop: '1rem' }}><Input value={userTimeoutReasonValue} onInput={(e) => setUserTimeoutReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Remove Role Modal */}
                    <Modal
                        active={userRemoveRoleModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={usersRemoveRoles} />
                                <Button label='Cancel' size='md' onClick={() => { setUserRemoveRoleModalActive(false) }} />
                            </>
                        }
                    >
                        <h3 style={{ marginBottom: '.5rem' }}>Roles</h3>
                        <Table
                            theme='dark'
                            columns={roleColumns.filter((col) => col.name !== 'Created')}
                            data={selectedServerInfo?.roles
                                ?.filter((role) => role.id !== selectedServer?.id)
                                ?.map((role) => ({
                                    id: role.id,
                                    name: role.name
                                }))}
                            dense
                            selectableRowsHighlight
                            selectableRows
                            pagination
                            paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                            onSelectedRowsChange={handleRemoveRoleSelected}
                        />
                        <div style={{ marginTop: '1rem' }}><Input value={userRemoveRoleReasonValue} onInput={(e) => setUserRemoveRoleReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Add Role Modal */}
                    <Modal
                        active={userAddRoleModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={usersAddRoles} />
                                <Button label='Cancel' size='md' onClick={() => { setUserAddRoleModalActive(false) }} />
                            </>
                        }
                    >
                        <h3 style={{ marginBottom: '.5rem' }}>Roles</h3>
                        <Table
                            theme='dark'
                            columns={roleColumns.filter((col) => col.name !== 'Created')}
                            data={selectedServerInfo?.roles
                                ?.filter((role) => role.id !== selectedServer?.id)
                                ?.map((role) => ({
                                    id: role.id,
                                    name: role.name
                                }))}
                            dense
                            selectableRowsHighlight
                            selectableRows
                            pagination
                            paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                            onSelectedRowsChange={handleAddRoleSelected}
                        />
                        <div style={{ marginTop: '1rem' }}><Input value={userAddRoleReasonValue} onInput={(e) => setUserAddRoleReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Kick Modal */}
                    <Modal
                        active={userKickModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={usersKick} />
                                <Button label='Cancel' size='md' onClick={() => { setUserKickModalActive(false) }} />
                            </>
                        }
                    >
                        <div style={{ marginTop: '1rem' }}><Input value={userKickReasonValue} onInput={(e) => setUserKickReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Ban Modal */}
                    <Modal
                        active={userBanModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={usersBan} />
                                <Button label='Cancel' size='md' onClick={() => { setUserBanModalActive(false) }} />
                            </>
                        }
                    >
                        <Input label='Days to delete messages for (e.g. 1, optional)' value={userBanValue} onInput={(e) => setUserBanValue(e.target.value)} />
                        <div style={{ marginTop: '1rem' }}><Input value={userBanReasonValue} onInput={(e) => setUserBanReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Users */}
                    <div className={styles.title} style={{ marginBottom: '.5rem' }}>
                        <h4>Users</h4>
                        <div className={styles.buttons}>
                                <Button
                                    size='sm'
                                    label='DM'
                                    customClass={styles.button}
                                    onClick={() => { setUserDMValue(''); setUserDMModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Nickname'
                                    customClass={styles.button}
                                    onClick={() => { setUserNicknameValue(''); setUserNicknameReasonValue(''); setUserNicknameModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Timeout'
                                    customClass={styles.button}
                                    onClick={() => { setUserTimeoutValue(''); setUserTimeoutReasonValue(''); setUserTimeoutModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Remove Role'
                                    customClass={styles.button}
                                    onClick={() => { setUserRemoveRoleReasonValue(''); setUserRemoveRoleModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Add Role'
                                    customClass={styles.button}
                                    onClick={() => { setUserAddRoleReasonValue(''); setUserAddRoleModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Kick'
                                    customClass={styles.button}
                                    onClick={() => { setUserKickReasonValue(''); setUserKickModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Ban'
                                    customClass={styles.button}
                                    onClick={() => { setUserBanValue(''); setUserBanReasonValue(''); setUserBanModalActive(true) }}
                                />
                        </div>
                    </div>

                    <Table
                        theme='dark'
                        columns={userColumns}
                        data={selectedServerInfo?.members
                            ?.filter((member) => member.id !== client.user.id)
                            ?.map((member) => ({
                                id: member.id,
                                user: member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username,
                                bot: member.bot ? '✅' : '🚫',
                                online: member.status !== 'offline' ? '✅' : '🚫'
                            }))}
                        dense
                        selectableRowsHighlight
                        selectableRows
                        pagination
                        paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                        onSelectedRowsChange={handleUserSelected}
                    />
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