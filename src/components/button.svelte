<script lang='ts'>
    import './button.css';

    import Icon from 'svelte-fa';
    import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

    export let label: string = 'Button';

    export let variant: 'secondary' | 'primary' = 'secondary';
    export let size: 'sm' | 'md' | 'lg' = 'sm';

    export let iconLeft: IconDefinition = null;
    export let iconRight: IconDefinition = null;

    export let customClass: string = '';
</script>

<button class={`button size-${size} variant-${variant} ${customClass}`}>
    {#if iconLeft}
        <Icon icon={iconLeft} />
    {/if}
    {label}
    {#if iconRight}
        <Icon icon={iconRight} />
    {/if}
</button>