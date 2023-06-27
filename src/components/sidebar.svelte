<script lang='ts'>
    import './sidebar.css';

    import Button from './button.svelte';
    import { type IconDefinition, faHome, faBoxesStacked, faTerminal, faLink } from '@fortawesome/free-solid-svg-icons';
    import { faDiscord, faYoutube } from '@fortawesome/free-brands-svg-icons';

    class Tab {
        label: string;
        icon: IconDefinition;

        constructor(label, icon = faLink) {
            this.label = label || 'Button';
            this.icon = icon;
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
        new Tab('Home', faHome),
        new Tab('Instances', faBoxesStacked),
        new Tab('Logs', faTerminal)
    ];

    const buttons = [
        new _Button('Discord', undefined, faDiscord, 'https://discord.gg/aVYw6h2SYb'),
        new _Button('YouTube', 'secondary', faYoutube, 'https://youtube.com/snipcola')
    ];
</script>

<div class='sidebar'>
    <div class='branding'>
        <img alt='XSpammer 2' src='images/icon-text.png' class='icon'>
        <p class='info'>Snipcola ~ v0.0.1</p>
    </div>
    <div class='tabs'>
        {#each tabs as tab}
            <Button customClass='tab' label={tab.label} size='lg' variant='secondary' iconLeft={tab.icon} />
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