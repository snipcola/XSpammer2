<script lang='ts'>
    import './layout.css';
    import Sidebar from './sidebar.svelte';

    import Home from '../content/home.svelte';
    import Instances from '../content/instances.svelte';

    import { logsActive as _logsActive, content as _content } from '../stores';

    let logsActive;
    
    _logsActive.subscribe((value) => logsActive = value);

    let content;

    _content.subscribe((value) => content = value);
</script>

<main>
    <Sidebar />
    <div class={`right ${logsActive && 'logs-active'}`}>
        <div class='content container'>
            {#if content === 'home'}
                <Home />
            {:else if content === 'instances'}
                <Instances />
            {/if}
        </div>
        <div class='logs container'></div>
    </div>
</main>