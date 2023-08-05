import styles from './instances.module.css';
import { faCheck, faClipboard, faLink, faPlus, faServer, faTrash } from '@fortawesome/free-solid-svg-icons';

import Modal from '../components/modal';
import Input from '../components/input';
import Button from '../components/button';

import defaultAlertValues from '../lib/alert/defaultAlertValues';
import Alert from '../components/alert';

import { useState, useContext, useEffect } from 'react';
import { Context, disableElements, enableElements } from '../lib/context';
import { showAlert, resetAlert } from '../lib/alert/alert';

import { getInstances, addInstance, removeInstance, findInstance } from '../lib/store';

import Image from 'next/image';
import { createClient, validateToken } from '../lib/discord';

import { clipboard } from 'electron';

export default function () {
    const _context = useContext(Context);
    const [_, setContext] = _context;

    const [token, setToken] = useState('');
    const [addInstanceModalActive, setAddInstanceModalActive] = useState(false);

    const _addInstanceModalAlert = useState(defaultAlertValues);
    const [addInstanceModalAlert] = _addInstanceModalAlert;

    const [instancePreviewInfo, setInstancePreviewInfo] = useState({ avatarURL: '', tag: '', createdAt: '' });
    const [confirmInstanceModalAlert, setConfirmInstanceModalActive] = useState(false);

    const [instances, setInstances] = useState([]);
    const [instanceAlerts, setInstanceAlerts] = useState([]);

    const [userAccountValue, setUserAccountValue] = useState(false);
    const [copiedToken, setCopiedToken] = useState([]);
    const [disableTimeoutValue, setDisableTimeoutValue] = useState(false);
    const [noIntentsValue, setNoIntentsValue] = useState(false);

    useEffect(() => setInstances(getInstances()), []);

    async function checkToken () {
        disableElements(_context);
        resetAlert(_addInstanceModalAlert);

        const instanceInfo = await validateToken(token, !userAccountValue, disableTimeoutValue, noIntentsValue);

        if (instanceInfo) {
            setAddInstanceModalActive(false);
            setInstancePreviewInfo(instanceInfo);
            setConfirmInstanceModalActive(true); 
        }
        else showAlert(_addInstanceModalAlert, 'danger', 'Failed', (
            <>
                <p>Failed to login with instance; possible reasons:</p>
                <ul>
                    <li>Invalid token.</li>
                    <li>Not enabled all intents.</li>
                </ul>
            </>
        ));

        enableElements(_context);
    };

    function _addInstance () {
        disableElements(_context);

        addInstance({ token, bot: !userAccountValue, timeoutDisabled: disableTimeoutValue, noIntents: noIntentsValue, ...instancePreviewInfo });
        setInstances(getInstances());

        setConfirmInstanceModalActive(false);
        enableElements(_context);
    };

    function _removeInstance (id) {
        disableElements(_context);

        removeInstance(id);
        setInstances(getInstances());

        enableElements(_context);
    };

    function copyInstanceToken (id, token) {
        clipboard.writeText(token);

        setCopiedToken((state) => ({ ...state, [id]: true }));

        setTimeout(function () {
            setCopiedToken((state) => ({ ...state, [id]: false }));
        }, 1000);
    };

    async function connectInstance (id) {
        disableElements(_context);
        setInstanceAlerts((state) => ({ ...state, [id]: false }));

        const instance = findInstance(id);
        const client = await createClient({ token: instance?.token, disableTimeout: instance?.timeoutDisabled, noIntents: instance?.noIntents, bot: instance?.bot });

        if (instance && !client) {
            console.error('Failed to create client.');

            setInstanceAlerts((state) => ({ ...state, [id]: true }));
            setTimeout(function () {
                setInstanceAlerts((state) => ({ ...state, [id]: false }));
                enableElements(_context);
            }, 3000);
        }
        else {
            client.on('disconnect', function () {
                console.log('Client disconnected!');

                setContext((state) => ({
                    ...state,
                    sidebarDisabled: false,
                    content: 'instances',
                    instance: {
                        client: null,
                        servers: null
                    }
                }));
            });

            console.log('Client connected!');
                        
            setContext((state) => ({
                ...state,
                instance: {
                    client,
                    servers: client.guilds || null
                },
                sidebarDisabled: true,
                elementsDisabled: false,
                content: 'instance'
            }));
        };
    };

    return (
        <>
            {/* Add Instance Modal */}
            <Modal
                active={addInstanceModalActive}
                footer={
                    <>
                        <Button label='Continue' variant='primary' size='md' onClick={checkToken} />
                        <Button label='Cancel' size='md' onClick={() => setAddInstanceModalActive(false)} />
                    </>
                }
            >
                <Input label='Token' value={token} onInput={(e) => setToken(e.target.value)} style={{ width: 'calc(100% - 1.5rem)' }} />
                <div className={styles.checkboxes}>
                    <div className={styles.checkboxContainer}>
                        <input className={styles.checkbox} type='checkbox' checked={userAccountValue} onChange={(e) => setUserAccountValue(e.target.checked)} />
                        <h3 className={styles.label}>User Account</h3>
                    </div>
                    <div className={styles.checkboxContainer}>
                        <input className={styles.checkbox} type='checkbox' checked={disableTimeoutValue} onChange={(e) => setDisableTimeoutValue(e.target.checked)} />
                        <h3 className={styles.label}>Disable Timeout</h3>
                    </div>
                    <div className={styles.checkboxContainer}>
                        <input className={styles.checkbox} type='checkbox' checked={noIntentsValue} onChange={(e) => setNoIntentsValue(e.target.checked)} />
                        <h3 className={styles.label}>No Intents</h3>
                    </div>
                </div>
                <Alert variant={addInstanceModalAlert.variant} description={<p>{addInstanceModalAlert.description}</p>} style={{ marginTop: '1rem', display: addInstanceModalAlert.visible ? 'flex' : 'none' }} />
            </Modal>

            {/* Confirm Instance Modal */}
            <Modal
                active={confirmInstanceModalAlert}
                footer={
                    <>
                        <Button label='Continue' variant='primary' size='md' onClick={_addInstance} />
                        <Button label='Cancel' size='md' onClick={() => setConfirmInstanceModalActive(false)} />
                    </>
                }
            >
                <h3>Do you want to continue with this instance?</h3>
                <div className={styles['instance-preview']}>
                    <Image className={styles.image} src={instancePreviewInfo.avatarURL || 'https://cdn.discordapp.com/embed/avatars/1.png'} width={50} height={50} />
                    <div className={styles.info}>
                        <h2 className={styles.tag}>{instancePreviewInfo.tag}</h2>
                        <p className={styles.description}>
                            Created on <b>{instancePreviewInfo.createdAt}</b>
                        </p>
                    </div>
                </div>
            </Modal>

            {/* Content */}
            <div className={styles.title}>
                <h3>Instances</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button
                        size='sm'
                        label='Developer Portal'
                        iconLeft={faLink}
                        onClick={() => { window.open('https://discord.com/developers/applications') }}
                    />
                    <Button
                        size='sm'
                        label='Add Instance'
                        iconLeft={faPlus}
                        customClass={styles['add-instance']}
                        onClick={() => { resetAlert(_addInstanceModalAlert); setToken(''); setUserAccountValue(false); setDisableTimeoutValue(false); setNoIntentsValue(false); setAddInstanceModalActive(true) }}
                    />
                </div>
            </div>

            <div className={styles.instances}>
                {instances.map((instance) => (
                    <div className={styles.instance} key={instance.id}>
                        <Image className={styles.avatar} src={instance.avatarURL} width={50} height={50} />
                        <div className={styles.info}>
                            <div className={styles.text}>
                                <h3 className={styles.tag}>{instance.tag}</h3>
                                <p className={styles.id}>Id: <b>{instance.id}</b></p>
                                <p className={styles.id}>Type: <b>{instance.bot ? 'Bot' : 'User'}</b></p>
                                <p className={styles.id}>Timeout: <b>{instance.timeoutDisabled ? 'No' : 'Yes'}</b></p>
                                <p className={styles.id}>Intents: <b>{instance.noIntents ? 'No' : 'Yes'}</b></p>
                                <Alert variant='warning' description={(
                                    <>
                                        <p>Failed to connect to instance; possible reasons:</p>
                                        <ul>
                                            <li>Invalid token.</li>
                                            <li>Not enabled all intents.</li>
                                        </ul>
                                    </>
                                )} style={{ marginTop: '1rem', display: instanceAlerts[instance.id] ? 'flex' : 'none' }} />
                            </div>
                            <div className={styles.buttons}>
                                <Button label='Connect' iconLeft={faServer} variant='primary' size='sm' onClick={() => connectInstance(instance.id)} />
                                <Button label='Delete' iconLeft={faTrash} customClass={styles.trashButton} size='sm' onClick={() => _removeInstance(instance.id)} />
                                {copiedToken[instance.id] ? (
                                    <Button label='Copied' iconLeft={faCheck} size='sm' disabled />
                                ) : (
                                    <Button label='Token' iconLeft={faClipboard} size='sm' onClick={() => copyInstanceToken(instance.id, instance.token)} />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};