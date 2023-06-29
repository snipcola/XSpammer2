import styles from './bots.module.css';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import Modal from '../components/modal';
import Input from '../components/input';
import Button from '../components/button';

import defaultAlertValues from '../lib/alert/defaultAlertValues';
import Alert from '../components/alert';

import { useState, useContext } from 'react';
import { Context, disableElements, enableElements } from '../lib/context';
import { showAlert, resetAlert } from '../lib/alert/alert';

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
                        <Button label='Continue' variant='primary' size='md' />
                        <Button label='Cancel' size='md' onClick={() => setConfirmBotModalActive(false)} />
                    </>
                }
            >
                <h3>Do you want to continue with this bot?</h3>
                <div className={styles['bot-preview']}>
                    <Image className={styles.image} src={botPreviewInfo.avatarURL} width={50} height={50} />
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
        </>
    );
};