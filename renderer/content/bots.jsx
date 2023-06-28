import styles from './bots.module.css';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import Modal from '../components/modal';
import Input from '../components/input';
import Button from '../components/button';
import { useState } from 'react';

export default function ({ customClass }) {
    let [addBotModalActive, setAddBotModalActive] = useState(false);

    return (
        <>
            {/* Add Bot Modal */}
            <Modal
                active={addBotModalActive}
                customClass={customClass}
                footer={
                    <>
                        <Button label='Continue' variant='primary' size='md' />
                        <Button label='Cancel' size='md' onClick={() => setAddBotModalActive(false)} />
                    </>
                }
            >
                <Input label='Token' />
            </Modal>

            {/* Content */}
            <div className={styles.title}>
                <h3>Bots</h3>
                <button className={styles['add-bot']} onClick={() => setAddBotModalActive(true)}>
                    <div className={styles['icon-container']}>
                        <Icon className={styles.icon} icon={faPlus} />
                    </div>
                    Add Bot
                </button>
            </div>
        </>
    );
};