<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import BaseButton from '$lib/components/interactables/BaseButton.svelte';

	let search = $state('');

	// Jump-to links
	const sections = [
		{ id: 'quick-start', label: 'Quick Start' },
		{ id: 'how-it-works', label: 'How It Works' },
		{ id: 'reading-results', label: 'Reading Results' },
		{ id: 'pathways', label: 'Pathways' },
		{ id: 'input-guide', label: 'Input Guide' },
		{ id: 'safety-tips', label: 'Safety & Tips' },
		{ id: 'faq', label: 'FAQ' },
		{ id: 'glossary', label: 'Glossary' },
		{ id: 'troubleshooting', label: 'Troubleshooting' },
		{ id: 'references', label: 'References' }
	];

	// Quick start: how the app flows
	const steps = [
		{
			title: 'Create a Recommendation',
			body: 'Go to Recommend and fill in every field: Intended Application, Coffee Blend, Brewing Cycle, Brewing Method, Ground Size, Moisture Condition, SCG Amount (grams), Storage Duration, Processing State, Drying Condition and Composting Status. Then tick at least one Visible Contamination option, and optionally the Materials Mixed In and Available Equipment. Click "Get Recommendation".'
		},
		{
			title: 'Review the Results',
			body: 'Scroll down to see the suitability charts and one card per application pathway, each with a predicted value, a preparation guide, what helps, what limits, and how to improve.'
		},
		{
			title: 'Save the Recommendation',
			body: 'Click "Save Recommendation" at the bottom of the results to store it in your history. If you leave without saving, a popup will ask whether to save, stay or leave.'
		},
		{
			title: 'Manage from the History tab',
			body: 'Select any saved recommendation to view its details and results. You can also delete it.'
		}
	];

	// How recommendations work
	const howItWorks = [
		{
			title: 'Step 1: Linear Regression predicts a real value (Ŷ)',
			body: 'For each pathway, a simple regression formula uses your inputs (such as moisture or composting status) to predict a measurable outcome, for example the Germination Index (%) for compost or the Tensile Index (Nm/g) for paper composites.'
		},
		{
			title: 'Step 2: Sugeno Fuzzy Logic turns it into a score',
			body: 'The predicted value and your other inputs are checked against fuzzy rules (Low, Moderate, High). The rule weights are combined into a single suitability score from 0 to 100%.'
		},
		{
			title: 'Step 3: Pathways are ranked',
			body: 'Pathways are sorted by score. If you chose an Intended Application, it is pinned to the top so you can always see how it performs, followed by the others for comparison.'
		}
	];

	const tiers = [
		{ name: 'High', range: '75% and above', cls: 'bg-[#34593f] text-cream' },
		{ name: 'Moderate', range: '45% to 74%', cls: 'bg-[#8a6229] text-cream' },
		{ name: 'Low', range: 'Below 45%', cls: 'bg-[#6e2b25] text-cream' }
	];

	// Reading results
	const resultParts = [
		{
			term: 'Application Suitability Share',
			def: 'The left donut chart. It shows how each pathway\'s score compares with the others. "Top Score" in the center is the highest single score.'
		},
		{
			term: 'Suitability Breakdown',
			def: 'The right donut chart. It counts how many pathways fall into High, Moderate and Low. "Avg Fit" is the average score across all ranked pathways.'
		},
		{
			term: 'Linear Regression Model Output',
			def: 'The formula used, the inputs plugged into it, and the predicted value (Ŷ) for that pathway.'
		},
		{
			term: 'Sugeno weights',
			def: 'The small line under each score (w_Low, w_Mod, w_High) shows how strongly each fuzzy rule fired. They are shown for transparency.'
		},
		{
			term: 'Preparation & Ratio Guide',
			def: 'A suggested mix or procedure scaled to the grams of SCG you entered.'
		},
		{
			term: '✓ and ✕ lists',
			def: 'Green ✓ lines are factors that help the pathway. Red ✕ lines are factors that limit it.'
		},
		{
			term: 'How to Improve Suitability',
			def: 'Shown when a fix is available, such as composting first, drying in an oven or grinding finer. Some tips depend on the equipment you ticked.'
		},
		{
			term: 'Your Intended Application',
			def: 'Highlighted at the top when you pick a specific application instead of "Explore All Applications".'
		}
	];

	// Application pathways
	const pathways = [
		{
			name: 'Compost & Soil Amendment',
			predicts: 'Germination Index (%)',
			best: 'Fully composted SCG mixed with soil, manure or peat moss, with no foreign materials.',
			avoid: 'Raw SCG applied directly to plants. Caffeine and tannins can stunt growth.'
		},
		{
			name: 'Mushroom Cultivation',
			predicts: 'Mycelial Growth Rate (mm/day)',
			best: 'Clean, fresh grounds (collected within a few hours) at about 60% moisture, supplemented with sawdust.',
			avoid: 'Any visible mold or contamination, and long storage without sterilizing.'
		},
		{
			name: 'Paper-Based Composite',
			predicts: 'Tensile Index (Nm/g)',
			best: 'Fine or medium grounds blended with paper pulp.',
			avoid: 'Coarse particles and no paper pulp.'
		},
		{
			name: 'Natural Dye Extraction',
			predicts: 'Dye Yield (%)',
			best: 'Grounds brewed only once and not composted.',
			avoid: 'Many brewing cycles and composted SCG, which have already lost their pigments.'
		},
		{
			name: 'Bio-Based Desiccant',
			predicts: 'Moisture Sorption Capacity (g/g)',
			best: 'Dry, air-dried or oven-dried grounds with no mold.',
			avoid: 'Wet or damp grounds and moldy SCG.'
		},
		{
			name: 'Bio-Briquette Fuel (information only)',
			predicts: 'Calorific Value (MJ/kg)',
			best: 'Low moisture grounds mixed with sawdust as a binder.',
			avoid: 'High moisture. This pathway is shown under Additional Information and is not scored or ranked.'
		}
	];

	// Input guide
	const inputGuide = [
		{
			field: 'Intended Application',
			help: 'Pick the use you have in mind, or "Explore All Applications" to compare every pathway.'
		},
		{
			field: 'Moisture Condition',
			help: 'Estimated as Wet (about 65%), Damp (about 42%), Slightly Moist (about 22%) or Dry (about 9%). Pick the closest feel. Moisture affects almost every pathway.'
		},
		{
			field: 'Ground Size',
			help: 'Estimated as Fine (about 0.35 mm), Medium (about 0.65 mm) or Coarse (about 1.1 mm). "Unsure" is treated as Medium. It mainly affects paper composites.'
		},
		{
			field: 'Brewing Cycle',
			help: 'How many times the grounds were brewed. More cycles means fewer extractable pigments, which lowers Natural Dye Extraction.'
		},
		{
			field: 'Storage Duration',
			help: 'How long the grounds sat before use. Fresher grounds score better for mushroom cultivation.'
		},
		{
			field: 'Processing State, Drying Condition and Composting Status',
			help: 'Describe what has already been done to the grounds. Composting matters most for compost use, and drying matters most for desiccants.'
		},
		{
			field: 'SCG Amount (grams)',
			help: 'Required and must be above 0. Recipes and ratios are scaled to this amount.'
		},
		{
			field: 'Visible Contamination (required)',
			help: 'Tick at least one option. "No Contamination" cannot be combined with the others. Selecting it clears the rest, and selecting another option clears it.'
		},
		{
			field: 'Materials Mixed In',
			help: 'Optional. Soil, peat moss, manure, paper pulp and sawdust change the score and the advice for several pathways.'
		},
		{
			field: 'Available Equipment',
			help: 'Optional. Ticking an oven or grinder unlocks tailored improvement tips, such as oven-drying or grinding finer.'
		}
	];

	// Safety & tips
	const safety = [
		{ title: 'Do not use moldy SCG', body: 'Mold lowers or zeroes several pathway scores and can be a health risk. Discard visibly moldy grounds.' },
		{ title: 'Remove foreign materials', body: 'Sieve out filters, paper, plastic or other debris before soil application or processing.' },
		{ title: 'Protect yourself when drying or grinding', body: 'Wear a dust mask when grinding or handling dry grounds, and keep ovens attended while drying.' },
		{ title: 'Pasteurize for mushrooms', body: 'If the grounds are not freshly collected, pasteurize or steam-sterilize the substrate before inoculation.' },
		{ title: 'Use fresh grounds when you can', body: 'Fresh grounds score better for mushrooms. If you cannot use them right away, dry them before storing.' },
		{ title: 'Be accurate with your inputs', body: 'The score is only as good as what you enter, so use your real brewing count, moisture and amount.' }
	];

	const glossary = [
		{ term: 'SCG', def: 'Spent coffee grounds, the leftover grounds after brewing.' },
		{ term: 'Linear Regression', def: 'A simple formula (Ŷ = b₀ + b₁X₁ + ...) that predicts a measurable result from your inputs.' },
		{ term: 'Sugeno Fuzzy Logic', def: 'A rule-based method that blends Low, Moderate and High conditions into one smooth score instead of a hard yes or no.' },
		{ term: 'Rule Firing Weight', def: 'How strongly a fuzzy rule applies (w_Low, w_Mod, w_High). The final score is a weighted average of the rule outputs.' },
		{ term: 'Suitability Level', def: 'The label for a score: High (75% and above), Moderate (45 to 74%) or Low (below 45%).' },
		{ term: 'Predicted Value (Ŷ)', def: 'The outcome the regression model predicts for a pathway, such as germination, tensile strength or yield.' },
		{ term: 'Germination Index', def: 'A percentage that shows how well seeds sprout in a material. Higher means safer for plants.' },
		{ term: 'Mycelial Growth Rate', def: 'How fast mushroom mycelium spreads through a substrate, in millimeters per day.' },
		{ term: 'Tensile Index', def: 'The strength of a paper composite, in Nm/g. Higher means stronger sheets.' },
		{ term: 'Calorific Value', def: 'The heat energy released when a fuel burns, in MJ/kg. Higher burns hotter.' },
		{ term: 'Sorption Capacity', def: 'How many grams of water vapor each gram of material can adsorb (g/g).' },
		{ term: 'C:N Ratio', def: 'The balance of carbon to nitrogen in a mix. SCG is nitrogen-rich, so it is balanced with carbon-rich materials.' },
		{ term: 'Phytotoxic', def: 'Harmful to plants. Raw SCG contains compounds such as caffeine and tannins that can be phytotoxic.' },
		{ term: 'Composting', def: 'Biological breakdown of organic matter, which reduces phytotoxic compounds in SCG.' },
		{ term: 'Pasteurization', def: 'Heat treatment that reduces competing microbes without fully sterilizing the substrate.' }
	];

	const faqs = [
		{
			q: 'Why is the Get Recommendation button disabled?',
			a: 'SCG amount must be above 0 and at least one Visible Contamination option must be ticked.'
		},
		{
			q: 'What does "Explore All Applications" do?',
			a: 'It evaluates every pathway and ranks them purely by score. If you pick a specific application instead, that pathway is pinned to the top and highlighted.'
		},
		{
			q: 'Why did my intended application score low?',
			a: 'Check the red ✕ lines on its card to see what is limiting it, then read "How to Improve Suitability" for fixes such as composting, drying or grinding.'
		},
		{
			q: 'Why does the same SCG score differently when I change one input?',
			a: 'Each pathway uses different inputs. For example, moisture affects almost all of them, while composting mostly affects compost and dye extraction. Changing one field can move several scores.'
		},
		{
			q: 'Is it safe to use moldy SCG?',
			a: 'No. Mold lowers or zeroes the score for mushroom cultivation, desiccants and compost, and is not recommended for any pathway.'
		},
		{
			q: 'Why is Bio-Briquette not ranked?',
			a: 'It is shown under Additional Information for reference only. It is not scored against or ranked with the main pathways.'
		},
		{
			q: 'Are the predictions real?',
			a: 'They are prototype estimates from simplified regression formulas and fuzzy rules, based on published research. Treat them as guidance and not as lab-validated results.'
		},
		{
			q: 'What happens if I leave without saving?',
			a: 'A popup asks whether to leave without saving, stay, or save and leave. If you refresh or close the tab, your browser shows its own warning. Unsaved recommendations are lost.'
		},
		{
			q: 'Where is my saved recommendation stored?',
			a: 'Saved recommendations appear in the History tab in this browser. Clearing site data or using another browser or device will not show them.'
		},
		{
			q: 'Can I edit or delete a saved recommendation?',
			a: 'You can delete it from the History tab. To get an updated result, run a new recommendation with the changed inputs and save it.'
		}
	];

	const troubleshooting = [
		{
			issue: 'The Get Recommendation button stays disabled',
			fix: 'Enter an SCG amount above 0 and tick at least one option under Visible Contamination (choose "No Contamination" if the grounds look clean).'
		},
		{
			issue: 'Results did not scroll into view',
			fix: 'Scroll down below the form. The results appear under "Assessment & Application Recommendations".'
		},
		{
			issue: 'My saved recommendation is not in History',
			fix: 'Make sure you clicked "Save Recommendation" (the bar should read "Recommendation saved"), then open the History tab. Data is stored per browser.'
		},
		{
			issue: 'The leave popup keeps appearing',
			fix: 'You have an unsaved recommendation. Save it, or choose "Leave without saving" to continue.'
		},
		{
			issue: 'Scores seem too low everywhere',
			fix: 'Check for mold or foreign materials, very wet grounds, or raw uncomposted grounds. These lower many scores. Follow the "How to Improve Suitability" tips.'
		},
		{
			issue: 'The number did not change after I fixed an input',
			fix: 'Click "Get Recommendation" again. Results only update when you submit the form.'
		}
	];

	const references = [
		'Pérez-Burillo et al. (2022): Compost & Soil Amendment',
		'Angeloni et al. (2024): Compost & Soil Amendment',
		'Brunerová et al. (2020): Bio-Briquette Fuel',
		'Kaewkhon & Naksupan (2025): Mushroom Cultivation',
		'Bejenari et al. (2024): Paper-Based Composite',
		'Melaku et al. (2023): Natural Dye Extraction',
		'Moussa et al. (2022): Bio-Based Desiccant'
	];

	const q = $derived(search.trim().toLowerCase());
	const match = (...parts: string[]) => !q || parts.some((p) => p.toLowerCase().includes(q));

	const filteredFaqs = $derived(faqs.filter((f) => match(f.q, f.a)));
	const filteredGlossary = $derived(glossary.filter((g) => match(g.term, g.def)));
	const filteredPathways = $derived(
		pathways.filter((p) => match(p.name, p.predicts, p.best, p.avoid))
	);
	const filteredInputs = $derived(inputGuide.filter((i) => match(i.field, i.help)));
	const filteredSafety = $derived(safety.filter((s) => match(s.title, s.body)));
	const filteredTroubleshooting = $derived(
		troubleshooting.filter((t) => match(t.issue, t.fix))
	);

	const noResults = $derived(
		!!q &&
			filteredFaqs.length === 0 &&
			filteredGlossary.length === 0 &&
			filteredPathways.length === 0 &&
			filteredInputs.length === 0 &&
			filteredSafety.length === 0 &&
			filteredTroubleshooting.length === 0
	);
