<script lang='ts'>
    import './layout.css';
    import Sidebar from './sidebar.svelte';

    import Home from '../content/home.svelte';
    import Bots from '../content/bots.svelte';

    import { logsActive as _logsActive, content as _content } from '../stores';

    let logsActive;
    let content;
    
    _logsActive.subscribe((value) => logsActive = value);
    _content.subscribe((value) => content = value);
</script>

<main>
    <Sidebar />
    <div class={`right ${logsActive && 'logs-active'}`}>
        <div class='content container'>
            {#if content === 'home'}
                <Home />
            {:else if content === 'bots'}
                <Bots />
            {/if}
        </div>
        <div class='logs container'>
            <p>Logs</p>
        </div>
    </div>
</main>