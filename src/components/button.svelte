<script>
    import './button.css';

    import Icon from 'svelte-fa';

    export let label = 'Button';

    export let variant = 'secondary';
    export let size = 'sm';

    export let iconLeft = null;
    export let iconRight = null;

    export let customClass = '';
    export let onClick = () => {};
</script>

<button class={`button size-${size} variant-${variant} ${customClass}`} on:click={onClick}>
    {#if iconLeft}
        <Icon icon={iconLeft} />
    {/if}
    {label}
    {#if iconRight}
        <Icon icon={iconRight} />
    {/if}
</button>