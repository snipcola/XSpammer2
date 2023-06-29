import styles from './bot.module.css';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';

import { useContext, useState } from 'react';
import { Context } from '../lib/context';

import Button from '../components/button';
import Alert from '../components/alert';

export default function () {
    const [context, setContext] = useContext(Context);
    const info = context.bot.info;

    function exit () {
        setContext({
            ...context,
            sidebarDisabled: false,
            content: 'bots',
            bot: null
        });
    };

    return (
        <>
            {/* Content */}
            <div className={styles.title}>
                <h3>{info.tag}</h3>
                <Button
                    size='sm'
                    label='Exit'
                    iconLeft={faPowerOff}
                    customClass={styles['exit']}
                    onClick={exit}
                />
            </div>

            {context.bot ? (
                <>
                    
                </>
            ) : <Alert variant='warning' description='No bot is currently connected.' style={{ marginTop: '1rem' }} />}
        </>
    );
};