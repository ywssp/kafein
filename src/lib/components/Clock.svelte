<script lang="ts">
    // import { onMount } from 'svelte';
    // let { serverTime } = $props();
    
    let isTampered = $state(false);
    let displayTime = $state(new Date());

    // onMount(() => {
    //     // Calculate difference
    //     const localTime = new Date().getTime();
    //     const diff = Math.abs(localTime - serverTime);

    //     // If difference > 5 minutes (300,000ms), warn the user!
    //     if (diff > 300000) {
    //         isTampered = true;
    //     }

    //     setInterval(() => { displayTime = new Date(); }, 1000);
    // });
</script>

<div class="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-md">
    {#if isTampered}
        <span class="text-red-600">⚠ Time Mismatch</span>
    {/if}
    {displayTime.toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' })}
</div>