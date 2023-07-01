import styles from './bots.module.css';
import { faLink, faPlus, faServer, faTrash } from '@fortawesome/free-solid-svg-icons';

import Modal from '../components/modal';
import Input from '../components/input';
import Button from '../components/button';

import defaultAlertValues from '../lib/alert/defaultAlertValues';
import Alert from '../components/alert';

import { useState, useContext, useEffect } from 'react';
import { Context, disableElements, enableElements } from '../lib/context';
import { showAlert, resetAlert } from '../lib/alert/alert';

import { getBots, addBot, removeBot, findBot } from '../lib/store';

import Image from 'next/image';
import createClient from '../lib/discord/createClient';
import validateToken from '../lib/discord/validateToken';

export default function () {
    const _context = useContext(Context);
    const [context, setContext] = _context;

    const [token, setToken] = useState('');
    const [addBotModalActive, setAddBotModalActive] = useState(false);

    const _addBotModalAlert = useState(defaultAlertValues);
    const [addBotModalAlert] = _addBotModalAlert;

    const [botPreviewInfo, setBotPreviewInfo] = useState({ avatarURL: '', tag: '', createdAt: '' });
    const [confirmBotModalAlert, setConfirmBotModalActive] = useState(false);

    const [bots, setBots] = useState([]);
    const [botAlerts, setBotAlerts] = useState([]);

    useEffect(() => setBots(getBots()), []);

    async function checkToken () {
        disableElements(_context);
        resetAlert(_addBotModalAlert);

        const botInfo = await validateToken(token);

        if (botInfo) {
            setAddBotModalActive(false);
            setBotPreviewInfo(botInfo);
            setConfirmBotModalActive(true); 
        }
        else showAlert(_addBotModalAlert, 'danger', 'Failed', 'Invalid token provided.');

        enableElements(_context);
    };

    function _addBot () {
        disableElements(_context);

        addBot({ token, ...botPreviewInfo });
        setBots(getBots());

        setConfirmBotModalActive(false);
        enableElements(_context);
    };

    function _removeBot (id) {
        disableElements(_context);

        removeBot(id);
        setBots(getBots());

        enableElements(_context);
    };

    async function connectBot (id) {
        disableElements(_context);
        setBotAlerts((state) => ({ ...state, [id]: false }));

        const bot = findBot(id);
        const client = await createClient(bot?.token || '');

        if (bot && !client) {
            setBotAlerts((state) => ({ ...state, [id]: true }));
            setTimeout(function () {
                setBotAlerts((state) => ({ ...state, [id]: false }));
                enableElements(_context);
            }, 3000);
        }
        else {
            client.on('disconnect', function () {
                setContext((state) => ({
                    ...state,
                    sidebarDisabled: false,
                    content: 'bots',
                    bot: {
                        client: null,
                        servers: null
                    }
                }));
            });
                        
            setContext((state) => ({
                ...state,
                bot: {
                    client,
                    servers: client.guilds
                },
                sidebarDisabled: true,
                elementsDisabled: false,
                content: 'bot'
            }));
        };
    };

    return (
        <>
            {/* Add Bot Modal */}
            <Modal
                active={addBotModalActive}
                footer={
                    <>
                        <Button label='Continue' variant='primary' size='md' onClick={checkToken} />
                        <Button label='Cancel' size='md' onClick={() => setAddBotModalActive(false)} />
                    </>
                }
            >
                <Input label='Token' value={token} onInput={(e) => setToken(e.target.value)} />
                <Alert variant={addBotModalAlert.variant} description={<p>{addBotModalAlert.description}</p>} style={{ marginTop: '1rem', display: addBotModalAlert.visible ? 'flex' : 'none' }} />
            </Modal>

            {/* Confirm Bot Modal */}
            <Modal
                active={confirmBotModalAlert}
                footer={
                    <>
                        <Button label='Continue' variant='primary' size='md' onClick={_addBot} />
                        <Button label='Cancel' size='md' onClick={() => setConfirmBotModalActive(false)} />
                    </>
                }
            >
                <h3>Do you want to continue with this bot?</h3>
                <div className={styles['bot-preview']}>
                    <Image className={styles.image} src={botPreviewInfo.avatarURL || 'https://cdn.discordapp.com/embed/avatars/1.png'} width={50} height={50} />
                    <div className={styles.info}>
                        <h2 className={styles.tag}>{botPreviewInfo.tag}</h2>
                        <p className={styles.description}>
                            Created on <b>{botPreviewInfo.createdAt}</b>
                        </p>
                    </div>
                </div>
            </Modal>

            {/* Content */}
            <div className={styles.title}>
                <h3>Bots</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button
                        size='sm'
                        label='Discord Developer Portal'
                        iconLeft={faLink}
                        onClick={() => { window.open('https://discord.com/developers/applications') }}
                    />
                    <Button
                        size='sm'
                        label='Add Bot'
                        iconLeft={faPlus}
                        customClass={styles['add-bot']}
                        onClick={() => { resetAlert(_addBotModalAlert); setToken(''); setAddBotModalActive(true) }}
                    />
                </div>
            </div>

            <div className={styles.bots}>
                {bots.map((bot) => (
                    <div className={styles.bot} key={bot.id}>
                        <Image className={styles.avatar} src={bot.avatarURL} width={50} height={50} />
                        <div className={styles.info}>
                            <div className={styles.text}>
                                <h3 className={styles.tag}>{bot.tag}</h3>
                                <p className={styles.id}>Id: <b>{bot.id}</b></p>
                                <Alert variant='warning' description={(
                                    <>
                                        <p>Failed to connect to bot; possible reasons:</p>
                                        <ul>
                                            <li>Invalid token.</li>
                                            <li>Not enabled all intents.</li>
                                        </ul>
                                    </>
                                )} style={{ marginTop: '1rem', display: botAlerts[bot.id] ? 'flex' : 'none' }} />
                            </div>
                            <div className={styles.buttons}>
                                <Button label='Connect' iconLeft={faServer} variant='primary' size='sm' onClick={() => connectBot(bot.id)} />
                                <Button label='Delete' iconLeft={faTrash} customClass={styles.trashButton} size='sm' onClick={() => _removeBot(bot.id)} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};