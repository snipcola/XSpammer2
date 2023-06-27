<script lang='ts'>
    import './layout.css';
    
    import Sidebar from './sidebar.svelte';
</script>

<main>
    <Sidebar />
    <div class='content'>
        <slot></slot>
    </div>
</main>