<script lang='ts'>
    import './sidebar.css';
    import { logsActive as _logsActive, content as _content } from '../stores';

    let logsActive;
    
    _logsActive.subscribe((value) => logsActive = value);

    import Button from './button.svelte';
    import { type IconDefinition, faHome, faBoxesStacked, faTerminal, faLink } from '@fortawesome/free-solid-svg-icons';
    import { faDiscord, faYoutube } from '@fortawesome/free-brands-svg-icons';

    class Tab {
        label: string;
        active: boolean;
        icon: IconDefinition;
        onClick: () => void;

        constructor(label, icon = faLink, active = false, onClick = () => {}) {
            this.label = label || 'Button';
            this.active = active;
            this.icon = icon;
            this.onClick = onClick;
        }
    };

    class _Button {
        label: string;
        variant: 'secondary' | 'primary';
        icon: IconDefinition;
        link: string;

        constructor(label, variant, icon = faLink, link) {
            this.label = label || 'Button';
            this.variant = variant || 'primary';
            this.icon = icon;
            this.link = link;
        }
    };

    const tabs = [
        new Tab('Home', faHome, true, function () {
            const home = document.querySelector('.tab-home');
            const instances = document.querySelector('.tab-instances');

            home.classList.add('tab-active');
            instances.classList.remove('tab-active');

            _content.set('home');
        }),
        new Tab('Instances', faBoxesStacked, false, function () {
            const home = document.querySelector('.tab-home');
            const instances = document.querySelector('.tab-instances');

            home.classList.remove('tab-active');
            instances.classList.add('tab-active');

            _content.set('instances');
        }),
        new Tab('Logs', faTerminal, logsActive, function () {
            const currentLogsActive = logsActive;
            const logs = document.querySelector('.tab-logs');

            _logsActive.set(!currentLogsActive);

            logs.classList.toggle('tab-active');
        })
    ];

    const buttons = [
        new _Button('Discord', undefined, faDiscord, 'https://discord.gg/aVYw6h2SYb'),
        new _Button('YouTube', 'secondary', faYoutube, 'https://youtube.com/snipcola')
    ];
</script>

<div class='sidebar container'>
    <div class='branding'>
        <img alt='XSpammer 2' src='images/icon-text.png' class='icon'>
        <p class='info'>Snipcola ~ v0.0.1</p>
    </div>
    <div class='tabs'>
        {#each tabs as tab}
            <Button customClass={`tab tab-${tab.label.toLowerCase()} ${tab.active && 'tab-active'}`} label={tab.label} size='lg' variant='secondary' iconLeft={tab.icon} onClick={tab.onClick} />
        {/each}
    </div>
    <div class='buttons'>
        {#each buttons as button}
            <a class='link' target='_blank' href={button.link}>
                <Button label={button.label} size='md' variant={button.variant} iconLeft={button.icon} />
            </a>
        {/each}
    </div>
</div>