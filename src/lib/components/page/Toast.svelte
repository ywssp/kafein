<script lang="ts">
    import { toast } from '$lib/stores/toast';
</script>

{#if $toast}
    <div class="fixed bottom-6 right-6 z-50 animate-fade-in-up rounded-lg px-6 py-4 shadow-lg font-serif {$toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}">
        {$toast.message}
    </div>
{/if}

<style>
    @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
</style>