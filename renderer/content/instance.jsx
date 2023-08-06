import styles from './instance.module.css';
import { faAnglesLeft, faCheck, faIcons, faList, faNoteSticky, faPowerOff, faScroll, faServer, faTrash, faUsers } from '@fortawesome/free-solid-svg-icons';

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

    const client = context.instance.client;
    let servers = context.instance.servers;

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

    const [selectingServer, setSelectingServer] = useState(false);
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(function () {
        client.on('guildCreate', function () {
            setContext((state) => ({ ...state, instance: { ...state.instance, servers: client.guilds } }))
        });
    
        client.on('guildUpdate', function (server) {
            if (server.id === selectedServer?.id) {
                setSelectedServer(server);
            };
    
            setContext((state) => ({ ...state, instance: { ...state.instance, servers: client.guilds } }))
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
    
            setContext((state) => ({ ...state, instance: { ...state.instance, servers: client.guilds } }))
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
            let bans;
    
            try { bans = await server.getBans() }
            catch { bans = null };
    
            setSelectedServerInfo((state) => ({ ...state, bans }));
        });
    
        client.on('guildBanRemove', async function (server) {
            let bans;
    
            try { bans = await server.getBans() }
            catch { bans = null };
    
            setSelectedServerInfo((state) => ({ ...state, bans }));
        });
    
        client.on('inviteCreate', async function (server) {
            let invites;
    
            try { invites = await server.getInvites() }
            catch { invites = null };
    
            setSelectedServerInfo((state) => ({ ...state, invites }));
        });
    
        client.on('inviteDelete', async function (server) {
            let invites;
    
            try { invites = await server.getInvites() }
            catch { invites = null };
    
            setSelectedServerInfo((state) => ({ ...state, invites }));
        });
        
        function onResize () {
            setDimensions({ width: this.window.innerWidth, height: this.window.innerHeight });
        };

        window.addEventListener('resize', onResize);

        return function () {
            window.removeEventListener('resize', onResize)
        };
    }, [selectedServer, setContext, setSelectedServer, setSelectedServerInfo]);

    function addLog (log) {
        setLogs((state) => [ ...state, { id: state.length + 1, log } ]);
    };

    function copyLogs () {
        const logs = document.querySelector(`.${styles.logs} .${styles.text}`);
        const text = Array.from(logs.childNodes)
            .map((log) => log.textContent)
            .reverse()
            .join('\n');

        clipboard.writeText(text);
    };

    function unselectServer () {
        disableElements(_context);

        const name = selectedServer?.name;

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

        addLog(<p>
            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
            <span style={{ color: 'cyan' }}>[{name}]</span>&nbsp;
            <span style={{ color: 'lightgreen' }}>Unselected server</span>
        </p>);

        enableElements(_context);
    };

    async function selectServer (id) {
        disableElements(_context);
        setSelectingServer(true);
        setServerAlerts((state) => ({ ...state, [id]: false }));

        try {
            const server = servers.get(id);

            if (!server) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'gold' }}>[{client.user.discriminator !== '0'  ? `${client.user.username}#${client.user.discriminator}` : client.user.username}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to fetch server (id: <b>{id}</b>)</span>
                </p>);

                throw 'No server.';
            };

            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'gold' }}>Selecting server... (this might take a while)</span>
            </p>);

            const channels = server.channels || null;
            const roles = server.roles || null;
            const emojis = server.emojis || null;
            const stickers = server.stickers || null;

            let members;

            try { await server.fetchAllMembers(); members = server.members || null }
            catch (error) { console.error(error) };

            if (members) addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Fetched members</span>
            </p>);
            else addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to fetch members</span>
            </p>);

            if (channels) addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Fetched channels</span>
            </p>);
            else addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to fetch channels</span>
            </p>);

            if (roles) addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Fetched roles</span>
            </p>);
            else addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to fetch roles</span>
            </p>);

            if (emojis) addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Fetched emojis</span>
            </p>);
            else addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to fetch emojis</span>
            </p>);

            if (stickers) addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Fetched stickers</span>
            </p>);
            else addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to fetch stickers</span>
            </p>);

            let bans;
            let templates;
            let invites;

            try { bans = await server.getBans() }
            catch (error) {
                console.error(error);
                bans = null;
            };

            if (bans) addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Fetched bans</span>
            </p>);
            else addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to fetch bans</span>
            </p>);

            try { templates = await server.getTemplates() }
            catch (error) {
                console.error(error);
                templates = null;
            };

            if (templates) addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Fetched templates</span>
            </p>);
            else addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to fetch templates</span>
            </p>);

            try { invites = await server.getInvites() }
            catch (error) {
                console.error(error);
                invites = null
            };

            if (invites) addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Fetched invites</span>
            </p>);
            else addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to fetch invites</span>
            </p>);

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

            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{server?.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Selected server</span>
            </p>);

            setSelectingServer(false);
            enableElements(_context);
        }
        catch (error) {
            console.error(error);

            setSelectingServer(false);
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
        catch (error) {
            console.error(error);
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to leave server</span>
            </p>);
        };

        enableElements(_context);
    };

    async function deleteServer (server) {
        disableElements(_context);

        const name = server.name;

        try {
            await server?.delete();

            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Deleted server</span>
            </p>);
        }
        catch (error) {
            console.error(error);
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to delete server</span>
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
            name: 'Username',
            selector: row => row.user,
            sortable: true
        },
        {
            name: 'Nickname',
            selector: row => row.nick,
            sortable: true
        },
        {
            name: 'Joined',
            selector: row => row.joined,
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
            name: 'Managed',
            selector: row => row.managed,
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
            name: 'Reason',
            selector: row => row.reason,
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
            name: 'Created',
            selector: row => row.created,
            sortable: true
        },
        {
            name: 'Creator',
            selector: row => row.creator,
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
            name: 'Created',
            selector: row => row.created,
            sortable: true
        },
        {
            name: 'Creator',
            selector: row => row.creator,
            sortable: true
        },
        {
            name: 'Synced',
            selector: row => row.synced,
            sortable: true
        },
        {
            name: 'Uses',
            selector: row => row.uses,
            sortable: true
        }
    ];

    const emojiColumns = [
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
            name: 'Available',
            selector: row => row.available,
            sortable: true
        },
        {
            name: 'Id',
            selector: row => row.id,
            sortable: true
        }
    ];

    const stickerColumns = [
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
            name: 'Available',
            selector: row => row.available,
            sortable: true
        },
        {
            name: 'Id',
            selector: row => row.id,
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

    const [selectedEmojis, setSelectedEmojis] = useState([]);
    const handleEmojiSelected = useCallback((s) => setSelectedEmojis(s.selectedRows), []);

    const [selectedStickers, setSelectedStickers] = useState([]);
    const handleStickerSelected = useCallback((s) => setSelectedStickers(s.selectedRows), []);

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
                    catch (error) {
                        console.error(error);
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
        catch (error) {
            console.error(error);
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
                    catch (error) {
                        console.error(error);
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
        catch (error) {
            console.error(error);
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
                    catch (error) {
                        console.error(error);
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
        catch (error) {
            console.error(error);
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
                    catch (error) {
                        console.error(error);
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
        catch (error) {
            console.error(error);
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

                        const formattedMessageValue = userDMValue
                            .replace(/%server%/g, selectedServer?.name)
                            .replace(/%instance%/g, `<@${client?.user?.id}>`)
                            .replace(/%owner%/g, `<@${selectedServer?.ownerID}>`)
                            .replace(/%member%/g, `<@${member?.id}>`);
    
                        await dmChannel.createMessage({ content: formattedMessageValue, allowedMentions: { everyone: true, roles: true, users: true } });
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>DMed <b>{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}</b> with <b>{userDMValue}</b></span>
                        </p>);
                    }
                    catch (error) {
                        console.error(error);
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
        catch (error) {
            console.error(error);
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
        catch (error) {
            console.error(error);
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
        catch (error) {
            console.error(error);
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
                catch (error) {
                    console.error(error);
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
        catch (error) {
            console.error(error);
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
                <span style={{ color: 'gold' }}>[{client.user.discriminator !== '0'  ? `${client.user.username}#${client.user.discriminator}` : client.user.username}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Copied bot invite link</span>
            </p>);
        }
        catch (error) {
            console.error(error);
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'gold' }}>[{client.user.discriminator !== '0'  ? `${client.user.username}#${client.user.discriminator}` : client.user.username}]</span>&nbsp;
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
                <span style={{ color: 'gold' }}>[{client.user.discriminator !== '0'  ? `${client.user.username}#${client.user.discriminator}` : client.user.username}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Opened bot invite link</span>
            </p>);
        }
        catch (error) {
            console.error(error);
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'gold' }}>[{client.user.discriminator !== '0'  ? `${client.user.username}#${client.user.discriminator}` : client.user.username}]</span>&nbsp;
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
        catch (error) {
            console.error(error);
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to prune guild (days: <b>"{serverPruneValue && serverPruneValue !== "" ? parseInt(serverPruneValue) : 7}"</b>, reason: <b>"{serverPruneReasonValue}"</b>)</span>
            </p>);
        };
    };

    async function serverTemplatesRefresh () {
        try {
            let templates;

            try { templates = await selectedServer?.getTemplates() }
            catch (error) {
                console.error(error);
                templates = null;
            };
            
            setSelectedServerInfo((state) => ({ ...state, templates }));

            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Refreshed templates</span>
            </p>);
        }
        catch (error) {
            console.error(error);
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
                catch (error) {
                    console.error(error);
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
                catch (error) {
                    console.error(error);
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

    async function serverTemplatesCreate () {
        try {
            const template = await selectedServer?.createTemplate(`Tmp. ${moment(Date.now()).format('MM/YYYY HH:mm:ss')}`);
            await serverTemplatesRefresh();

            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Created template <b>"{template.name}"</b> (code: <b>"{template.id}"</b>)</span>
            </p>);
        }
        catch (error) {
            console.error(error);
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to create template</span>
            </p>);
        };
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
                catch (error) {
                    console.error(error);
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
                            catch (error) {
                                console.error(error);
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
        catch (error) {
            console.error(error);
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
                            catch (error) {
                                console.error(error);
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
        catch (error) {
            console.error(error);
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
                        const formattedMessageValue = channelMessageValue
                            .replace(/%server%/g, selectedServer?.name)
                            .replace(/%instance%/g, `<@${client?.user?.id}>`)
                            .replace(/%owner%/g, `<@${selectedServer?.ownerID}>`);

                        await channel.createMessage({ content: formattedMessageValue, allowedMentions: { everyone: true, roles: true, users: true } });
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>Messaged in channel <b>"{channel.name}"</b>: <b>{channelMessageValue}</b></span>
                        </p>);
                    }
                    catch (error) {
                        console.error(error);
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
        catch (error) {
            console.error(error);
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
                    catch (error) {
                        console.error(error);
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
        catch (error) {
            console.error(error);
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
                    catch (error) {
                        console.error(error);
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
        catch (error) {
            console.error(error);
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
                    catch (error) {
                        console.error(error);
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crimson' }}>Failed to delete channel <b>"{channel.name}"</b> (id: <b>{channel.id}</b>, reason: <b>"{channelDeleteReasonValue}"</b>)</span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch (error) {
            console.error(error);
            selectedChannels.forEach(function (channel) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to delete channel <b>"{channel.name}"</b> (id: <b>{channel.id}</b>, reason: <b>"{channelDeleteReasonValue}"</b>)</span>
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
                    catch (error) {
                        console.error(error);
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
        catch (error) {
            console.error(error);
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
            catch (error) {
                console.error(error);
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
                    catch (error) {
                        console.error(error);
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crimson' }}>Failed to delete role <b>"{role.name}"</b> (id: <b>{role.id}</b>, reason: <b>"{roleDeleteReasonValue}"</b>)</span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch (error) {
            console.error(error);
            selectedRoles.forEach(function (role) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to delete role <b>"{role.name}"</b> (id: <b>{role.id}</b>, reason: <b>"{roleDeleteReasonValue}"</b>)</span>
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
                    catch (error) {
                        console.error(error);
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
        catch (error) {
            console.error(error);
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
            catch (error) {
                console.error(error);
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
                            catch (error) {
                                console.error(error);
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
        catch (error) {
            console.error(error);
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
                            catch (error) {
                                console.error(error);
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
        catch (error) {
            console.error(error);
            selectedRemoveMembers.forEach(function (member) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to remove member <b>"{member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username}"</b> from role <b>{role.name}</b> (reason: <b>"{roleRemoveMemberReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [emojiRenameModalActive, setEmojiRenameModalActive] = useState(false);
    const [emojiRenameValue, setEmojiRenameValue] = useState('');
    const [emojiRenameReasonValue, setEmojiRenameReasonValue] = useState('');

    async function emojiRename () {
        setEmojiRenameModalActive(false);

        try {
            const promises = selectedEmojis.map(function (emoji) {
                return new Promise(async function (resolve) {
                    try {
                        const emojiName = emoji.name;
                        const _emoji = await selectedServer?.editEmoji(emoji?.id, { name: emojiRenameValue }, emojiRenameReasonValue || null);
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>Renamed emoji <b>"{emojiName}"</b> to <b>"{_emoji.name}"</b> (id: <b>{emoji.id}</b>, reason: <b>"{emojiRenameReasonValue}"</b>)</span>
                        </p>);
                    }
                    catch (err) {
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crimson' }}>Failed to rename emoji <b>"{emoji.name}"</b> to <b>"{emojiRenameValue}"</b> (id: <b>{emoji.id}</b>, reason: <b>"{emojiRenameReasonValue}"</b>)</span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch (error) {
            console.error(error);
            selectedEmojis.forEach(function (emoji) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to rename emoji <b>"{emoji.name}"</b> to <b>"{emojiRenameValue}"</b> (id: <b>{emoji.id}</b>, reason: <b>"{emojiRenameReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [stickerRenameModalActive, setStickerRenameModalActive] = useState(false);
    const [stickerRenameValue, setStickerRenameValue] = useState('');
    const [stickerRenameReasonValue, setStickerRenameReasonValue] = useState('');

    async function stickerRename () {
        setStickerRenameModalActive(false);

        try {
            const promises = selectedStickers.map(function (sticker) {
                return new Promise(async function (resolve) {
                    try {
                        const stickerName = sticker.name;
                        const _sticker = await selectedServer?.editSticker(sticker?.id, { name: stickerRenameValue }, stickerRenameReasonValue || null);
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>Renamed sticker <b>"{stickerName}"</b> to <b>"{_sticker.name}"</b> (id: <b>{sticker.id}</b>, reason: <b>"{stickerRenameReasonValue}"</b>)</span>
                        </p>);
                    }
                    catch (err) {
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crimson' }}>Failed to rename sticker <b>"{sticker.name}"</b> to <b>"{stickerRenameValue}"</b> (id: <b>{sticker.id}</b>, reason: <b>"{stickerRenameReasonValue}"</b>)</span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch (error) {
            console.error(error);
            selectedStickers.forEach(function (sticker) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to rename sticker <b>"{sticker.name}"</b> to <b>"{stickerRenameValue}"</b> (id: <b>{sticker.id}</b>, reason: <b>"{stickerRenameReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [stickerDeleteModalActive, setStickerDeleteModalActive] = useState(false);
    const [stickerDeleteReasonValue, setStickerDeleteReasonValue] = useState('');

    async function stickerDelete () {
        setStickerDeleteModalActive(false);

        try {
            const promises = selectedStickers.map(function (sticker) {
                return new Promise(async function (resolve) {
                    try {
                        await selectedServer?.deleteSticker(sticker.id, stickerDeleteReasonValue || undefined);
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>Deleted sticker <b>"{sticker.name}"</b> (id: <b>{sticker.id}</b>, reason: <b>"{stickerDeleteReasonValue}"</b>)</span>
                        </p>);
                    }
                    catch (error) {
                        console.error(error);
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crimson' }}>Failed to delete sticker <b>"{sticker.name}"</b> (id: <b>{sticker.id}</b>, reason: <b>"{stickerDeleteReasonValue}"</b>)</span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch (error) {
            console.error(error);
            selectedStickers.forEach(function (sticker) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to delete sticker <b>"{sticker.name}"</b> (id: <b>{sticker.id}</b>, reason: <b>"{stickerDeleteReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [emojiDeleteModalActive, setEmojiDeleteModalActive] = useState(false);
    const [emojiDeleteReasonValue, setEmojiDeleteReasonValue] = useState('');

    async function emojiDelete () {
        setEmojiDeleteModalActive(false);

        try {
            const promises = selectedEmojis.map(function (emoji) {
                return new Promise(async function (resolve) {
                    try {
                        await selectedServer?.deleteEmoji(emoji.id, emojiDeleteReasonValue || undefined);
    
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'lightgreen' }}>Deleted emoji <b>"{emoji.name}"</b> (id: <b>{emoji.id}</b>, reason: <b>"{emojiDeleteReasonValue}"</b>)</span>
                        </p>);
                    }
                    catch (error) {
                        console.error(error);
                        addLog(<p>
                            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                            <span style={{ color: 'crimson' }}>Failed to delete emoji <b>"{emoji.name}"</b> (id: <b>{emoji.id}</b>, reason: <b>"{emojiDeleteReasonValue}"</b>)</span>
                        </p>);
                    };

                    resolve();
                });
            });

            await Promise.all(promises);
        }
        catch (error) {
            console.error(error);
            selectedEmojis.forEach(function (emoji) {
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to delete emoji <b>"{emoji.name}"</b> (id: <b>{emoji.id}</b>, reason: <b>"{emojiDeleteReasonValue}"</b>)</span>
                </p>);
            });
        };
    };

    const [emojiCreateModalActive, setEmojiCreateModalActive] = useState(false);
    const [emojiCreateNameValue, setEmojiCreateNameValue] = useState('');
    const [emojiCreateAmountValue, setEmojiCreateAmountValue] = useState('');
    const [emojiCreateReasonValue, setEmojiCreateReasonValue] = useState('');

    async function emojiCreate () {
        setEmojiCreateModalActive(false);

        try {
            const response = await dialog();

            if (response.length < 1) throw 'No file selected.';

            const image = await fs.readFile(response[0].file.path);
            const imageBuffer = `data:image/${response[0].file.name.split('.').reverse()[0]};base64,${image.toString('base64')}`;

            const promises = [...Array(emojiCreateAmountValue && emojiCreateAmountValue !== "" ? parseInt(emojiCreateAmountValue) : 1)].map(() => new Promise(async function (resolve) {
                try {
                    const emoji = await selectedServer?.createEmoji({
                        name: emojiCreateNameValue,
                        image: imageBuffer
                    }, emojiCreateReasonValue || null);
        
                    addLog(<p>
                        <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                        <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                        <span style={{ color: 'lightgreen' }}>Created emoji <b>"{emojiCreateNameValue}"</b> (id: <b>{emoji.id}</b>, reason: <b>"{emojiCreateReasonValue}"</b>)</span>
                    </p>);
                }
                catch (error) {
                    console.error(error);
                    addLog(<p>
                        <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                        <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                        <span style={{ color: 'crimson' }}>Failed to create emoji <b>"{emojiCreateNameValue}"</b> (reason: <b>"{emojiCreateReasonValue}"</b>)</span>
                    </p>);
                };
    
                resolve();
            }));
    
            await Promise.all(promises);
        }
        catch (error) {
            console.error(error);
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to create emoji <b>"{emojiCreateNameValue}"</b> (reason: <b>"{emojiCreateReasonValue}"</b>)</span>
            </p>);
        };
    };

    const [stickerCreateModalActive, setStickerCreateModalActive] = useState(false);
    const [stickerCreateNameValue, setStickerCreateNameValue] = useState('');
    const [stickerCreateEmojiValue, setStickerCreateEmojiValue] = useState('');
    const [stickerCreateAmountValue, setStickerCreateAmountValue] = useState('');
    const [stickerCreateReasonValue, setStickerCreateReasonValue] = useState('');

    async function stickerCreate () {
        setStickerCreateModalActive(false);

        try {
            const response = await dialog();

            if (response.length < 1) throw 'No file selected.';

            const image = await fs.readFile(response[0].file.path);

            const promises = [...Array(stickerCreateAmountValue && stickerCreateAmountValue !== "" ? parseInt(stickerCreateAmountValue) : 1)].map(() => new Promise(async function (resolve) {
                try {
                    const sticker = await selectedServer?.createSticker({
                        name: stickerCreateNameValue,
                        file: {
                            file: image,
                            name: response[0].file.name
                        },
                        tags: stickerCreateEmojiValue || '🔥'
                    }, stickerCreateReasonValue || null);
        
                    addLog(<p>
                        <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                        <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                        <span style={{ color: 'lightgreen' }}>Created sticker <b>"{stickerCreateNameValue}"</b> (id: <b>{sticker.id}</b>, reason: <b>"{stickerCreateReasonValue}"</b>)</span>
                    </p>);
                }
                catch (error) {
                    console.error(error);
                    addLog(<p>
                        <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                        <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                        <span style={{ color: 'crimson' }}>Failed to create sticker <b>"{stickerCreateNameValue}"</b> (reason: <b>"{stickerCreateReasonValue}"</b>)</span>
                    </p>);
                };
    
                resolve();
            }));
    
            await Promise.all(promises);
        }
        catch (error) {
            console.error(error);
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to create sticker <b>"{stickerCreateNameValue}"</b> (reason: <b>"{stickerCreateReasonValue}"</b>)</span>
            </p>);
        };
    };

    async function serversRefresh () {
        servers = client.guilds || null;

        setContext((state) => ({
            ...state,
            instance: {
                ...state.instance,
                servers
            }
        }));

        addLog(<p>
            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
            <span style={{ color: 'gold' }}>[{client.user.discriminator !== '0'  ? `${client.user.username}#${client.user.discriminator}` : client.user.username}]</span>&nbsp;
            <span style={{ color: 'lightgreen' }}>Refreshed servers</span>
        </p>);
    };

    async function serverBansRefresh () {
        try {
            let bans;

            try { bans = await selectedServer?.getBans() }
            catch (error) {
                console.error(error);
                bans = null;
            };

            setSelectedServerInfo((state) => ({ ...state, bans }));

            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Refreshed bans</span>
            </p>);
        }
        catch (error) {
            console.error(error);
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to refresh bans</span>
            </p>);
        }; 
    };

    async function serverInvitesRefresh () {
        try {
            let invites;

            try { invites = await selectedServer?.getInvites() }
            catch (error) {
                console.error(error);
                invites = null;
            };

            setSelectedServerInfo((state) => ({ ...state, invites }));

            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'lightgreen' }}>Refreshed invites</span>
            </p>);
        }
        catch (error) {
            console.error(error);
            addLog(<p>
                <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
                <span style={{ color: 'crimson' }}>Failed to refresh invites</span>
            </p>);
        }; 
    };

    async function serverUsersRefresh () {
        const members = selectedServer?.members || null;

        setSelectedServerInfo((state) => ({ ...state, members }));

        addLog(<p>
            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
            <span style={{ color: 'lightgreen' }}>Refreshed users</span>
        </p>);
    };

    async function serverRolesRefresh () {
        const roles = selectedServer?.roles || null;

        setSelectedServerInfo((state) => ({ ...state, roles }));

        addLog(<p>
            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
            <span style={{ color: 'lightgreen' }}>Refreshed roles</span>
        </p>);
    };

    async function serverChannelsRefresh () {
        const channels = selectedServer?.channels || null;

        setSelectedServerInfo((state) => ({ ...state, channels }));

        addLog(<p>
            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
            <span style={{ color: 'lightgreen' }}>Refreshed channels</span>
        </p>);
    };

    async function serverEmojisRefresh () {
        const emojis = selectedServer?.emojis || null;

        setSelectedServerInfo((state) => ({ ...state, emojis }));

        addLog(<p>
            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
            <span style={{ color: 'lightgreen' }}>Refreshed emojis</span>
        </p>);
    };

    async function serverStickersRefresh () {
        const stickers = selectedServer?.stickers || null;

        setSelectedServerInfo((state) => ({ ...state, stickers }));

        addLog(<p>
            <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
            <span style={{ color: 'cyan' }}>[{selectedServer.name}]</span>&nbsp;
            <span style={{ color: 'lightgreen' }}>Refreshed stickers</span>
        </p>);
    };

    const [serverCreateModalActive, setServerCreateModalActive] = useState(false);
    const [serverCreateNameValue, setServerCreateNameValue] = useState('');
    const [serverCreateAmountValue, setServerCreateAmountValue] = useState(0);

    async function serverCreate () {
        setServerCreateModalActive(false);

        const promises = [...Array(serverCreateAmountValue && serverCreateAmountValue !== "" ? parseInt(serverCreateAmountValue) : 1)].map(() => new Promise(async function (resolve) {
            try {
                const server = await client?.createGuild(serverCreateNameValue, {});
    
                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'gold' }}>[{client.user.discriminator !== '0'  ? `${client.user.username}#${client.user.discriminator}` : client.user.username}]</span>&nbsp;
                    <span style={{ color: 'lightgreen' }}>Created server <b>"{serverCreateNameValue}"</b> (id: <b>{server.id}</b>)</span>
                </p>);
            }
            catch (error) {
                console.error(error);

                addLog(<p>
                    <span style={{ color: 'lightblue' }}>({moment(Date.now()).format('HH:mm:ss')})</span>&nbsp;
                    <span style={{ color: 'gold' }}>[{client.user.discriminator !== '0'  ? `${client.user.username}#${client.user.discriminator}` : client.user.username}]</span>&nbsp;
                    <span style={{ color: 'crimson' }}>Failed to create server <b>"{serverCreateNameValue}"</b></span>
                </p>);
            };

            resolve();
        }));

        await Promise.all(promises);
    };

    const [usersFilterText, setUsersFilterText] = useState('');
    const [usersFilterType, setUsersFilterType] = useState('username');

    const [bansFilterText, setBansFilterText] = useState('');
    const [bansFilterType, setBansFilterType] = useState('username');

    const [invitesFilterText, setInvitesFilterText] = useState('');
    const [invitesFilterType, setInvitesFilterType] = useState('code');

    const [templatesFilterText, setTemplatesFilterText] = useState('');
    const [templatesFilterType, setTemplatesFilterType] = useState('code');

    const [channelsFilterText, setChannelsFilterText] = useState('');
    const [channelsFilterType, setChannelsFilterType] = useState('name');

    const [rolesFilterText, setRolesFilterText] = useState('');
    const [rolesFilterType, setRolesFilterType] = useState('name');

    const [addRolesFilterText, setAddRolesFilterText] = useState('');
    const [addRolesFilterType, setAddRolesFilterType] = useState('name');

    const [removeRolesFilterText, setRemoveRolesFilterText] = useState('');
    const [removeRolesFilterType, setRemoveRolesFilterType] = useState('name');

    const [addMembersFilterText, setAddMembersFilterText] = useState('');
    const [addMembersFilterType, setAddMembersFilterType] = useState('username');

    const [removeMembersFilterText, setRemoveMembersFilterText] = useState('');
    const [removeMembersFilterType, setRemoveMembersFilterType] = useState('username');

    const [emojisFilterText, setEmojisFilterText] = useState('');
    const [emojisFilterType, setEmojisFilterType] = useState('name');

    const [stickersFilterText, setStickersFilterText] = useState('');
    const [stickersFilterType, setStickersFilterType] = useState('name');

    const [serversFilterText, setServersFilterText] = useState('');
    const [serversFilterType, setServersFilterType] = useState('name');

    const tabs = [
        {
            label: 'Servers',
            icon: faServer,
            content: (
                <>
                    {/* Info */}
                    {client.bot ? (
                        <Alert style={{ marginBottom: '.5rem' }} variant='info' description={<p>Refreshing is not required on bot accounts unless for templates; <b>only manually refresh if content is missing</b>.</p>} />
                    ) : (
                        <Alert style={{ marginBottom: '.5rem' }} variant='info' description={<p>Users, channels, etc do not automatically refresh on user accounts; <b>manually click the refresh button</b>.</p>} />
                    )}

                    {/* Servers */}
                    {/* Create Modal */}
                    <Modal
                        active={serverCreateModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={serverCreate} />
                                <Button label='Cancel' size='md' onClick={() => { setServerCreateModalActive(false) }} />
                            </>
                        }
                    >
                        <Input label='Name' value={serverCreateNameValue} onInput={(e) => setServerCreateNameValue(e.target.value)} />
                        <div style={{ marginTop: '1rem'}}><Input label='Amount' value={serverCreateAmountValue} onInput={(e) => setServerCreateAmountValue(e.target.value)} /></div>
                    </Modal>

                    <div className={`${styles.title} ${styles.topLabel}`} style={{ marginBottom: '.5rem' }}>
                        <div className={styles.mobile}>
                            <h4>Servers</h4>
                            <div className={styles.filter}>
                                <Input
                                    label=''
                                    customClass={styles.filterInput}
                                    placeholder='Filter'
                                    value={serversFilterText}
                                    onInput={(e) => setServersFilterText(e.target.value)}
                                />
                                <select
                                    className={`${styles.select} ${styles.filterSelect}`}
                                    value={serversFilterType}
                                    onChange={(e) => setServersFilterType(e.target.value)}
                                >
                                    <option className={styles.option} value={'name'}>Name</option>
                                    <option className={styles.option} value={'id'}>Id</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.buttons}>
                            <Button
                                size='sm'
                                label='Refresh'
                                customClass={styles.button}
                                onClick={serversRefresh}
                            />
                            {servers && (
                                <>
                                    {(client?.bot && (
                                        <>
                                            <Button
                                                size='sm'
                                                label='Create'
                                                customClass={styles.button}
                                                onClick={() => { setServerCreateNameValue(''); setServerCreateAmountValue(1); setServerCreateModalActive(true) }}
                                            />
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
                                        </>
                                    ))}
                                    <div className={styles.filter}>
                                        <Input
                                            label=''
                                            customClass={styles.filterInput}
                                            placeholder='Filter'
                                            value={serversFilterText}
                                            onInput={(e) => setServersFilterText(e.target.value)}
                                        />
                                        <select
                                            className={`${styles.select} ${styles.filterSelect}`}
                                            value={serversFilterType}
                                            onChange={(e) => setServersFilterType(e.target.value)}
                                        >
                                            <option className={styles.option} value={'name'}>Name</option>
                                            <option className={styles.option} value={'id'}>Id</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {servers ? <div className={styles.servers}>
                        {servers?.filter((server) => (server[serversFilterType] && server[serversFilterType].toLowerCase().includes(serversFilterText.toLowerCase())) || server?.id === selectedServer?.id)?.map((server) => (
                            <div className={styles.server} key={server?.id}>
                                <Image className={styles.icon} src={server?.icon ? server.iconURL : 'https://cdn.discordapp.com/embed/avatars/1.png'} width={50} height={50} />
                                <div className={styles.info}>
                                    <div className={styles.text}>
                                        <h3 className={styles.name}>{server?.name}</h3>
                                        <p className={styles.id}>Id: <b>{server?.id}</b></p>
                                        <Alert variant='warning' description={<p>Failed to select server; possibly not in server.</p>} style={{ marginTop: '1rem', display: serverAlerts[server.id] ? 'flex' : 'none' }} />
                                    </div>
                                    <div className={styles.buttons}>
                                        {selectedServer?.id === server?.id ? (
                                            <Button label='Selected' customClass={styles.button} iconLeft={faCheck} variant='primary' size='sm' onClick={unselectServer} />
                                        ) : (
                                            <Button label='Select' customClass={styles.button} iconLeft={faCheck} variant='secondary' size='sm' onClick={() => selectServer(server.id)} />
                                        )}
                                        {server?.ownerID === client?.user?.id ? (
                                            <Button label='Delete' customClass={styles.button} iconLeft={faTrash} variant='secondary' size='sm' onClick={() => deleteServer(server)} />
                                        ) : (
                                            <Button label='Leave' customClass={styles.button} iconLeft={faAnglesLeft} variant='secondary' size='sm' onClick={() => leaveServer(server)} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div> : <Alert variant='warning' description={<p>This content could not be accessed, perhaps you're missing permissions.</p>} />}
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

                    {/* Warning */}
                    <Alert style={{ marginBottom: '.5rem' }} variant='info' description={<p>Do not excessively use the <b>Prune</b> option.</p>} />
                    
                    {/* Server */}
                    <div className={`${styles.title} ${styles.topLabel}`} style={{ marginBottom: '.5rem' }}>
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
                                    label='Prune'
                                    customClass={styles.button}
                                    onClick={() => { setServerPruneValue('7'); setServerPruneReasonValue(''); setServerPruneModalActive(true) }}
                                />
                                <Button
                                    size='sm'
                                    label='Icon'
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

                    <div className={styles.server}>
                        <Image className={styles.icon} src={selectedServer?.icon ? selectedServer.iconURL : 'https://cdn.discordapp.com/embed/avatars/1.png'} width={50} height={50} />
                        <div style={{ marginLeft: '1rem' }}>
                            <h2 className={styles.name}>{selectedServer?.name}</h2>
                            <p className={styles.id}>Id: <b>{selectedServer?.id}</b></p>
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
                        <Input value={serverUnbanReasonValue} onInput={(e) => setServerUnbanReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} />
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
                        <Input value={serverInviteDeleteReasonValue} onInput={(e) => setServerInviteDeleteReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} />
                    </Modal>

                    {/* Bans */}
                    <div className={`${styles.title} ${styles.topLabel}`} style={{ marginBottom: '.5rem', marginTop: '1rem' }}>
                        <div className={styles.mobile}>
                            <h4>Bans</h4>
                            <div className={styles.filter}>
                                <Input
                                    label=''
                                    customClass={styles.filterInput}
                                    placeholder='Filter'
                                    value={bansFilterText}
                                    onInput={(e) => setBansFilterText(e.target.value)}
                                />
                                <select
                                    className={`${styles.select} ${styles.filterSelect}`}
                                    value={bansFilterType}
                                    onChange={(e) => setBansFilterType(e.target.value)}
                                >
                                    <option className={styles.option} value={'username'}>Username</option>
                                    <option className={styles.option} value={'id'}>Id</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.buttons}>
                                <Button
                                    size='sm'
                                    label='Refresh'
                                    customClass={styles.button}
                                    onClick={serverBansRefresh}
                                />
                                {selectedServerInfo?.bans && (
                                    <>
                                        <Button
                                            size='sm'
                                            label='Unban'
                                            customClass={styles.button}
                                            onClick={() => { setServerUnbanReasonValue(''); setServerUnbanModalActive(true) }}
                                        />
                                        <div className={styles.filter}>
                                            <Input
                                                label=''
                                                customClass={styles.filterInput}
                                                placeholder='Filter'
                                                value={bansFilterText}
                                                onInput={(e) => setBansFilterText(e.target.value)}
                                            />
                                            <select
                                                className={`${styles.select} ${styles.filterSelect}`}
                                                value={bansFilterType}
                                                onChange={(e) => setBansFilterType(e.target.value)}
                                            >
                                                <option className={styles.option} value={'username'}>Username</option>
                                                <option className={styles.option} value={'id'}>Id</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                        </div>
                    </div>

                    {selectedServerInfo?.bans ? <div className={styles.table}>
                        <Table
                            theme='dark'
                            columns={dimensions.width > 1000
                                ? banColumns
                                : banColumns.filter((c) => ['User', 'Id'].includes(c.name))}
                            data={selectedServerInfo?.bans
                                ?.filter((ban) => ban.user[bansFilterType] && ban.user[bansFilterType].toLowerCase().includes(bansFilterText.toLowerCase()))
                                ?.map((ban) => ({
                                    id: ban.user.id,
                                    user: ban.user.discriminator !== '0' ? `${ban.user.username}#${ban.user.discriminator}` : ban.user.username,
                                    reason: ban.reason ? ban.reason : 'None',
                                    bot: ban.user.bot ? 'Yes' : 'No'
                                }))}
                            dense
                            selectableRowsHighlight
                            selectableRows
                            pagination
                            paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                            onSelectedRowsChange={handleBanUserSelected}
                        />
                    </div> : <Alert variant='warning' description={<p>This content could not be accessed, perhaps you're missing permissions.</p>} />}

                    {/* Invites */}
                    <div className={`${styles.title} ${styles.topLabel}`} style={{ marginBottom: '.5rem', marginTop: '1rem' }}>
                        <div className={styles.mobile}>
                            <h4>Invites</h4>
                            <div className={styles.filter}>
                                <Input
                                    label=''
                                    customClass={styles.filterInput}
                                    placeholder='Filter'
                                    value={invitesFilterText}
                                    onInput={(e) => setInvitesFilterText(e.target.value)}
                                />
                                <select
                                    className={`${styles.select} ${styles.filterSelect}`}
                                    value={invitesFilterType}
                                    onChange={(e) => setInvitesFilterType(e.target.value)}
                                >
                                    <option className={styles.option} value={'code'}>Code</option>
                                    <option className={styles.option} value={'name'}>Channel</option>
                                    <option className={styles.option} value={'username'}>Creator</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.buttons}>
                            <Button
                                size='sm'
                                label='Refresh'
                                customClass={styles.button}
                                onClick={serverInvitesRefresh}
                            />
                            {selectedServerInfo?.invites && (
                                <>
                                    <Button
                                        size='sm'
                                        label='Delete'
                                        customClass={styles.button}
                                        onClick={() => { setServerInviteDeleteReasonValue(''); setServerInviteDeleteModalActive(true) }}
                                    />
                                    <div className={styles.filter}>
                                        <Input
                                            label=''
                                            customClass={styles.filterInput}
                                            placeholder='Filter'
                                            value={invitesFilterText}
                                            onInput={(e) => setInvitesFilterText(e.target.value)}
                                        />
                                        <select
                                            className={`${styles.select} ${styles.filterSelect}`}
                                            value={invitesFilterType}
                                            onChange={(e) => setInvitesFilterType(e.target.value)}
                                        >
                                            <option className={styles.option} value={'code'}>Code</option>
                                            <option className={styles.option} value={'name'}>Channel</option>
                                            <option className={styles.option} value={'username'}>Creator</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {selectedServerInfo?.invites ? <div className={styles.table}>
                        <Table
                            theme='dark'
                            columns={dimensions.width > 1000
                                ? inviteColumns
                                : inviteColumns.filter((c) => ['Code', 'Channel', 'Creator'].includes(c.name))}
                            data={selectedServerInfo?.invites
                                ?.filter((invite) => {
                                    if (invite[invitesFilterType]) return invite[invitesFilterType].toLowerCase().includes(invitesFilterText.toLowerCase());
                                    if (invite.channel[invitesFilterType]) return invite.channel[invitesFilterType].toLowerCase().includes(invitesFilterText.toLowerCase());
                                    if (invite.inviter[invitesFilterType]) return invite.inviter[invitesFilterType].toLowerCase().includes(invitesFilterText.toLowerCase());
                                })
                                ?.map((invite) => ({
                                    id: invite.code,
                                    channel: invite.channel.name,
                                    created: moment(invite.createdAt).format('YYYY-MM-DD'),
                                    creator: invite.inviter?.discriminator !== '0' ? `${invite.inviter?.username}#${invite.inviter?.discriminator}` : invite.inviter?.username,
                                    uses: invite.uses
                                }))}
                            dense
                            selectableRowsHighlight
                            selectableRows
                            pagination
                            paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                            onSelectedRowsChange={handleInviteSelected}
                        />
                    </div> : <Alert variant='warning' description={<p>This content could not be accessed, perhaps you're missing permissions.</p>} />}

                    {/* Templates */}
                    <div className={`${styles.title} ${styles.topLabel}`} style={{ marginBottom: '.5rem', marginTop: '1rem' }}>
                        <div className={styles.mobile}>
                            <h4>Templates</h4>
                            <div className={styles.filter}>
                                <Input
                                    label=''
                                    customClass={styles.filterInput}
                                    placeholder='Filter'
                                    value={templatesFilterText}
                                    onInput={(e) => setTemplatesFilterText(e.target.value)}
                                />
                                <select
                                    className={`${styles.select} ${styles.filterSelect}`}
                                    value={templatesFilterType}
                                    onChange={(e) => setTemplatesFilterType(e.target.value)}
                                >
                                    <option className={styles.option} value={'code'}>Code</option>
                                    <option className={styles.option} value={'name'}>Name</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.buttons}>
                            <Button
                                size='sm'
                                label='Refresh'
                                customClass={styles.button}
                                onClick={serverTemplatesRefresh}
                            />
                            {selectedServerInfo?.templates && (
                                <>
                                    <Button
                                        size='sm'
                                        label='Sync'
                                        customClass={styles.button}
                                        onClick={serverTemplatesSync}
                                    />
                                    <Button
                                        size='sm'
                                        label='Create'
                                        customClass={styles.button}
                                        onClick={serverTemplatesCreate}
                                    />
                                    <Button
                                        size='sm'
                                        label='Delete'
                                        customClass={styles.button}
                                        onClick={serverTemplatesDelete}
                                    />
                                    <div className={styles.filter}>
                                        <Input
                                            label=''
                                            customClass={styles.filterInput}
                                            placeholder='Filter'
                                            value={templatesFilterText}
                                            onInput={(e) => setTemplatesFilterText(e.target.value)}
                                        />
                                        <select
                                            className={`${styles.select} ${styles.filterSelect}`}
                                            value={templatesFilterType}
                                            onChange={(e) => setTemplatesFilterType(e.target.value)}
                                        >
                                            <option className={styles.option} value={'code'}>Code</option>
                                            <option className={styles.option} value={'name'}>Name</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {selectedServerInfo?.templates ? <div className={styles.table}>
                        <Table
                            theme='dark'
                            columns={dimensions.width > 1000
                                ? templateColumns
                                : templateColumns.filter((c) => ['Code', 'Name'].includes(c.name))}
                            data={selectedServerInfo?.templates
                                ?.filter((template) => template[templatesFilterType] && template[templatesFilterType].toLowerCase().includes(templatesFilterText.toLowerCase()))
                                ?.map((template) => ({
                                    id: template.code,
                                    name: template.name,
                                    uses: template.usageCount,
                                    created: moment(template.createdAt).format('YYYY-MM-DD'),
                                    creator: template.creator?.discriminator !== '0' ? `${template.creator?.username}#${template.creator?.discriminator}` : template.creator?.username,
                                    synced: template.isDirty ? 'No' : 'Yes'
                                }))}
                            dense
                            selectableRowsHighlight
                            selectableRows
                            pagination
                            paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                            onSelectedRowsChange={handleTemplateSelected}
                        />
                    </div> : <Alert variant='warning' description={<p>This content could not be accessed, perhaps you're missing permissions.</p>} />}
                </>
            ) : (selectingServer ? <Alert variant='info' description={<p>Selecting server...</p>} /> : <Alert variant='warning' description={<p>No server is currently selected.</p>} />)
        },
        {
            label: 'Members',
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
                        <div className={styles.title} style={{ marginBottom: '.5rem' }}>
                            <h4>Roles</h4>
                            <div className={styles.buttons}>
                                <Button
                                    size='sm'
                                    label='Refresh'
                                    customClass={styles.button}
                                    onClick={serverRolesRefresh}
                                />
                                {selectedServerInfo?.roles && (
                                    <div className={styles.filter}>
                                        <Input
                                            label=''
                                            customClass={styles.filterInput}
                                            placeholder='Filter'
                                            value={removeRolesFilterText}
                                            onInput={(e) => setRemoveRolesFilterText(e.target.value)}
                                        />
                                        <select
                                            className={`${styles.select} ${styles.filterSelect}`}
                                            value={removeRolesFilterType}
                                            onChange={(e) => setRemoveRolesFilterType(e.target.value)}
                                        >
                                            <option className={styles.option} value={'name'}>Name</option>
                                            <option className={styles.option} value={'id'}>Id</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedServerInfo?.roles ? <div className={styles.table} style={{ width: dimensions.width > 1000 ? '50rem' : 'fit-content' }}>
                            <Table
                                theme='dark'
                                columns={dimensions.width > 1000
                                    ? roleColumns
                                    : roleColumns.filter((c) => ['Name', 'Id'].includes(c.name))}
                                data={selectedServerInfo?.roles
                                    ?.filter((role) => role.id !== selectedServer?.id)
                                    ?.filter((role) => role[removeRolesFilterType] && role[removeRolesFilterType].toLowerCase().includes(removeRolesFilterText.toLowerCase()))
                                    ?.map((role) => ({
                                        id: role.id,
                                        name: role.name,
                                        created: moment(role.createdAt).format('YYYY-MM-DD'),
                                        managed: role.managed ? 'Yes' : 'No'
                                    }))}
                                dense
                                selectableRowsHighlight
                                selectableRows
                                pagination
                                paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                                onSelectedRowsChange={handleRemoveRoleSelected}
                            />
                        </div> : <Alert variant='warning' description={<p>This content could not be accessed, perhaps you're missing permissions.</p>} />}
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
                        <div className={styles.title} style={{ marginBottom: '.5rem' }}>
                            <h4>Roles</h4>
                            <div className={styles.buttons}>
                                <Button
                                    size='sm'
                                    label='Refresh'
                                    customClass={styles.button}
                                    onClick={serverRolesRefresh}
                                />
                                {selectedServerInfo?.roles && (
                                    <div className={styles.filter}>
                                        <Input
                                            label=''
                                            customClass={styles.filterInput}
                                            placeholder='Filter'
                                            value={addRolesFilterText}
                                            onInput={(e) => setAddRolesFilterText(e.target.value)}
                                        />
                                        <select
                                            className={`${styles.select} ${styles.filterSelect}`}
                                            value={addRolesFilterType}
                                            onChange={(e) => setAddRolesFilterType(e.target.value)}
                                        >
                                            <option className={styles.option} value={'name'}>Name</option>
                                            <option className={styles.option} value={'id'}>Id</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedServerInfo?.roles ? <div className={styles.table} style={{ width: dimensions.width > 1000 ? '50rem' : 'fit-content' }}>
                            <Table
                                theme='dark'
                                columns={dimensions.width > 1000
                                    ? roleColumns
                                    : roleColumns.filter((c) => ['Name', 'Id'].includes(c.name))}
                                data={selectedServerInfo?.roles
                                    ?.filter((role) => role.id !== selectedServer?.id)
                                    ?.filter((role) => role[addRolesFilterType] && role[addRolesFilterType].toLowerCase().includes(addRolesFilterText.toLowerCase()))
                                    ?.map((role) => ({
                                        id: role.id,
                                        name: role.name,
                                        created: moment(role.createdAt).format('YYYY-MM-DD'),
                                        managed: role.managed ? 'Yes' : 'No'
                                    }))}
                                dense
                                selectableRowsHighlight
                                selectableRows
                                pagination
                                paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                                onSelectedRowsChange={handleAddRoleSelected}
                            />
                        </div> : <Alert variant='warning' description={<p>This content could not be accessed, perhaps you're missing permissions.</p>} />}
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
                        <Input value={userKickReasonValue} onInput={(e) => setUserKickReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} />
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

                    {/* Warning */}
                    {!client?.bot && <Alert style={{ marginBottom: '.5rem' }} variant='info' description={<p>You might be terminated for using the <b>DM</b> option on an user account.</p>} />}

                    {/* Members */}
                    <div className={`${styles.title} ${styles.topLabel}`} style={{ marginBottom: '.5rem' }}>
                        <div className={styles.mobile}>
                            <h4>Members</h4>
                            <div className={styles.filter}>
                                <Input
                                    label=''
                                    customClass={styles.filterInput}
                                    placeholder='Filter'
                                    value={usersFilterText}
                                    onInput={(e) => setUsersFilterText(e.target.value)}
                                />
                                <select
                                    className={`${styles.select} ${styles.filterSelect}`}
                                    value={usersFilterType}
                                    onChange={(e) => setUsersFilterType(e.target.value)}
                                >
                                    <option className={styles.option} value={'username'}>Username</option>
                                    <option className={styles.option} value={'nick'}>Nickname</option>
                                    <option className={styles.option} value={'id'}>Id</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.buttons}>
                            <Button
                                size='sm'
                                label='Refresh'
                                customClass={styles.button}
                                onClick={serverUsersRefresh}
                            />
                            {selectedServerInfo?.members && (
                                <>
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
                                        label='+ Role'
                                        customClass={styles.button}
                                        onClick={() => { setUserAddRoleReasonValue(''); setUserAddRoleModalActive(true) }}
                                    />
                                    <Button
                                        size='sm'
                                        label='- Role'
                                        customClass={styles.button}
                                        onClick={() => { setUserRemoveRoleReasonValue(''); setUserRemoveRoleModalActive(true) }}
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
                                    <div className={styles.filter}>
                                        <Input
                                            label=''
                                            customClass={styles.filterInput}
                                            placeholder='Filter'
                                            value={usersFilterText}
                                            onInput={(e) => setUsersFilterText(e.target.value)}
                                        />
                                        <select
                                            className={`${styles.select} ${styles.filterSelect}`}
                                            value={usersFilterType}
                                            onChange={(e) => setUsersFilterType(e.target.value)}
                                        >
                                            <option className={styles.option} value={'username'}>Username</option>
                                            <option className={styles.option} value={'nick'}>Nickname</option>
                                            <option className={styles.option} value={'id'}>Id</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {selectedServerInfo?.members ? <div className={styles.table}>
                        <Table
                            theme='dark'
                            columns={dimensions.width > 1000
                                ? userColumns
                                : userColumns.filter((c) => ['Username', 'Id'].includes(c.name))}
                            data={selectedServerInfo?.members
                                ?.filter((member) => member.id !== client.user.id)
                                ?.filter((member) => member[usersFilterType] && member[usersFilterType].toLowerCase().includes(usersFilterText.toLowerCase()))
                                ?.map((member) => ({
                                    id: member.id,
                                    user: member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username,
                                    nick: member.nick ? member.nick : 'None',
                                    joined: moment(member.joinedAt).format('YYYY-MM-DD HH:mm:ss'),
                                    bot: member.bot ? 'Yes' : 'No'
                                }))}
                            dense
                            selectableRowsHighlight
                            selectableRows
                            pagination
                            paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                            onSelectedRowsChange={handleUserSelected}
                        />
                    </div> : <Alert variant='warning' description={<p>This content could not be accessed, perhaps you're missing permissions.</p>} />}
                </>
            ) : (selectingServer ? <Alert variant='info' description={<p>Selecting server...</p>} /> : <Alert variant='warning' description={<p>No server is currently selected.</p>} />)
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
                            <input className={styles.checkbox} type='checkbox' checked={channelCreateInviteTemporaryValue} onChange={(e) => setChannelCreateInviteTemporaryValue(e.target.checked)} />
                            <h3 className={styles.label}>Temporary membership (optional)</h3>
                        </div>
                        <div style={{ marginTop: '1rem' }} className={styles.checkboxContainer}>
                            <input className={styles.checkbox} type='checkbox' checked={channelCreateInviteUniqueValue} onChange={(e) => setChannelCreateInviteUniqueValue(e.target.checked)} />
                            <h3 className={styles.label}>Unique invite (optional)</h3>
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
                            <input className={styles.checkbox} type='checkbox' checked={channelCreateNSFWValue} onChange={(e) => setChannelCreateNSFWValue(e.target.checked)} />
                            <h3 className={styles.label}>NSFW (optional)</h3>
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
                        <Input value={channelDeleteReasonValue} onInput={(e) => setChannelDeleteReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} />
                    </Modal>

                    {/* Channels */}
                    <div className={`${styles.title} ${styles.topLabel}`} style={{ marginBottom: '.5rem' }}>
                        <div className={styles.mobile}>
                            <h4>Channels</h4>
                            <div className={styles.filter}>
                                <Input
                                    label=''
                                    customClass={styles.filterInput}
                                    placeholder='Filter'
                                    value={channelsFilterText}
                                    onInput={(e) => setChannelsFilterText(e.target.value)}
                                />
                                <select
                                    className={`${styles.select} ${styles.filterSelect}`}
                                    value={channelsFilterType}
                                    onChange={(e) => setChannelsFilterType(e.target.value)}
                                >
                                    <option className={styles.option} value={'name'}>Name</option>
                                    <option className={styles.option} value={'id'}>Id</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.buttons}>
                            <Button
                                size='sm'
                                label='Refresh'
                                customClass={styles.button}
                                onClick={serverChannelsRefresh}
                            />
                            {selectedServerInfo?.channels && (
                                <>
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
                                    <div className={styles.filter}>
                                        <Input
                                            label=''
                                            customClass={styles.filterInput}
                                            placeholder='Filter'
                                            value={channelsFilterText}
                                            onInput={(e) => setChannelsFilterText(e.target.value)}
                                        />
                                        <select
                                            className={`${styles.select} ${styles.filterSelect}`}
                                            value={channelsFilterType}
                                            onChange={(e) => setChannelsFilterType(e.target.value)}
                                        >
                                            <option className={styles.option} value={'name'}>Name</option>
                                            <option className={styles.option} value={'id'}>Id</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {selectedServerInfo?.channels ? <div className={styles.table}>
                        <Table
                            theme='dark'
                            columns={dimensions.width > 1000
                                ? channelColumns
                                : channelColumns.filter((c) => ['Name', 'Id'].includes(c.name))}
                            data={selectedServerInfo?.channels
                                ?.filter((channel) => channel[channelsFilterType] && channel[channelsFilterType].toLowerCase().includes(channelsFilterText.toLowerCase()))
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
                                    })(),
                                    created: moment(channel.createdAt).format('YYYY-MM-DD')
                                }))}
                            dense
                            selectableRowsHighlight
                            selectableRows
                            pagination
                            paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                            onSelectedRowsChange={handleChannelSelected}
                        />
                    </div> : <Alert variant='warning' description={<p>This content could not be accessed, perhaps you're missing permissions.</p>} />}
                </>
            ) : (selectingServer ? <Alert variant='info' description={<p>Selecting server...</p>} /> : <Alert variant='warning' description={<p>No server is currently selected.</p>} />)
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
                        <div className={styles.title} style={{ marginBottom: '.5rem' }}>
                            <h4>Members</h4>
                            <div className={styles.buttons}>
                                <Button
                                    size='sm'
                                    label='Refresh'
                                    customClass={styles.button}
                                    onClick={serverUsersRefresh}
                                />
                                {selectedServerInfo?.members && (
                                    <div className={styles.filter}>
                                        <Input
                                            label=''
                                            customClass={styles.filterInput}
                                            placeholder='Filter'
                                            value={addMembersFilterText}
                                            onInput={(e) => setAddMembersFilterText(e.target.value)}
                                        />
                                        <select
                                            className={`${styles.select} ${styles.filterSelect}`}
                                            value={addMembersFilterType}
                                            onChange={(e) => setAddMembersFilterType(e.target.value)}
                                        >
                                            <option className={styles.option} value={'username'}>Username</option>
                                            <option className={styles.option} value={'nick'}>Nickname</option>
                                            <option className={styles.option} value={'id'}>Id</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {selectedServerInfo?.members ? <div className={styles.table} style={{ width: dimensions.width > 1000 ? '50rem' : 'fit-content' }}>
                            <Table
                                theme='dark'
                                columns={dimensions.width > 1000
                                    ? userColumns
                                    : userColumns.filter((c) => ['Username', 'Id'].includes(c.name))}
                                data={selectedServerInfo?.members
                                    ?.filter((member) => member.id !== client.user.id)
                                    ?.filter((member) => member[addMembersFilterType] && member[addMembersFilterType].toLowerCase().includes(addMembersFilterText.toLowerCase()))
                                    ?.map((member) => ({
                                        id: member.id,
                                        user: member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username,
                                        nick: member.nick ? member.nick : 'None',
                                        joined: moment(member.joinedAt).format('YYYY-MM-DD HH:mm:ss'),
                                        bot: member.bot ? 'Yes' : 'No'
                                    }))}
                                dense
                                selectableRowsHighlight
                                selectableRows
                                pagination
                                paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                                onSelectedRowsChange={handleAddMemberSelected}
                            />
                        </div> : <Alert variant='warning' description={<p>This content could not be accessed, perhaps you're missing permissions.</p>} />}
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
                        <div className={styles.title} style={{ marginBottom: '.5rem' }}>
                            <h4>Members</h4>
                            <div className={styles.buttons}>
                                <Button
                                    size='sm'
                                    label='Refresh'
                                    customClass={styles.button}
                                    onClick={serverUsersRefresh}
                                />
                                {selectedServerInfo?.members && (
                                    <div className={styles.filter}>
                                        <Input
                                            label=''
                                            customClass={styles.filterInput}
                                            placeholder='Filter'
                                            value={removeMembersFilterText}
                                            onInput={(e) => setRemoveMembersFilterText(e.target.value)}
                                        />
                                        <select
                                            className={`${styles.select} ${styles.filterSelect}`}
                                            value={removeMembersFilterType}
                                            onChange={(e) => setRemoveMembersFilterType(e.target.value)}
                                        >
                                            <option className={styles.option} value={'username'}>Username</option>
                                            <option className={styles.option} value={'nick'}>Nickname</option>
                                            <option className={styles.option} value={'id'}>Id</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                        {selectedServerInfo?.members ? <div className={styles.table} style={{ width: dimensions.width > 1000 ? '50rem' : 'fit-content' }}>
                            <Table
                                theme='dark'
                                columns={dimensions.width > 1000
                                    ? userColumns
                                    : userColumns.filter((c) => ['Username', 'Id'].includes(c.name))}
                                data={selectedServerInfo?.members
                                    ?.filter((member) => member.id !== client.user.id)
                                    ?.filter((member) => member[removeMembersFilterType] && member[removeMembersFilterType].toLowerCase().includes(removeMembersFilterText.toLowerCase()))
                                    ?.map((member) => ({
                                        id: member.id,
                                        user: member.discriminator !== '0' ? `${member.username}#${member.discriminator}` : member.username,
                                        nick: member.nick ? member.nick : 'None',
                                        joined: moment(member.joinedAt).format('YYYY-MM-DD HH:mm:ss'),
                                        bot: member.bot ? 'Yes' : 'No'
                                    }))}
                                dense
                                selectableRowsHighlight
                                selectableRows
                                pagination
                                paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                                onSelectedRowsChange={handleRemoveMemberSelected}
                            />
                        </div> : <Alert variant='warning' description={<p>This content could not be accessed, perhaps you're missing permissions.</p>} />}
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
                            <input className={styles.checkbox} type='checkbox' checked={roleCreateHoistValue} onChange={(e) => setRoleCreateHoistValue(e.target.checked)} />
                            <h3 className={styles.label}>Hoist (optional)</h3>
                        </div>
                        <div style={{ marginTop: '1rem' }} className={styles.checkboxContainer}>
                            <input className={styles.checkbox} type='checkbox' checked={roleCreateMentionableValue} onChange={(e) => setRoleCreateMentionableValue(e.target.checked)} />
                            <h3 className={styles.label}>Mentionable (optional)</h3>
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
                        <Input value={roleDeleteReasonValue} onInput={(e) => setRoleDeleteReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} />
                    </Modal>

                    {/* Roles */}
                    <div className={`${styles.title} ${styles.topLabel}`} style={{ marginBottom: '.5rem' }}>
                        <div className={styles.mobile}>
                            <h4>Roles</h4>
                            <div className={styles.filter}>
                                <Input
                                    label=''
                                    customClass={styles.filterInput}
                                    placeholder='Filter'
                                    value={rolesFilterText}
                                    onInput={(e) => setRolesFilterText(e.target.value)}
                                />
                                <select
                                    className={`${styles.select} ${styles.filterSelect}`}
                                    value={rolesFilterType}
                                    onChange={(e) => setRolesFilterType(e.target.value)}
                                >
                                    <option className={styles.option} value={'name'}>Name</option>
                                    <option className={styles.option} value={'id'}>Id</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.buttons}>
                            <Button
                                size='sm'
                                label='Refresh'
                                customClass={styles.button}
                                onClick={serverRolesRefresh}
                            />
                            {selectedServerInfo?.roles && (
                                <>
                                    <Button
                                        size='sm'
                                        label='+ Member'
                                        customClass={styles.button}
                                        onClick={() => { setRoleAddMemberReasonValue(''); setRoleAddMemberModalActive(true) }}
                                    />
                                    <Button
                                        size='sm'
                                        label='- Member'
                                        customClass={styles.button}
                                        onClick={() => { setRoleRemoveMemberReasonValue(''); setRoleRemoveMemberModalActive(true) }}
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
                                    <div className={styles.filter}>
                                        <Input
                                            label=''
                                            customClass={styles.filterInput}
                                            placeholder='Filter'
                                            value={rolesFilterText}
                                            onInput={(e) => setRolesFilterText(e.target.value)}
                                        />
                                        <select
                                            className={`${styles.select} ${styles.filterSelect}`}
                                            value={rolesFilterType}
                                            onChange={(e) => setRolesFilterType(e.target.value)}
                                        >
                                            <option className={styles.option} value={'name'}>Name</option>
                                            <option className={styles.option} value={'id'}>Id</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {selectedServerInfo?.roles ? <div className={styles.table}>
                        <Table
                            theme='dark'
                            columns={dimensions.width > 1000
                                ? roleColumns
                                : roleColumns.filter((c) => ['Name', 'Id'].includes(c.name))}
                            data={selectedServerInfo?.roles
                                ?.filter((role) => role.id !== selectedServer?.id)
                                ?.filter((role) => role[rolesFilterType] && role[rolesFilterType].toLowerCase().includes(rolesFilterText.toLowerCase()))
                                ?.map((role) => ({
                                    id: role.id,
                                    name: role.name,
                                    created: moment(role.createdAt).format('YYYY-MM-DD'),
                                    managed: role.managed ? 'Yes' : 'No'
                                }))}
                            dense
                            selectableRowsHighlight
                            selectableRows
                            pagination
                            paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                            onSelectedRowsChange={handleRoleSelected}
                        />
                    </div> : <Alert variant='warning' description={<p>This content could not be accessed, perhaps you're missing permissions.</p>} />}
                </>
            ) : (selectingServer ? <Alert variant='info' description={<p>Selecting server...</p>} /> : <Alert variant='warning' description={<p>No server is currently selected.</p>} />)
        },
        {
            label: 'Emojis',
            icon: faIcons,
            content: selectedServer ? (
                <>
                    {/* Rename Modal */}
                    <Modal
                        active={emojiRenameModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={emojiRename} />
                                <Button label='Cancel' size='md' onClick={() => { setEmojiRenameModalActive(false) }} />
                            </>
                        }
                    >
                        <Input value={emojiRenameValue} onInput={(e) => setEmojiRenameValue(e.target.value)} label='Name' customClass={styles.input} />
                        <div style={{ marginTop: '1rem' }}><Input value={emojiRenameReasonValue} onInput={(e) => setEmojiRenameReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Create Modal */}
                    <Modal
                        active={emojiCreateModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={emojiCreate} />
                                <Button label='Cancel' size='md' onClick={() => { setEmojiCreateModalActive(false) }} />
                            </>
                        }
                    >
                        <Input label='Name' value={emojiCreateNameValue} onInput={(e) => setEmojiCreateNameValue(e.target.value)} />
                        <div style={{ marginTop: '1rem'}}><Input label='Amount' value={emojiCreateAmountValue} onInput={(e) => setEmojiCreateAmountValue(e.target.value)} /></div>
                        <div style={{ marginTop: '1rem' }}><Input value={emojiCreateReasonValue} onInput={(e) => setEmojiCreateReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Delete Modal */}
                    <Modal
                        active={emojiDeleteModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={emojiDelete} />
                                <Button label='Cancel' size='md' onClick={() => { setEmojiDeleteModalActive(false) }} />
                            </>
                        }
                    >
                        <Input value={emojiDeleteReasonValue} onInput={(e) => setEmojiDeleteReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} />
                    </Modal>

                    {/* Emojis */}
                    <div className={`${styles.title} ${styles.topLabel}`} style={{ marginBottom: '.5rem' }}>
                        <div className={styles.mobile}>
                            <h4>Emojis</h4>
                            <div className={styles.filter}>
                                <Input
                                    label=''
                                    customClass={styles.filterInput}
                                    placeholder='Filter'
                                    value={emojisFilterText}
                                    onInput={(e) => setEmojisFilterText(e.target.value)}
                                />
                                <select
                                    className={`${styles.select} ${styles.filterSelect}`}
                                    value={emojisFilterType}
                                    onChange={(e) => setEmojisFilterType(e.target.value)}
                                >
                                    <option className={styles.option} value={'name'}>Name</option>
                                    <option className={styles.option} value={'id'}>Id</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.buttons}>
                            <Button
                                size='sm'
                                label='Refresh'
                                customClass={styles.button}
                                onClick={serverEmojisRefresh}
                            />
                            {selectedServerInfo?.emojis && (
                                <>
                                    <Button
                                        size='sm'
                                        label='Rename'
                                        customClass={styles.button}
                                        onClick={() => { setEmojiRenameValue(''); setEmojiRenameReasonValue(''); setEmojiRenameModalActive(true) }}
                                    />
                                    <Button
                                        size='sm'
                                        label='Create'
                                        customClass={styles.button}
                                        onClick={() => { setEmojiCreateNameValue(''); setEmojiCreateAmountValue(1); setEmojiCreateReasonValue(''); setEmojiCreateModalActive(true) }}
                                    />
                                    <Button
                                        size='sm'
                                        label='Delete'
                                        customClass={styles.button}
                                        onClick={() => { setEmojiDeleteReasonValue(''); setEmojiDeleteModalActive(true) }}
                                    />
                                    <div className={styles.filter}>
                                        <Input
                                            label=''
                                            customClass={styles.filterInput}
                                            placeholder='Filter'
                                            value={emojisFilterText}
                                            onInput={(e) => setEmojisFilterText(e.target.value)}
                                        />
                                        <select
                                            className={`${styles.select} ${styles.filterSelect}`}
                                            value={emojisFilterType}
                                            onChange={(e) => setEmojisFilterType(e.target.value)}
                                        >
                                            <option className={styles.option} value={'name'}>Name</option>
                                            <option className={styles.option} value={'id'}>Id</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {selectedServerInfo?.emojis ? <div className={styles.table}>
                        <Table
                            theme='dark'
                            columns={dimensions.width > 1000
                                ? emojiColumns
                                : emojiColumns.filter((c) => ['Name', 'Id'].includes(c.name))}
                            data={selectedServerInfo?.emojis
                                ?.filter((emoji) => emoji[emojisFilterType] && emoji[emojisFilterType].toLowerCase().includes(emojisFilterText.toLowerCase()))
                                ?.map((emoji) => ({
                                    id: emoji.id,
                                    name: emoji.name,
                                    created: moment(emoji.createdAt).format('YYYY-MM-DD'),
                                    available: emoji.available ? 'Yes' : 'No'
                                }))}
                            dense
                            selectableRowsHighlight
                            selectableRows
                            pagination
                            paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                            onSelectedRowsChange={handleEmojiSelected}
                        />
                    </div> : <Alert variant='warning' description={<p>This content could not be accessed, perhaps you're missing permissions.</p>} />}
                </>
            ) : (selectingServer ? <Alert variant='info' description={<p>Selecting server...</p>} /> : <Alert variant='warning' description={<p>No server is currently selected.</p>} />)
        },
        {
            label: 'Stickers',
            icon: faNoteSticky,
            content: selectedServer ? (
                <>
                    {/* Rename Modal */}
                    <Modal
                        active={stickerRenameModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={stickerRename} />
                                <Button label='Cancel' size='md' onClick={() => { setStickerRenameModalActive(false) }} />
                            </>
                        }
                    >
                        <Input value={stickerRenameValue} onInput={(e) => setStickerRenameValue(e.target.value)} label='Name' customClass={styles.input} />
                        <div style={{ marginTop: '1rem' }}><Input value={stickerRenameReasonValue} onInput={(e) => setStickerRenameReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Create Modal */}
                    <Modal
                        active={stickerCreateModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={stickerCreate} />
                                <Button label='Cancel' size='md' onClick={() => { setStickerCreateModalActive(false) }} />
                            </>
                        }
                    >
                        <Input label='Name' value={stickerCreateNameValue} onInput={(e) => setStickerCreateNameValue(e.target.value)} />
                        <div style={{ marginTop: '1rem'}}><Input label='Emoji (e.g. 🔥)' value={stickerCreateEmojiValue} onInput={(e) => setStickerCreateEmojiValue(e.target.value)} /></div>
                        <div style={{ marginTop: '1rem'}}><Input label='Amount' value={stickerCreateAmountValue} onInput={(e) => setStickerCreateAmountValue(e.target.value)} /></div>
                        <div style={{ marginTop: '1rem' }}><Input value={stickerCreateReasonValue} onInput={(e) => setStickerCreateReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} /></div>
                    </Modal>

                    {/* Delete Modal */}
                    <Modal
                        active={stickerDeleteModalActive}
                        footer={
                            <>
                                <Button label='Confirm' variant='primary' size='md' onClick={stickerDelete} />
                                <Button label='Cancel' size='md' onClick={() => { setStickerDeleteModalActive(false) }} />
                            </>
                        }
                    >
                        <Input value={stickerDeleteReasonValue} onInput={(e) => setStickerDeleteReasonValue(e.target.value)} label='Reason (optional)' customClass={styles.input} />
                    </Modal>

                    {/* Stickers */}
                    <div className={`${styles.title} ${styles.topLabel}`} style={{ marginBottom: '.5rem' }}>
                        <div className={styles.mobile}>
                            <h4>Stickers</h4>
                            <div className={styles.filter}>
                                <Input
                                    label=''
                                    customClass={styles.filterInput}
                                    placeholder='Filter'
                                    value={stickersFilterText}
                                    onInput={(e) => setStickersFilterText(e.target.value)}
                                />
                                <select
                                    className={`${styles.select} ${styles.filterSelect}`}
                                    value={stickersFilterType}
                                    onChange={(e) => setStickersFilterType(e.target.value)}
                                >
                                    <option className={styles.option} value={'name'}>Name</option>
                                    <option className={styles.option} value={'id'}>Id</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.buttons}>
                            <Button
                                size='sm'
                                label='Refresh'
                                customClass={styles.button}
                                onClick={serverStickersRefresh}
                            />
                            {selectedServerInfo?.stickers && (
                                <>
                                    <Button
                                        size='sm'
                                        label='Rename'
                                        customClass={styles.button}
                                        onClick={() => { setStickerRenameValue(''); setStickerRenameReasonValue(''); setStickerRenameModalActive(true) }}
                                    />
                                    <Button
                                        size='sm'
                                        label='Create'
                                        customClass={styles.button}
                                        onClick={() => { setStickerCreateNameValue(''); setStickerCreateEmojiValue(''); setStickerCreateAmountValue(1); setStickerCreateReasonValue(''); setStickerCreateModalActive(true) }}
                                    />
                                    <Button
                                        size='sm'
                                        label='Delete'
                                        customClass={styles.button}
                                        onClick={() => { setStickerDeleteReasonValue(''); setStickerDeleteModalActive(true) }}
                                    />
                                    <div className={styles.filter}>
                                        <Input
                                            label=''
                                            customClass={styles.filterInput}
                                            placeholder='Filter'
                                            value={stickersFilterText}
                                            onInput={(e) => setStickersFilterText(e.target.value)}
                                        />
                                        <select
                                            className={`${styles.select} ${styles.filterSelect}`}
                                            value={stickersFilterType}
                                            onChange={(e) => setStickersFilterType(e.target.value)}
                                        >
                                            <option className={styles.option} value={'name'}>Name</option>
                                            <option className={styles.option} value={'id'}>Id</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {selectedServerInfo?.stickers ? <div className={styles.table}>
                        <Table
                            theme='dark'
                            columns={dimensions.width > 1000
                                ? stickerColumns
                                : stickerColumns.filter((c) => ['Name', 'Id'].includes(c.name))}
                            data={selectedServerInfo?.stickers
                                ?.filter((sticker) => sticker[stickersFilterType] && sticker[stickersFilterType].toLowerCase().includes(stickersFilterText.toLowerCase()))
                                ?.map((sticker) => ({
                                    id: sticker.id,
                                    name: sticker.name,
                                    created: moment(sticker.createdAt).format('YYYY-MM-DD'),
                                    available: sticker.available ? 'Yes' : 'No'
                                }))}
                            dense
                            selectableRowsHighlight
                            selectableRows
                            pagination
                            paginationComponentOptions={{ selectAllRowsItem: true, selectAllRowsItemText: 'All' }}
                            onSelectedRowsChange={handleStickerSelected}
                        />
                    </div> : <Alert variant='warning' description={<p>This content could not be accessed, perhaps you're missing permissions.</p>} />}
                </>
            ) : (selectingServer ? <Alert variant='info' description={<p>Selecting server...</p>} /> : <Alert variant='warning' description={<p>No server is currently selected.</p>} />)
        }
    ];

    return (
        <>
            {/* Content */}
            <div className={`${styles.title} ${styles.mainTitle}`}>
                <div className={styles.tabs}>
                    {tabs.map((tab) => (
                        <div key={tab.label} className={`${styles.tab} ${currentTab === tab.label.toLowerCase() && styles.active}`} onClick={() => {
                            setCurrentTab(tab.label.toLowerCase());
                            document.querySelector(`.${styles.content}`).scrollTo(0, 0);
                        }}>
                            <Icon className={styles.icon} icon={tab.icon} />
                            <p className={styles.tabLabel}>{tab.label}</p>
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
                            <h4>Logs</h4>
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
            ) : <Alert variant='warning' description={<p>No instance is currently connected.</p>} style={{ marginTop: '1rem' }} />}
        </>
    );
};