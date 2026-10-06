<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import ArrowLeftIcon from '@iconify-svelte/mdi/arrow-left';

    // 1. This automatically grabs the "EXP-001" from the URL 
    let experimentId = $derived($page.params.id);

    // 2. (In a real app, you would use this ID to fetch the specific data from your database here)
</script>

<div class="mx-auto w-full max-w-5xl p-8">
    
    <!-- Back Button & Header -->
    <div class="mb-8">
        <button 
            onclick={() => goto('/experiments')}
            class="mb-4 flex items-center gap-1 text-sm font-medium text-caramel hover:underline"
        >
            <ArrowLeftIcon class="h-4" /> Back to Experiments
        </button>
        <h1 class="text-3xl font-semibold text-white">Experiment Details</h1>
        <p class="text-textMuted">Viewing data for {experimentId}</p>
    </div>

    <!-- Data Panel -->
    <div class="bg-panel border-borderClr rounded-lg border shadow-md p-6 text-white">
        <h2 class="text-xl font-medium text-caramel mb-4">Status & Configuration</h2>
        
        <div class="grid grid-cols-2 gap-4">
            <div>
                <p class="text-textMuted text-sm">Experiment ID</p>
                <p class="font-semibold">{experimentId}</p>
            </div>
            <div>
                <p class="text-textMuted text-sm">Status</p>
                <!-- Placeholder for fetched status -->
                <p class="font-semibold text-matcha">Active</p> 
            </div>
        </div>
    </div>
    
</div>