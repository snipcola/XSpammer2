<script>
    import './bots.css';

    import Icon from 'svelte-fa';
    import { faPlus } from '@fortawesome/free-solid-svg-icons';

    import Modal from '../components/modal.svelte';
    import Input from '../components/input.svelte';
    import Button from '../components/button.svelte';

    let active = false;
</script>

<Modal active={active}>
    <Input label='Token' />
    <div class='footer' slot='footer'>
        <Button label='Continue' variant='primary' size='md' />
        <Button label='Cancel' size='md' onClick={() => active = false} />
    </div>
</Modal>

<div class='title'>
    <h3>Bots</h3>
    <button class='add-bot' on:click={() => active = true}>
        <div class='icon-container'>
            <Icon class='icon' icon={faPlus} />
        </div>
        Add Bot
    </button>
</div>

<div class='bots'>
    
</div>