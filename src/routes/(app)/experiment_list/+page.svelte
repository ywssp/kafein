<script>
import { goto } from '$app/navigation';

    let searchQuery = $state('');
    let statusFilter = $state('All');

    // 2. Data
    const allExperiments = [
        { id: 'EXP-001', batch: 'SCG-001', package: 'Shoebox', start: 'Sep 20, 2026', status: 'Active' },
        { id: 'EXP-002', batch: 'SCG-002', package: 'Pouch', start: 'Sep 18, 2026', status: 'Complete' },
        { id: 'EXP-003', batch: 'SCG-003', package: 'Shoebox', start: 'Sep 15, 2026', status: 'Complete' },
        { id: 'EXP-004', batch: 'SCG-004', package: 'Crate', start: 'Sep 25, 2026', status: 'Active' },
        { id: 'EXP-005', batch: 'SCG-005', package: 'Pouch', start: 'Oct 01, 2026', status: 'Active' }
    ];

    // 3. Reactive filtering using $derived
    let filteredExperiments = $derived(allExperiments.filter(exp => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = exp.id.toLowerCase().includes(query) || exp.batch.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'All' || exp.status === statusFilter;
        return matchesSearch && matchesStatus;
    }));

    function getStatusColor(status) {
        if (status === 'Active') return 'bg-emerald-900/40 text-emerald-400 border border-emerald-800';
        if (status === 'Complete') return 'bg-sky-900/40 text-sky-400 border border-sky-800';
        return 'bg-gray-800 text-gray-300';
    }
</script>

<div class="flex h-screen overflow-hidden antialiased text-textMain bg-mainbg">
    <main class="flex-1 flex flex-col overflow-y-auto">
        <header class="h-14 border-b border-borderClr flex items-center justify-end px-6 space-x-6 text-xs font-mono text-textMuted bg-mainbg">
            <span>FPS <strong class="text-white">N/A</strong></span>
            <span>GPU <strong class="text-white">8%</strong></span>
            <span>CPU <strong class="text-white">40%</strong></span>
            <span>LAT <strong class="text-white">N/A</strong></span>
        </header>

        <!-- Page Content -->
        <div class="p-8 max-w-5xl mx-auto w-full">
            <div class="flex justify-between items-end mb-8">
                <div>
                    <h1 class="text-3xl font-semibold text-white mb-2">Experiments</h1>
                    <p class="text-textMuted">Search and monitor batch statuses.</p>
                </div>
                <button onclick={() => goto('/experiment_list/new')} class="bg-caramel hover:bg-[#a6652c] text-white px-5 py-2.5 rounded shadow-sm font-medium transition-colors flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>New Experiment</span>
                </button>
            </div>

            <!-- Filter Controls -->
            <div class="bg-panel p-5 rounded-t-lg border border-borderClr flex flex-wrap gap-6 items-end">
                <div class="flex-1 min-w-[200px]">
                    <label class="block text-sm font-medium text-textMuted mb-1" for="search">Search experiment</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-4 w-4 text-textMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <!-- Svelte Data Binding for Search -->
                        <input id="search" type="text" bind:value={searchQuery} placeholder="Search ID or Batch..." class="block w-full pl-10 pr-3 py-2 border border-borderClr rounded-md leading-5 bg-mainbg text-textMain placeholder-textMuted focus:outline-none focus:ring-1 focus:ring-caramel focus:border-caramel sm:text-sm transition-colors">
                    </div>
                </div>
                
                <div class="w-48">
                    <label class="block text-sm font-medium text-textMuted mb-1" for="status">Status</label>
                    <!-- Svelte Data Binding for Select -->
                    <select id="status" bind:value={statusFilter} class="block w-full pl-3 pr-10 py-2 text-base border border-borderClr rounded-md bg-mainbg text-textMain focus:outline-none focus:ring-1 focus:ring-caramel focus:border-caramel sm:text-sm transition-colors">
                        <option value="All">All</option>
                        <option value="Active">Active</option>
                        <option value="Complete">Complete</option>
                    </select>
                </div>
            </div>

            <!-- Interactive Table -->
            <div class="bg-panel border border-t-0 border-borderClr rounded-b-lg overflow-hidden shadow">
                <table class="min-w-full divide-y divide-borderClr">
                    <thead class="bg-[#3a2a26]">
                        <tr>
                            <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">ID</th>
                            <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">SCG Batch</th>
                            <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">Package</th>
                            <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">Start Date</th>
                            <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">Status</th>
                            <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-borderClr bg-panel">
                        <!-- Svelte #each block replaces JavaScript mapping -->
                        {#each filteredExperiments as exp (exp.id)}
                            <tr class="hover:bg-[#4a3630] transition-colors">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{exp.id}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-textMain">{exp.batch}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-textMain">{exp.package}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-textMuted">{exp.start}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusColor(exp.status)}">
                                        {exp.status}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <a href="#" class="text-caramel hover:text-[#e09c62] hover:underline transition-colors">View</a>
                                </td>
                            </tr>
                        {/each}

                        <!-- Svelte conditional rendering if nothing matches the filters -->
                        {#if filteredExperiments.length === 0}
                            <tr>
                                <td colspan="6" class="px-6 py-8 text-center text-textMuted italic">
                                    No experiments match your filters.
                                </td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</div>
<style>
    :global(body) {
        background-color: #2b211e;
        margin: 0;
    }
    :global(::-webkit-scrollbar) { width: 8px; }
    :global(::-webkit-scrollbar-track) { background: #2b211e; }
    :global(::-webkit-scrollbar-thumb) { background: #5c433b; border-radius: 4px; }
    :global(::-webkit-scrollbar-thumb:hover) { background: #b87333; }
</style>