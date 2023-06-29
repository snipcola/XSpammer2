import styles from './bots.module.css';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faServer, faTrash } from '@fortawesome/free-solid-svg-icons';

import Modal from '../components/modal';
import Input from '../components/input';
import Button from '../components/button';

import defaultAlertValues from '../lib/alert/defaultAlertValues';
import Alert from '../components/alert';

import { useState, useContext } from 'react';
import { Context, disableElements, enableElements } from '../lib/context';
import { showAlert, resetAlert } from '../lib/alert/alert';

import { getBots, addBot, removeBot, findBot } from '../lib/store';

import Image from 'next/image';
import validateToken from '../lib/discord/validateToken';

export default function ({ customClass }) {
    const _context = useContext(Context);

    const [token, setToken] = useState('');
    const [addBotModalActive, setAddBotModalActive] = useState(false);

    const _addBotModalAlert = useState(defaultAlertValues);
    const [addBotModalAlert] = _addBotModalAlert;

    const [botPreviewInfo, setBotPreviewInfo] = useState({ avatarURL: '', tag: '', createdAt: '' });
    const [confirmBotModalAlert, setConfirmBotModalActive] = useState(false);

    const [bots, setBots] = useState(getBots());
    const [botAlerts, setBotAlerts] = useState([]);

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
        setBotAlerts({ ...botAlerts, [id]: false });

        const bot = findBot(id);

        if (bot && !(await validateToken(bot.token))) {
            setBotAlerts({ ...botAlerts, [id]: true });
            setTimeout(function () {
                setBotAlerts({ ...botAlerts, [id]: false });
                enableElements(_context);
            }, 1500);
        }
        else {
            enableElements(_context);
        };
    };

    return (
        <>
            {/* Add Bot Modal */}
            <Modal
                active={addBotModalActive}
                customClass={customClass}
                footer={
                    <>
                        <Button label='Continue' variant='primary' size='md' onClick={checkToken} />
                        <Button label='Cancel' size='md' onClick={() => setAddBotModalActive(false)} />
                    </>
                }
            >
                <Input label='Token' value={token} onInput={(e) => setToken(e.target.value)} />
                <Alert variant={addBotModalAlert.variant} title={addBotModalAlert.title} description={addBotModalAlert.description} style={{ marginTop: '1rem', display: addBotModalAlert.visible ? 'flex' : 'none' }} />
            </Modal>

            {/* Confirm Bot Modal */}
            <Modal
                active={confirmBotModalAlert}
                customClass={customClass}
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
                <Button
                    label={
                        <>
                            <div className={styles['icon-container']}>
                                <Icon className={styles.icon} icon={faPlus} />
                            </div>
                            Add Bot
                        </>
                    }
                    className={styles['add-bot']}
                    onClick={() => { resetAlert(_addBotModalAlert); setToken(''); setAddBotModalActive(true); }}
                />
            </div>
            <div className={styles.bots}>
                {bots.map((bot) => (
                    <div className={styles.bot}>
                        <Image className={styles.avatar} src={bot.avatarURL} width={50} height={50} />
                        <div className={styles.info}>
                            <div className={styles.text}>
                                <h3 className={styles.tag}>{bot.tag}</h3>
                                <p className={styles.id}>Id: <b>{bot.id}</b></p>
                                <Alert variant='danger' title={'Failed to connect'} description={'Possible that token changed.'} style={{ marginTop: '1rem', display: botAlerts[bot.id] ? 'flex' : 'none' }} />
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