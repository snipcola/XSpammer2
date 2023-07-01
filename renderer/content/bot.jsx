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
        templates: null,
        invites: null
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
                    templates: null,
                    invites: null
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

        client.on('inviteCreate', async function (server) {
            try {
                const invites = await server.getInvites();

                setSelectedServerInfo((state) => ({ ...state, invites }));
            }
            catch { }; 
        });

        client.on('inviteDelete', async function (server) {
            try {
                const invites = await server.getInvites();

                setSelectedServerInfo((state) => ({ ...state, invites }));
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
            const invites = await server.getInvites();

            setSelectedServer(server);
            setSelectedServerInfo({
                members,
                channels,
                roles,
                emojis,
                stickers,
                bans,
                templates,
                invites
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
        },
        {
            name: 'Id',
            selector: row => row.id,
            sortable: true
        }
    ];

    const channelColumns = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true
        },
        {
            name: 'Type',
            selector: row => row.type,
            sortable: true
        },
        {
            name: 'Id',
            selector: row => row.id,
            sortable: true
        }
    ];

    const roleColumns = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true
        },
        {
            name: 'Created',
            selector: row => row.created,
            sortable: true
        },
        {
            name: 'Id',
            selector: row => row.id,
            sortable: true
        }
    ];

    const banColumns = [
        {
            name: 'User',
            selector: row => row.user,
            sortable: true
        },
        {
            name: 'Bot',
            selector: row => row.bot,
            sortable: true
        },
        {
            name: 'Id',
            selector: row => row.id,
            sortable: true
        }
    ];

    const inviteColumns = [
        {
            name: 'Code',
            selector: row => row.id,
            sortable: true
        },
        {
            name: 'Channel',
            selector: row => row.channel,
            sortable: true
        },
        {
            name: 'Uses',
            selector: row => row.uses,
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

    const [selectedInvites, setSelectedInvites] = useState([]);
    const handleInviteSelected = useCallback((s) => setSelectedInvites(s.selectedRows), []);

    const [selectedTemplates, setSelectedTemplates] = useState([]);
    const handleTemplateSelected = useCallback((s) => setSelectedTemplates(s.selectedRows), []);

    const [selectedRemoveRoles, setSelectedRemoveRoles] = useState([]);
    const handleRemoveRoleSelected = useCallback((s) => setSelectedRemoveRoles(s.selectedRows), []);

    const [selectedAddRoles, setSelectedAddRoles] = useState([]);
    const handleAddRoleSelected = useCallback((s) => setSelectedAddRoles(s.selectedRows), []);

    const [selectedChannels, setSelectedChannels] = useState([]);
    const handleChannelSelected = useCallback((s) => setSelectedChannels(s.selectedRows), []);

    const [selectedRoles, setSelectedRoles] = useState([]);
    const handleRoleSelected = useCallback((s) => setSelectedRoles(s.selectedRows), []);

    const [selectedRemoveMembers, setSelectedRemoveMembers] = useState([]);
    const handleRemoveMemberSelected = useCallback((s) => setSelectedRemoveMembers(s.selectedRows), []);

    const [selectedAddMembers, setSelectedAddMembers] = useState([]);
    const handleAddMemberSelected = useCallback((s) => setSelectedAddMembers(s.selectedRows), []);

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
            selectedUsers.forEach(function (user) {
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
            selectedUsers.forEach(function (user) {
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
                        await member.kick(userKickReasonValue || undefined);
    
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
            selectedUsers.forEach(function (user) {
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
                        await member.ban(userBanValue && userBanValue !== "" ? parseInt(userBanValue) : 0, userBanReasonValue || undefined);
    
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
            selectedUsers.forEach(function (user) {
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
    const [userDMAmountValue, setUserDMAmountValue] = useState('');

    async function usersDM () {
        setUserDMModalActive(false);

        try {
            const members = await selectedServer.fetchMembers({ userIDs: selectedUsers.map((u) => u?.id) });
            const promises = [...Array(userDMAmountValue && userDMAmountValue !== "" ? parseInt(userDMAmountValue) : 1)].map(() => members.map(function (member) {
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
            }));

            await Promise.all(promises);
        }
        catch {
            selectedUsers.forEach(function (user) {
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

    const [serverInviteDeleteModalActive, setServerInviteDeleteModalActive] = useState(false);
    const [serverInviteDeleteReasonValue, setServerInviteDeleteReasonValue] = useState('');

    async function serverInvitesDelete () {
        setServerInviteDeleteModalActive(false);

        const promises = selectedInvites.map(function (invite) {
            return new Promise(async function (resolve) {
                try {
                    await selectedServerInfo?.invites
                        ?.find((_invite) => invite.id === _invite.code)
                        ?.delete(serverInviteDeleteReasonValue || undefined);
    
                    addLog(<p>
                        <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                        <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                        <span style={{ color: 'lightgreen' }}>Deleted invite <b>"{invite.id}"</b> (reason: <b>"{serverInviteDeleteReasonValue}"</b>)</span>
                    </p>);
                }
                catch {
                    addLog(<p>
                        <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                        <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                        <span style={{ color: 'crimson' }}>Failed to delete invite <b>"{invite.id}"</b> (reason: <b>"{serverInviteDeleteReasonValue}"</b>)</span>
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
                                await member.removeRole(role.id, userRemoveRoleReasonValue || undefined);
            
                                addLog(<p>
                                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                                    <span style={{ color: 'lightgreen' }}>Removed role <b>"{role.name}"</b> from member <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> (reason: <b>"{userRemoveRoleReasonValue}"</b>)</span>
                                </p>);
                            }
                            catch {
                                addLog(<p>
                                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                                    <span style={{ color: 'crimson' }}>Failed to remove role <b>"{role.name}"</b> from member <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> (reason: <b>"{userRemoveRoleReasonValue}"</b>)</span>
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
            selectedUsers.forEach(function (member) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to remove <b>{selectedRemoveRoles.length}</b> roles from member <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> (reason: <b>"{userRemoveRoleReasonValue}"</b>)</span>
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
                                await member.addRole(role.id, userAddRoleReasonValue || undefined);
            
                                addLog(<p>
                                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                                    <span style={{ color: 'lightgreen' }}>Added role <b>"{role.name}"</b> to member <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> (reason: <b>"{userAddRoleReasonValue}"</b>)</span>
                                </p>);
                            }
                            catch {
                                addLog(<p>
                                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                                    <span style={{ color: 'crimson' }}>Failed to add role <b>"{role.name}"</b> to member <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> (reason: <b>"{userAddRoleReasonValue}"</b>)</span>
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
            selectedUsers.forEach(function (member) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to add <b>{selectedAddRoles.length}</b> roles to member <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> (reason: <b>"{userAddRoleReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [channelMessageModalActive, setChannelMessageModalActive] = useState(false);
    const [channelMessageValue, setChannelMessageValue] = useState('');
    const [channelMessageAmountValue, setChannelMessageAmountValue] = useState('');

    async function channelMessage () {
        setChannelMessageModalActive(false);

        try {
            const channels = await selectedServer?.channels
                ?.filter((channel) => selectedChannels?.find((_channel) => channel?.id === _channel?.id))
                ?.filter((channel) => channel?.createMessage);

            const promises = [...Array(channelMessageAmountValue && channelMessageAmountValue !== "" ? parseInt(channelMessageAmountValue) : 1)].map(() => channels.map(function (channel) {
                return new Promise(async function (resolve) {
                    try {
                        await channel.createMessage({ content: channelMessageValue, allowedMentions: { everyone: true } });
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>Messaged in channel <b>"{channel.name}"</b>: <b>{channelMessageValue}</b></span>
                        </p>);
                    }
                    catch {
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crimson' }}>Failed to message in channel <b>"{channel.name}"</b>: <b>{channelMessageValue}</b></span>
                        </p>);
                    };

                    resolve();
                });
            }));

            await Promise.all(promises);
        }
        catch {
            selectedChannels.forEach(function (channel) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to message in channel <b>"{channel.name}"</b>: <b>{channelMessageValue}</b></span>
                </p>);
            });
        };
    };

    const [channelPurgeModalActive, setChannelPurgeModalActive] = useState(false);
    const [channelPurgeValue, setChannelPurgeValue] = useState('');
    const [channelPurgeReasonValue, setChannelPurgeReasonValue] = useState('');

    async function channelPurge () {
        setChannelPurgeModalActive(false);

        try {
            const channels = await selectedServer?.channels
                ?.filter((channel) => selectedChannels?.find((_channel) => channel?.id === _channel?.id))
                ?.filter((channel) => channel?.purge);

            const promises = channels.map(function (channel) {
                return new Promise(async function (resolve) {
                    try {
                        await channel.purge({ limit: channelPurgeValue && channelPurgeValue !== "" ? parseInt(channelPurgeValue) : -1, reason: channelPurgeReasonValue || undefined });
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>Purged channel <b>"{channel.name}"</b> (limit: {channelPurgeValue && channelPurgeValue !== "" ? parseInt(channelPurgeValue) : -1}, reason: <b>"{channelPurgeReasonValue}"</b>)</span>
                        </p>);
                    }
                    catch {
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crimson' }}>Failed to purge channel <b>"{channel.name}"</b> (limit: {channelPurgeValue && channelPurgeValue !== "" ? parseInt(channelPurgeValue) : -1}, reason: <b>"{channelPurgeReasonValue}"</b>)</span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch {
            selectedChannels.forEach(function (channel) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to purge channel <b>"{channel.name}"</b> (limit: {channelPurgeValue && channelPurgeValue !== "" ? parseInt(channelPurgeValue) : -1}, reason: <b>"{channelPurgeReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [channelCreateInviteModalActive, setChannelCreateInviteModalActive] = useState(false);
    const [channelCreateInviteMaxAgeValue, setChannelCreateInviteMaxAgeValue] = useState('');
    const [channelCreateInviteMaxUsesValue, setChannelCreateInviteMaxUsesValue] = useState('');
    const [channelCreateInviteTemporaryValue, setChannelCreateInviteTemporaryValue] = useState(false);
    const [channelCreateInviteUniqueValue, setChannelCreateInviteUniqueValue] = useState(false);
    const [channelCreateInviteReasonValue, setChannelCreateInviteReasonValue] = useState(false);

    async function channelCreateInvite () {
        setChannelCreateInviteModalActive(false);

        try {
            const channels = await selectedServer?.channels
                ?.filter((channel) => selectedChannels?.find((_channel) => channel?.id === _channel?.id))
                ?.filter((channel) => channel?.createInvite);

            const promises = channels.map(function (channel) {
                return new Promise(async function (resolve) {
                    try {
                        const invite = await channel.createInvite({
                            maxAge: channelCreateInviteMaxAgeValue ? channelCreateInviteMaxAgeValue * 24 * 60 * 60 : undefined,
                            maxUses: channelCreateInviteMaxUsesValue || undefined,
                            temporary: channelCreateInviteTemporaryValue || undefined,
                            unique: channelCreateInviteUniqueValue || undefined,
                            reason: channelCreateInviteReasonValue || undefined
                        });
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>Created invite for channel <b>"{channel.name}"</b> (code: <b>"{invite.code}"</b>, max age: <b>"{channelCreateInviteMaxAgeValue}"</b>, max uses: <b>"{channelCreateInviteMaxUsesValue}"</b>, temporary?: <b>"{channelCreateInviteTemporaryValue.toString()}"</b>, unique?: <b>"{channelCreateInviteUniqueValue.toString()}"</b>, reason: <b>"{channelCreateInviteReasonValue}"</b>)</span>
                        </p>);
                    }
                    catch {
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crimson' }}>Failed to create invite for channel <b>"{channel.name}"</b> (max age: <b>"{channelCreateInviteMaxAgeValue}"</b>, max uses: <b>"{channelCreateInviteMaxUsesValue}"</b>, temporary?: <b>"{channelCreateInviteTemporaryValue.toString()}"</b>, unique?: <b>"{channelCreateInviteUniqueValue.toString()}"</b>, reason: <b>"{channelCreateInviteReasonValue}"</b>)</span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch {
            selectedChannels.forEach(function (channel) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to create invite for channel <b>"{channel.name}"</b> (max age: <b>"{channelCreateInviteMaxAgeValue}"</b>, max uses: <b>"{channelCreateInviteMaxUsesValue}"</b>, temporary?: <b>"{channelCreateInviteTemporaryValue.toString()}"</b>, unique?: <b>"{channelCreateInviteUniqueValue.toString()}"</b>, reason: <b>"{channelCreateInviteReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [channelDeleteModalActive, setChannelDeleteModalActive] = useState(false);
    const [channelDeleteReasonValue, setChannelDeleteReasonValue] = useState('');

    async function channelDelete () {
        setChannelDeleteModalActive(false);

        try {
            const channels = await selectedServer?.channels
                ?.filter((channel) => selectedChannels?.find((_channel) => channel?.id === _channel?.id))
                ?.filter((channel) => channel?.delete);

            const promises = channels.map(function (channel) {
                return new Promise(async function (resolve) {
                    try {
                        await channel.delete(channelDeleteReasonValue || undefined);
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>Deleted channel <b>"{channel.name}"</b> (id: <b>{channel.id}</b>, reason: <b>"{channelDeleteReasonValue}"</b>)</span>
                        </p>);
                    }
                    catch {
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crismon' }}>Failed to delete channel <b>"{channel.name}"</b> (id: <b>{channel.id}</b>, reason: <b>"{channelDeleteReasonValue}"</b>)</span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch {
            selectedChannels.forEach(function (channel) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crismon' }}>Failed to delete channel <b>"{channel.name}"</b> (id: <b>{channel.id}</b>, reason: <b>"{channelDeleteReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [channelRenameModalActive, setChannelRenameModalActive] = useState(false);
    const [channelRenameValue, setChannelRenameValue] = useState('');
    const [channelRenameReasonValue, setChannelRenameReasonValue] = useState('');

    async function channelRename () {
        setChannelRenameModalActive(false);

        try {
            const channels = await selectedServer?.channels
                ?.filter((channel) => selectedChannels?.find((_channel) => channel?.id === _channel?.id))
                ?.filter((channel) => channel?.edit);

            const promises = channels.map(function (channel) {
                return new Promise(async function (resolve) {
                    try {
                        const channelName = channel.name;

                        await channel.edit({ name: channelRenameValue }, channelRenameReasonValue || undefined);
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>Renamed channel <b>"{channelName}"</b> to <b>"{channel.name}"</b> (id: <b>{channel.id}</b>, reason: <b>"{channelRenameReasonValue}"</b>)</span>
                        </p>);
                    }
                    catch {
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crimson' }}>Failed to rename channel <b>"{channel.name}"</b> to <b>"{channelRenameValue}"</b> (id: <b>{channel.id}</b>, reason: <b>"{channelRenameReasonValue}"</b>)</span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch {
            selectedChannels.forEach(function (channel) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to rename channel <b>"{channel.name}"</b> to <b>"{channelRenameValue}"</b> (id: <b>{channel.id}</b>, reason: <b>"{channelRenameReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [channelCreateModalActive, setChannelCreateModalActive] = useState(false);
    const [channelCreateNameValue, setChannelCreateNameValue] = useState('');
    const [channelCreateTypeValue, setChannelCreateTypeValue] = useState(0);
    const [channelCreateAmountValue, setChannelCreateAmountValue] = useState(0);
    const [channelCreateNSFWValue, setChannelCreateNSFWValue] = useState(false);
    const [channelCreateReasonValue, setChannelCreateReasonValue] = useState('');

    async function channelCreate () {
        setChannelCreateModalActive(false);

        const promises = [...Array(channelCreateAmountValue && channelCreateAmountValue !== "" ? parseInt(channelCreateAmountValue) : 1)].map(() => new Promise(async function (resolve) {
            try {
                const channel = await selectedServer?.createChannel(channelCreateNameValue, channelCreateTypeValue, {
                    nsfw: channelCreateNSFWValue,
                    reason: channelCreateReasonValue || null
                });
    
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'lightgreen' }}>Created channel <b>"{channelCreateNameValue}"</b> (id: <b>{channel.id}</b>, type: <b>{channelCreateTypeValue}</b>, nsfw: <b>{channelCreateNSFWValue.toString()}</b>, reason: <b>"{channelCreateReasonValue}"</b>)</span>
                </p>);
            }
            catch {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to create channel <b>"{channelCreateNameValue}"</b> (type: <b>{channelCreateTypeValue}</b>, nsfw: <b>{channelCreateNSFWValue.toString()}</b>, reason: <b>"{channelCreateReasonValue}"</b>)</span>
                </p>);
            };

            resolve();
        }));

        await Promise.all(promises);
    };

    const [roleDeleteModalActive, setRoleDeleteModalActive] = useState(false);
    const [roleDeleteReasonValue, setRoleDeleteReasonValue] = useState('');

    async function roleDelete () {
        setRoleDeleteModalActive(false);

        try {
            const roles = await selectedServer?.roles
                ?.filter((role) => selectedRoles?.find((_role) => role?.id === _role?.id))
                ?.filter((role) => role?.delete);

            const promises = roles.map(function (role) {
                return new Promise(async function (resolve) {
                    try {
                        await role.delete(roleDeleteReasonValue || undefined);
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>Deleted role <b>"{role.name}"</b> (id: <b>{role.id}</b>, reason: <b>"{roleDeleteReasonValue}"</b>)</span>
                        </p>);
                    }
                    catch {
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crismon' }}>Failed to delete role <b>"{role.name}"</b> (id: <b>{role.id}</b>, reason: <b>"{roleDeleteReasonValue}"</b>)</span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch {
            selectedRoles.forEach(function (role) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crismon' }}>Failed to delete role <b>"{role.name}"</b> (id: <b>{role.id}</b>, reason: <b>"{roleDeleteReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [roleRenameModalActive, setRoleRenameModalActive] = useState(false);
    const [roleRenameValue, setRoleRenameValue] = useState('');
    const [roleRenameReasonValue, setRoleRenameReasonValue] = useState('');

    async function roleRename () {
        setRoleRenameModalActive(false);

        try {
            const roles = await selectedServer?.roles
                ?.filter((role) => selectedRoles?.find((_role) => role?.id === _role?.id))
                ?.filter((role) => role?.edit);

            const promises = roles.map(function (role) {
                return new Promise(async function (resolve) {
                    try {
                        const roleName = role.name;

                        await role.edit({ name: roleRenameValue }, roleRenameReasonValue || undefined);
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>Renamed role <b>"{roleName}"</b> to <b>"{role.name}"</b> (id: <b>{role.id}</b>, reason: <b>"{roleRenameReasonValue}"</b>)</span>
                        </p>);
                    }
                    catch {
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crimson' }}>Failed to rename role <b>"{role.name}"</b> to <b>"{roleRenameValue}"</b> (id: <b>{role.id}</b>, reason: <b>"{roleRenameReasonValue}"</b>)</span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch {
            selectedRoles.forEach(function (role) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to rename role <b>"{role.name}"</b> to <b>"{roleRenameValue}"</b> (id: <b>{role.id}</b>, reason: <b>"{roleRenameReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [roleCreateModalActive, setRoleCreateModalActive] = useState(false);
    const [roleCreateNameValue, setRoleCreateNameValue] = useState('');
    const [roleCreateAmountValue, setRoleCreateAmountValue] = useState(0);
    const [roleCreateHoistValue, setRoleCreateHoistValue] = useState(false);
    const [roleCreateMentionableValue, setRoleCreateMentionableValue] = useState(false);
    const [roleCreateReasonValue, setRoleCreateReasonValue] = useState('');

    async function roleCreate () {
        setRoleCreateModalActive(false);

        const promises = [...Array(roleCreateAmountValue && roleCreateAmountValue !== "" ? parseInt(roleCreateAmountValue) : 1)].map(() => new Promise(async function (resolve) {
            try {
                const role = await selectedServer?.createRole({
                    name: roleCreateNameValue,
                    hoist: roleCreateHoistValue,
                    mentionable: roleCreateMentionableValue
                }, roleCreateReasonValue || null);
    
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'lightgreen' }}>Created role <b>"{roleCreateNameValue}"</b> (id: <b>{role.id}</b>, hoist: <b>{roleCreateHoistValue.toString()}</b>, mentionable: <b>{roleCreateMentionableValue.toString()}</b>, reason: <b>"{roleCreateReasonValue}"</b>)</span>
                </p>);
            }
            catch {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to create role <b>"{roleCreateNameValue}"</b> (hoist: <b>{roleCreateHoistValue.toString()}</b>, mentionable: <b>{roleCreateMentionableValue.toString()}</b>, reason: <b>"{roleCreateReasonValue}"</b>)</span>
                </p>);
            };

            resolve();
        }));

        await Promise.all(promises);
    };

    const [roleAddMemberModalActive, setRoleAddMemberModalActive] = useState(false);
    const [roleAddMemberReasonValue, setRoleAddMemberReasonValue] = useState('');

    async function roleAddMembers () {
        setRoleAddMemberModalActive(false);

        try {
            const members = await selectedServer.fetchMembers({ userIDs: selectedAddMembers.map((u) => u?.id) });
            const promises = members.map(function (member) {
                return new Promise(async function (resolve) {
                    const rolePromises = selectedRoles.map(function (role) {
                        return new Promise(async function (resolve) {
                            try {
                                await member.addRole(role.id, roleAddMemberReasonValue || undefined);
            
                                addLog(<p>
                                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                                    <span style={{ color: 'lightgreen' }}>Added member <b>"{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}"</b> to role <b>{role.name}</b> (reason: <b>"{roleAddMemberReasonValue}"</b>)</span>
                                </p>);
                            }
                            catch {
                                addLog(<p>
                                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                                    <span style={{ color: 'crimson' }}>Failed to add member <b>"{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}"</b> to role <b>{role.name}</b> (reason: <b>"{roleAddMemberReasonValue}"</b>)</span>
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
            selectedAddMembers.forEach(function (member) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to add member <b>"{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}"</b> to role <b>{role.name}</b> (reason: <b>"{roleAddMemberReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [roleRemoveMemberModalActive, setRoleRemoveMemberModalActive] = useState(false);
    const [roleRemoveMemberReasonValue, setRoleRemoveMemberReasonValue] = useState('');

    async function roleRemoveMembers () {
        setRoleRemoveMemberModalActive(false);

        try {
            const members = await selectedServer.fetchMembers({ userIDs: selectedRemoveMembers.map((u) => u?.id) });
            const promises = members.map(function (member) {
                return new Promise(async function (resolve) {
                    const rolePromises = selectedRoles.map(function (role) {
                        return new Promise(async function (resolve) {
                            try {
                                await member.removeRole(role.id, roleRemoveMemberReasonValue || undefined);
            
                                addLog(<p>
                                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                                    <span style={{ color: 'lightgreen' }}>Removed member <b>"{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}"</b> from role <b>{role.name}</b> (reason: <b>"{roleRemoveMemberReasonValue}"</b>)</span>
                                </p>);
                            }
                            catch {
                                addLog(<p>
                                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                                    <span style={{ color: 'crimson' }}>Failed to remove member <b>"{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}"</b> from role <b>{role.name}</b> (reason: <b>"{roleRemoveMemberReasonValue}"</b>)</span>
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
            selectedRemoveMembers.forEach(function (member) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to remove member <b>"{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}"</b> from role <b>{role.name}</b> (reason: <b>"{roleRemoveMemberReasonValue}"</b>)</span>
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
                        <Input label='Days of inactivity to prune' value={serverPruneValue} onInput={(e) => setServerPruneValue(e.target.value)} />
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
                                    label='Prune (minimize usage)'
                                    customClass={styles.button}
                                    onClick={() => { setServerPruneValue('7'); setServerPruneReasonValue(''); setServerPruneModalActive(true) }}
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
                    
                    {/* Delete Invite Modal */}
                    <Modal
                        active={serverInviteDeleteModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={serverInvitesDelete} />
                                <Button label='Cancel' size='md' onClick={() => { setServerInviteDeleteModalActive(false) }} />
                            </>
                        }
                    >
                        <div style={{ marginTop: '1rem' }}><Input value={serverInviteDeleteReasonValue} onInput={(e) => setServerInviteDeleteReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
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

                    {/* Invites */}
                    <div className={styles.title} style={{ marginBottom: '.5rem', marginTop: '1rem' }}>
                        <h4>Invites</h4>
                        <div className={styles.buttons}>
                                <Button
                                    size='sm'
                                    label='Delete'
                                    customClass={styles.button}
                                    onClick={() => { setServerInviteDeleteReasonValue(''); setServerInviteDeleteModalActive(true) }}
                                />
                        </div>
                    </div>

                    <Table
                        theme='dark'
                        columns={inviteColumns}
                        data={selectedServerInfo?.invites
                            ?.map((invite) => ({
                                id: invite.code,
                                channel: invite.channel.name,
                                uses: invite.uses
                            }))}
                        dense
                        selectableRowsHighlight
                        selectableRows
                        pagination
                        paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                        onSelectedRowsChange={handleInviteSelected}
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
                        <div style={{ marginTop: '1rem'}}><Input label='Amount' value={userDMAmountValue} onInput={(e) => setUserDMAmountValue(e.target.value)} /></div>
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
                        <Input label='Days to delete messages' value={userBanValue} onInput={(e) => setUserBanValue(e.target.value)} />
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
                                    onClick={() => { setUserDMValue(''); setUserDMAmountValue('1'); setUserDMModalActive(true) }}
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
                                    onClick={() => { setUserBanValue('0'); setUserBanReasonValue(''); setUserBanModalActive(true) }}
                                />
                        </div>
                    </div>

                    <Table
                        theme='dark'
                        columns={userColumns.filter((col) => col.name !== 'Id')}
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
                    {/* Message Modal */}
                    <Modal
                        active={channelMessageModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={channelMessage} />
                                <Button label='Cancel' size='md' onClick={() => { setChannelMessageModalActive(false) }} />
                            </>
                        }
                    >
                        <Input multiLine={true} label='Message' value={channelMessageValue} onInput={(e) => setChannelMessageValue(e.target.value)} />
                        <div style={{ marginTop: '1rem'}}><Input label='Amount' value={channelMessageAmountValue} onInput={(e) => setChannelMessageAmountValue(e.target.value)} /></div>
                    </Modal>

                    {/* Purge Modal */}
                    <Modal
                        active={channelPurgeModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={channelPurge} />
                                <Button label='Cancel' size='md' onClick={() => { setChannelPurgeModalActive(false) }} />
                            </>
                        }
                    >
                        <Input label='Message limit (-1 for no limit)' value={channelPurgeValue} onInput={(e) => setChannelPurgeValue(e.target.value)} />
                        <div style={{ marginTop: '1rem' }}><Input value={channelPurgeReasonValue} onInput={(e) => setChannelPurgeReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Create Invite Modal */}
                    <Modal
                        active={channelCreateInviteModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={channelCreateInvite} />
                                <Button label='Cancel' size='md' onClick={() => { setChannelCreateInviteModalActive(false) }} />
                            </>
                        }
                    >
                        <Input label='Max age (days, optional)' value={channelCreateInviteMaxAgeValue} onInput={(e) => setChannelCreateInviteMaxAgeValue(e.target.value)} />
                        <div style={{ marginTop: '1rem' }}><Input label='Max uses (number, optional)' value={channelCreateInviteMaxUsesValue} onInput={(e) => setChannelCreateInviteMaxUsesValue(e.target.value)} /></div>
                        <div style={{ marginTop: '1rem' }} className={styles.checkboxContainer}>
                            <h3 className={styles.label}>Temporary membership (optional)</h3>
                            <input className={styles.checkbox} type='checkbox' checked={channelCreateInviteTemporaryValue} onChange={(e) => setChannelCreateInviteTemporaryValue(e.target.checked)} />
                        </div>
                        <div style={{ marginTop: '1rem' }} className={styles.checkboxContainer}>
                            <h3 className={styles.label}>Unique invite (optional)</h3>
                            <input className={styles.checkbox} type='checkbox' checked={channelCreateInviteUniqueValue} onChange={(e) => setChannelCreateInviteUniqueValue(e.target.checked)} />
                        </div>
                        <div style={{ marginTop: '1rem' }}><Input value={channelCreateInviteReasonValue} onInput={(e) => setChannelCreateInviteReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Rename Modal */}
                    <Modal
                        active={channelRenameModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={channelRename} />
                                <Button label='Cancel' size='md' onClick={() => { setChannelRenameModalActive(false) }} />
                            </>
                        }
                    >
                        <Input value={channelRenameValue} onInput={(e) => setChannelRenameValue(e.target.value)} label='Name' customClass={styles.input} />
                        <div style={{ marginTop: '1rem' }}><Input value={channelRenameReasonValue} onInput={(e) => setChannelRenameReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Create Modal */}
                    <Modal
                        active={channelCreateModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={channelCreate} />
                                <Button label='Cancel' size='md' onClick={() => { setChannelCreateModalActive(false) }} />
                            </>
                        }
                    >
                        <Input label='Name' value={channelCreateNameValue} onInput={(e) => setChannelCreateNameValue(e.target.value)} />
                        <div style={{ marginTop: '1rem' }}>
                            <h3 className={styles.label}>Type</h3>
                            <select className={styles.select} value={channelCreateTypeValue} onChange={(e) => setChannelCreateTypeValue(e.target.value)}>
                                <option className={styles.option} value={0}>Text</option>
                                <option className={styles.option} value={2}>Voice</option>
                                <option className={styles.option} value={4}>Category</option>
                                <option className={styles.option} value={5}>News</option>
                                <option className={styles.option} value={13}>Stage</option>
                            </select>
                        </div>
                        <div style={{ marginTop: '1rem'}}><Input label='Amount' value={channelCreateAmountValue} onInput={(e) => setChannelCreateAmountValue(e.target.value)} /></div>
                        <div style={{ marginTop: '1rem' }} className={styles.checkboxContainer}>
                            <h3 className={styles.label}>NSFW (optional)</h3>
                            <input className={styles.checkbox} type='checkbox' checked={channelCreateNSFWValue} onChange={(e) => setChannelCreateNSFWValue(e.target.checked)} />
                        </div>
                        <div style={{ marginTop: '1rem' }}><Input value={channelCreateReasonValue} onInput={(e) => setChannelCreateReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Delete Modal */}
                    <Modal
                        active={channelDeleteModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={channelDelete} />
                                <Button label='Cancel' size='md' onClick={() => { setChannelDeleteModalActive(false) }} />
                            </>
                        }
                    >
                        <div style={{ marginTop: '1rem' }}><Input value={channelDeleteReasonValue} onInput={(e) => setChannelDeleteReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Channels */}
                    <div className={styles.title} style={{ marginBottom: '.5rem' }}>
                        <h4>Channels</h4>
                        <div className={styles.buttons}>
                                <Button
                                    size='sm'
                                    label='Message'
                                    customClass={styles.button}
                                    onClick={() => { setChannelMessageValue(''); setChannelMessageAmountValue('1'); setChannelMessageModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Purge'
                                    customClass={styles.button}
                                    onClick={() => { setChannelPurgeValue('-1'); setChannelPurgeReasonValue(''); setChannelPurgeModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Invite'
                                    customClass={styles.button}
                                    onClick={() => { setChannelCreateInviteMaxAgeValue(''); setChannelCreateInviteMaxUsesValue(''); setChannelCreateInviteTemporaryValue(false); setChannelCreateInviteUniqueValue(false); setChannelCreateInviteReasonValue(''); setChannelCreateInviteModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Rename'
                                    customClass={styles.button}
                                    onClick={() => { setChannelRenameValue(''); setChannelRenameReasonValue(''); setChannelRenameModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Create'
                                    customClass={styles.button}
                                    onClick={() => { setChannelCreateNameValue(''); setChannelCreateTypeValue(0); setChannelCreateAmountValue(1); setChannelCreateNSFWValue(false); setChannelCreateReasonValue(''); setChannelCreateModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Delete'
                                    customClass={styles.button}
                                    onClick={() => { setChannelDeleteReasonValue(''); setChannelDeleteModalActive(true) }}
                                />
                        </div>
                    </div>

                    <Table
                        theme='dark'
                        columns={channelColumns}
                        data={selectedServerInfo?.channels
                            ?.map((channel) => ({
                                id: channel.id,
                                name: channel.name,
                                type: (function () {
                                    const type = channel.type;

                                    switch (type) {
                                        case 0:
                                            return 'Text'
                                        case 1:
                                            return 'DM'
                                        case 2:
                                            return 'Voice'
                                        case 3:
                                            return 'Group DM'
                                        case 4:
                                            return 'Category'
                                        case 5:
                                            return 'Announcement'
                                        case 10:
                                            return 'Announcement Thread'
                                        case 11:
                                            return 'Public Thread'
                                        case 12:
                                            return 'Private Thread'
                                        case 13:
                                            return 'Stage Voice'
                                        case 14:
                                            return 'Directory'
                                        case 15:
                                            return 'Forum'
                                        default:
                                            return 'Unknown'
                                    };
                                })()
                            }))}
                        dense
                        selectableRowsHighlight
                        selectableRows
                        pagination
                        paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                        onSelectedRowsChange={handleChannelSelected}
                    />
                </>
            ) : <Alert variant='warning' description={<p>No server is currently selected.</p>} />
        },
        {
            label: 'Roles',
            icon: faScroll,
            content: selectedServer ? (
                <>
                    {/* Add Member Modal */}
                    <Modal
                        active={roleAddMemberModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={roleAddMembers} />
                                <Button label='Cancel' size='md' onClick={() => { setRoleAddMemberModalActive(false) }} />
                            </>
                        }
                    >
                        <h3 style={{ marginBottom: '.5rem' }}>Members</h3>
                        <Table
                            theme='dark'
                            columns={userColumns.filter((col) => col.name !== 'Online' && col.name !== 'Bot')}
                            data={selectedServerInfo?.members
                                ?.filter((member) => member.id !== client.user.id)
                                ?.map((member) => ({
                                    id: member.id,
                                    user: member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username
                                }))}
                            dense
                            selectableRowsHighlight
                            selectableRows
                            pagination
                            paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                            onSelectedRowsChange={handleAddMemberSelected}
                        />
                        <div style={{ marginTop: '1rem' }}><Input value={roleAddMemberReasonValue} onInput={(e) => setRoleAddMemberReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Remove Member Modal */}
                    <Modal
                        active={roleRemoveMemberModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={roleRemoveMembers} />
                                <Button label='Cancel' size='md' onClick={() => { setRoleRemoveMemberModalActive(false) }} />
                            </>
                        }
                    >
                        <h3 style={{ marginBottom: '.5rem' }}>Members</h3>
                        <Table
                            theme='dark'
                            columns={userColumns.filter((col) => col.name !== 'Online' && col.name !== 'Bot')}
                            data={selectedServerInfo?.members
                                ?.filter((member) => member.id !== client.user.id)
                                ?.map((member) => ({
                                    id: member.id,
                                    user: member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username
                                }))}
                            dense
                            selectableRowsHighlight
                            selectableRows
                            pagination
                            paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                            onSelectedRowsChange={handleRemoveMemberSelected}
                        />
                        <div style={{ marginTop: '1rem' }}><Input value={roleRemoveMemberReasonValue} onInput={(e) => setRoleRemoveMemberReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Rename Modal */}
                    <Modal
                        active={roleRenameModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={roleRename} />
                                <Button label='Cancel' size='md' onClick={() => { setRoleRenameModalActive(false) }} />
                            </>
                        }
                    >
                        <Input value={roleRenameValue} onInput={(e) => setRoleRenameValue(e.target.value)} label='Name' customClass={styles.input} />
                        <div style={{ marginTop: '1rem' }}><Input value={roleRenameReasonValue} onInput={(e) => setRoleRenameReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Create Modal */}
                    <Modal
                        active={roleCreateModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={roleCreate} />
                                <Button label='Cancel' size='md' onClick={() => { setRoleCreateModalActive(false) }} />
                            </>
                        }
                    >
                        <Input label='Name' value={roleCreateNameValue} onInput={(e) => setRoleCreateNameValue(e.target.value)} />
                        <div style={{ marginTop: '1rem'}}><Input label='Amount' value={roleCreateAmountValue} onInput={(e) => setRoleCreateAmountValue(e.target.value)} /></div>
                        <div style={{ marginTop: '1rem' }} className={styles.checkboxContainer}>
                            <h3 className={styles.label}>Hoist (optional)</h3>
                            <input className={styles.checkbox} type='checkbox' checked={roleCreateHoistValue} onChange={(e) => setRoleCreateHoistValue(e.target.checked)} />
                        </div>
                        <div style={{ marginTop: '1rem' }} className={styles.checkboxContainer}>
                            <h3 className={styles.label}>Mentionable (optional)</h3>
                            <input className={styles.checkbox} type='checkbox' checked={roleCreateMentionableValue} onChange={(e) => setRoleCreateMentionableValue(e.target.checked)} />
                        </div>
                        <div style={{ marginTop: '1rem' }}><Input value={roleCreateReasonValue} onInput={(e) => setRoleCreateReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Delete Modal */}
                    <Modal
                        active={roleDeleteModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={roleDelete} />
                                <Button label='Cancel' size='md' onClick={() => { setRoleDeleteModalActive(false) }} />
                            </>
                        }
                    >
                        <div style={{ marginTop: '1rem' }}><Input value={roleDeleteReasonValue} onInput={(e) => setRoleDeleteReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Roles */}
                    <div className={styles.title} style={{ marginBottom: '.5rem' }}>
                        <h4>Roles</h4>
                        <div className={styles.buttons}>
                                <Button
                                    size='sm'
                                    label='Remove Member'
                                    customClass={styles.button}
                                    onClick={() => { setRoleRemoveMemberReasonValue(''); setRoleRemoveMemberModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Add Member'
                                    customClass={styles.button}
                                    onClick={() => { setRoleAddMemberReasonValue(''); setRoleAddMemberModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Rename'
                                    customClass={styles.button}
                                    onClick={() => { setRoleRenameValue(''); setRoleRenameReasonValue(''); setRoleRenameModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Create'
                                    customClass={styles.button}
                                    onClick={() => { setRoleCreateNameValue(''); setRoleCreateAmountValue(1); setRoleCreateHoistValue(false); setRoleCreateMentionableValue(false); setRoleCreateReasonValue(''); setRoleCreateModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Delete'
                                    customClass={styles.button}
                                    onClick={() => { setRoleDeleteReasonValue(''); setRoleDeleteModalActive(true) }}
                                />
                        </div>
                    </div>

                    <Table
                        theme='dark'
                        columns={roleColumns}
                        data={selectedServerInfo?.roles
                            ?.filter((role) => role.id !== selectedServer?.id)
                            ?.map((role) => ({
                                id: role.id,
                                name: role.name,
                                created: moment(role.createdAt).format('YYYY-MM-DD')
                            }))}
                        dense
                        selectableRowsHighlight
                        selectableRows
                        pagination
                        paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                        onSelectedRowsChange={handleRoleSelected}
                    />
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