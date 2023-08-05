import '../assets/styles/default.css';
import Head from 'next/head';

export default function ({ Component, pageProps: props }) {
    return (
        <>
            <Head>
                <meta name='viewport' content='width=device-width,initial-scale=1' />
                <link rel='icon' type='image/png' href='/favicon.ico' />
                <title>Snipcola ~ XSpammer v0.0.7</title>
            </Head>
            <Component {...props} />
        </>
    );
};