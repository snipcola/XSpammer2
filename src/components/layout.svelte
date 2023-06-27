<script lang='ts'>
    import './layout.css';
    import Sidebar from './sidebar.svelte';
</script>

<main>
    <Sidebar />
    <slot class="content"></slot>
</main>