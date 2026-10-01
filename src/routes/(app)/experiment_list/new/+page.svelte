<script lang="ts">
import { goto } from '$app/navigation';
    let form = $state({
        name: '',
        experimentId: 'EXP-2026-009',
        batchId: 'SCG-009',
        initialMass: '',
        preparation: 'Dried',
        notes: '',
        packageType: 'Shoebox',
        length: '',
        width: '',
        height: '',
        duration: '',
        interval: '',
        sensorNode: 'ESP32-001'
    });

    let volume = $derived(
        (form.length && form.width && form.height) 
            ? ((Number(form.length) * Number(form.width) * Number(form.height)) / 1000).toFixed(2) 
            : ''
    );

    function handleSaveDraft() {
        console.log("Draft saved:", form);
    }

    function handleContinue() {
        console.log("Continuing to setup with data:", { ...form, volume });
    }
</script>

<!-- Form Container Centered -->
<div class="p-8 max-w-4xl mx-auto w-full">
    
    <!-- Page Header -->
    <div class="mb-8">
        <h1 class="text-3xl font-semibold text-white mb-2">Create New Experiment</h1>
        <p class="text-textMuted">Configure the physical parameters and sensor nodes.</p>
    </div>

    <!-- Main Form Panel -->
    <form class="bg-panel border border-borderClr rounded-lg shadow-md overflow-hidden" onsubmit={(e) => e.preventDefault()}>
        
        <!-- 1. Experiment Information -->
        <div class="p-6 border-b border-borderClr">
            <h3 class="text-lg font-medium text-caramel mb-4">Experiment Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                    <label for="name" class="block text-sm font-medium text-textMuted mb-1">Experiment Name</label>
                    <input type="text" id="name" bind:value={form.name} class="block w-full px-3 py-2 border border-borderClr rounded-md bg-mainbg text-textMain focus:outline-none focus:ring-1 focus:ring-caramel focus:border-caramel sm:text-sm">
                </div>
                <div>
                    <label for="expId" class="block text-sm font-medium text-textMuted mb-1">Experiment ID</label>
                    <input type="text" id="expId" bind:value={form.experimentId} class="block w-full px-3 py-2 border border-borderClr rounded-md bg-mainbg text-textMuted cursor-not-allowed sm:text-sm" readonly>
                </div>
                <div>
                    <label for="batchId" class="block text-sm font-medium text-textMuted mb-1">SCG Batch ID</label>
                    <input type="text" id="batchId" bind:value={form.batchId} class="block w-full px-3 py-2 border border-borderClr rounded-md bg-mainbg text-textMuted cursor-not-allowed sm:text-sm" readonly>
                </div>
            </div>
        </div>

        <!-- 2. SCG Information -->
        <div class="p-6 border-b border-borderClr">
            <h3 class="text-lg font-medium text-caramel mb-4">SCG Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="mass" class="block text-sm font-medium text-textMuted mb-1">Initial SCG Mass</label>
                    <div class="flex items-center space-x-2">
                        <input type="number" id="mass" bind:value={form.initialMass} class="block w-full px-3 py-2 border border-borderClr rounded-md bg-mainbg text-textMain focus:outline-none focus:ring-1 focus:ring-caramel focus:border-caramel sm:text-sm">
                        <span class="text-textMuted">g</span>
                    </div>
                </div>
                <div>
                    <label for="prep" class="block text-sm font-medium text-textMuted mb-1">Preparation</label>
                    <select id="prep" bind:value={form.preparation} class="block w-full px-3 py-2 border border-borderClr rounded-md bg-mainbg text-textMain focus:outline-none focus:ring-1 focus:ring-caramel focus:border-caramel sm:text-sm">
                        <option value="Dried">Dried</option>
                        <option value="Undried">Undried</option>
                    </select>
                </div>
                <div class="md:col-span-2">
                    <label for="notes" class="block text-sm font-medium text-textMuted mb-1">Notes</label>
                    <textarea id="notes" bind:value={form.notes} rows="2" class="block w-full px-3 py-2 border border-borderClr rounded-md bg-mainbg text-textMain focus:outline-none focus:ring-1 focus:ring-caramel focus:border-caramel sm:text-sm"></textarea>
                </div>
            </div>
        </div>

        <!-- 3. Packaging Information -->
        <div class="p-6 border-b border-borderClr">
            <h3 class="text-lg font-medium text-caramel mb-4">Packaging Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div class="md:col-span-3">
                    <label for="package" class="block text-sm font-medium text-textMuted mb-1">Package Type</label>
                    <select id="package" bind:value={form.packageType} class="block w-full md:w-1/3 px-3 py-2 border border-borderClr rounded-md bg-mainbg text-textMain focus:outline-none focus:ring-1 focus:ring-caramel focus:border-caramel sm:text-sm">
                        <option value="Shoebox">Shoebox</option>
                        <option value="Pouch">Pouch</option>
                        <option value="Crate">Crate</option>
                    </select>
                </div>
                <div>
                    <label for="len" class="block text-sm font-medium text-textMuted mb-1">Length</label>
                    <div class="flex items-center space-x-2">
                        <input type="number" id="len" bind:value={form.length} class="block w-full px-3 py-2 border border-borderClr rounded-md bg-mainbg text-textMain focus:outline-none focus:ring-1 focus:ring-caramel focus:border-caramel sm:text-sm">
                        <span class="text-textMuted">cm</span>
                    </div>
                </div>
                <div>
                    <label for="width" class="block text-sm font-medium text-textMuted mb-1">Width</label>
                    <div class="flex items-center space-x-2">
                        <input type="number" id="width" bind:value={form.width} class="block w-full px-3 py-2 border border-borderClr rounded-md bg-mainbg text-textMain focus:outline-none focus:ring-1 focus:ring-caramel focus:border-caramel sm:text-sm">
                        <span class="text-textMuted">cm</span>
                    </div>
                </div>
                <div>
                    <label for="height" class="block text-sm font-medium text-textMuted mb-1">Height</label>
                    <div class="flex items-center space-x-2">
                        <input type="number" id="height" bind:value={form.height} class="block w-full px-3 py-2 border border-borderClr rounded-md bg-mainbg text-textMain focus:outline-none focus:ring-1 focus:ring-caramel focus:border-caramel sm:text-sm">
                        <span class="text-textMuted">cm</span>
                    </div>
                </div>
                <div class="md:col-span-3">
                    <p class="text-sm text-textMuted">Calculated Volume: <span class="font-mono text-white ml-2">{volume || '0.00'} L</span></p>
                </div>
            </div>
        </div>

        <!-- 4. Planned Experiment -->
        <div class="p-6">
            <h3 class="text-lg font-medium text-caramel mb-4">Planned Experiment</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="duration" class="block text-sm font-medium text-textMuted mb-1">Duration</label>
                    <div class="flex items-center space-x-2">
                        <input type="number" id="duration" bind:value={form.duration} class="block w-full px-3 py-2 border border-borderClr rounded-md bg-mainbg text-textMain focus:outline-none focus:ring-1 focus:ring-caramel focus:border-caramel sm:text-sm">
                        <span class="text-textMuted">hours</span>
                    </div>
                </div>
                <div>
                    <label for="interval" class="block text-sm font-medium text-textMuted mb-1">Sampling Interval</label>
                    <div class="flex items-center space-x-2">
                        <input type="number" id="interval" bind:value={form.interval} class="block w-full px-3 py-2 border border-borderClr rounded-md bg-mainbg text-textMain focus:outline-none focus:ring-1 focus:ring-caramel focus:border-caramel sm:text-sm">
                        <span class="text-textMuted">minutes</span>
                    </div>
                </div>
                <div>
                    <label for="sensor" class="block text-sm font-medium text-textMuted mb-1">Sensor Node</label>
                    <select id="sensor" bind:value={form.sensorNode} class="block w-full px-3 py-2 border border-borderClr rounded-md bg-mainbg text-textMain focus:outline-none focus:ring-1 focus:ring-caramel focus:border-caramel sm:text-sm">
                        <option value="ESP32-001">ESP32-001</option>
                        <option value="ESP32-002">ESP32-002</option>
                        <option value="ESP32-003">ESP32-003</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Actions / Footer -->
        <div class="p-6 bg-[#3a2a26] border-t border-borderClr flex justify-end space-x-4 rounded-b-lg">
            <!--
            <button type="button" onclick={handleSaveDraft} class="px-5 py-2.5 bg-transparent border border-borderClr text-textMain rounded shadow-sm font-medium hover:bg-[#4a3630] transition-colors">
                Save Draft
            </button>
            -->
            <button onclick={() => goto('/experiment_list')} class="bg-caramel hover:bg-[#a6652c] text-white px-5 py-2.5 rounded shadow-sm font-medium transition-colors flex items-center space-x-2">
                    <span>Back to List</span>
            </button>
            <button type="button" onclick={handleContinue} class="px-5 py-2.5 bg-caramel hover:bg-[#a6652c] text-white rounded shadow-sm font-medium transition-colors">
                Continue to Setup
            </button>
            
        </div>

    </form>
</div>