</script>

<div class="mx-auto w-full max-w-5xl p-8 text-milk">
	<div class="mb-6">
		<h1 class="mb-1 text-3xl font-semibold">Help</h1>
		<p class="text-cream">
			Guides, definitions and troubleshooting for getting SCG reuse recommendations.
		</p>
	</div>

	<!-- Disclaimer -->
	<div class="mb-6 rounded-md border border-caramel/40 bg-caramel/10 p-3 text-sm text-cream">
		<strong class="text-caramel">Note:</strong> Recommendations are prototype estimates for educational
		use and are not lab-validated. Always follow proper safety practices.
	</div>

	<input
		type="text"
		bind:value={search}
		placeholder="Search help topics..."
		class="mb-4 block w-full rounded-md border border-espresso bg-cream px-3 py-2 text-ground placeholder-mocha focus:border-caramel focus:ring-1 focus:ring-caramel focus:outline-none"
	/>

	<!-- Jump to -->
	{#if !q}
		<nav class="mb-6 flex flex-wrap gap-2" aria-label="Jump to section">
			{#each sections as s (s.id)}
				<a
					href="#{s.id}"
					class="rounded-full border border-milk/20 bg-espresso/50 px-3 py-1 text-sm text-cream hover:border-caramel hover:text-caramel"
				>
					{s.label}
				</a>
			{/each}
		</nav>
	{/if}

	{#if noResults}
		<p class="mb-6 text-sm text-milk/60 italic">No help topics match your search.</p>
	{/if}

	{#if !q}
		<!-- Quick start -->
		<section id="quick-start" class="mb-6 scroll-mt-6 rounded-lg border border-milk/20 bg-espresso/50 p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Quick Start</h2>
			<ol class="grid grid-cols-1 gap-4 md:grid-cols-2">
				{#each steps as step, i (step.title)}
					<li class="rounded-md bg-ground/50 p-4">
						<p class="mb-1 font-semibold">
							<span class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-caramel text-sm text-espresso">{i + 1}</span>{step.title}
						</p>
						<p class="text-sm text-milk/75">{step.body}</p>
					</li>
				{/each}
			</ol>
			<div class="mt-4 flex flex-wrap gap-3">
				<BaseButton palette="matcha" onclick={() => goto(resolve('/(app)/recommend'))}>New Recommendation</BaseButton>
				<BaseButton palette="navy" onclick={() => goto(resolve('/(app)/history'))}>View History</BaseButton>
			</div>
		</section>

		<!-- How recommendations work -->
		<section id="how-it-works" class="mb-6 scroll-mt-6 rounded-lg border border-milk/20 bg-espresso/50 p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">How Recommendations Work</h2>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
				{#each howItWorks as h (h.title)}
					<div class="rounded-md bg-ground/50 p-4">
						<p class="mb-1 font-semibold text-caramel">{h.title}</p>
						<p class="text-sm text-milk/75">{h.body}</p>
					</div>
				{/each}
			</div>
			<h3 class="mt-5 mb-2 font-semibold">Suitability levels</h3>
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
				{#each tiers as t (t.name)}
					<div class="rounded-md bg-ground/50 p-3">
						<span class="mb-1 inline-block rounded-lg px-3 py-1 text-sm font-bold {t.cls}">{t.name}</span>
						<p class="text-sm text-milk/75">{t.range}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Reading results -->
		<section id="reading-results" class="mb-6 scroll-mt-6 rounded-lg border border-milk/20 bg-espresso/50 p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Reading Your Results</h2>
			<dl class="grid grid-cols-1 gap-3 md:grid-cols-2">
				{#each resultParts as r (r.term)}
					<div class="rounded-md bg-ground/50 p-3">
						<dt class="font-semibold text-caramel">{r.term}</dt>
						<dd class="text-sm text-milk/75">{r.def}</dd>
					</div>
				{/each}
			</dl>
		</section>
	{/if}

	<!-- Pathways -->
	{#if filteredPathways.length > 0}
		<section id="pathways" class="mb-6 scroll-mt-6 rounded-lg border border-milk/20 bg-espresso/50 p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Application Pathways</h2>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				{#each filteredPathways as p (p.name)}
					<div class="rounded-md bg-ground/50 p-4">
						<p class="font-semibold text-caramel">{p.name}</p>
						<p class="mt-1 text-xs text-milk/60">Predicts: {p.predicts}</p>
						<p class="mt-2 text-sm text-[#9be0af]">✓ {p.best}</p>
						<p class="mt-1 text-sm text-[#f29b94]">✕ {p.avoid}</p>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Input guide -->
	{#if filteredInputs.length > 0}
		<section id="input-guide" class="mb-6 scroll-mt-6 rounded-lg border border-milk/20 bg-espresso/50 p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Input Guide</h2>
			<dl class="space-y-3">
				{#each filteredInputs as i (i.field)}
					<div class="rounded-md border-l-4 border-caramel bg-ground/50 p-3">
						<dt class="font-semibold">{i.field}</dt>
						<dd class="text-sm text-milk/75">{i.help}</dd>
					</div>
				{/each}
			</dl>
		</section>
	{/if}

	<!-- Safety & tips -->
	{#if filteredSafety.length > 0}
		<section id="safety-tips" class="mb-6 scroll-mt-6 rounded-lg border border-milk/20 bg-espresso/50 p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Safety Notes & Tips</h2>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				{#each filteredSafety as s (s.title)}
					<div class="rounded-md bg-ground/50 p-3">
						<p class="font-semibold">{s.title}</p>
						<p class="text-sm text-milk/75">{s.body}</p>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- FAQ -->
	{#if !q || filteredFaqs.length > 0}
		<section id="faq" class="mb-6 scroll-mt-6 rounded-lg border border-milk/20 bg-espresso/50 p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Frequently Asked Questions</h2>
			<div class="space-y-2">
				{#each filteredFaqs as faq (faq.q)}
					<details class="group rounded-md bg-ground/50 p-3">
						<summary class="cursor-pointer font-semibold marker:text-caramel">{faq.q}</summary>
						<p class="mt-2 text-sm text-milk/75">{faq.a}</p>
					</details>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Glossary -->
	{#if !q || filteredGlossary.length > 0}
		<section id="glossary" class="mb-6 scroll-mt-6 rounded-lg border border-milk/20 bg-espresso/50 p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Glossary</h2>
			<dl class="grid grid-cols-1 gap-3 md:grid-cols-2">
				{#each filteredGlossary as g (g.term)}
					<div class="rounded-md bg-ground/50 p-3">
						<dt class="font-semibold text-caramel">{g.term}</dt>
						<dd class="text-sm text-milk/75">{g.def}</dd>
					</div>
				{/each}
			</dl>
		</section>
	{/if}

	<!-- Troubleshooting -->
	{#if filteredTroubleshooting.length > 0}
		<section id="troubleshooting" class="mb-6 scroll-mt-6 rounded-lg border border-milk/20 bg-espresso/50 p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">Troubleshooting</h2>
			<div class="space-y-3">
				{#each filteredTroubleshooting as t (t.issue)}
					<div class="rounded-md border-l-4 border-caramel bg-ground/50 p-3">
						<p class="font-semibold">{t.issue}</p>
						<p class="text-sm text-milk/75">{t.fix}</p>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- References -->
	{#if !q}
		<section id="references" class="scroll-mt-6 rounded-lg border border-milk/20 bg-espresso/50 p-5">
			<h2 class="mb-4 text-2xl font-semibold text-caramel">References</h2>
			<p class="mb-3 text-sm text-milk/75">
				The regression formulas and recipes are based on the following studies:
			</p>
			<ul class="list-disc space-y-1 pl-5 text-sm text-milk/75 marker:text-caramel">
				{#each references as r (r)}
					<li>{r}</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>