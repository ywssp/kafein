<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { experimentStore } from '$lib/dummyData/experimentStore';
	
	import PageHeader from '$lib/components/text/PageHeader.svelte';
	import InputField from '$lib/components/inputs/FormInput.svelte';
	import BasicButton from '$lib/components/inputs/BasicButton.svelte';

	let recId = $state('');
	let saved = $state(false);
	let showLeaveModal = $state(false);
	let pendingUrl: URL | null = null;
	let leaving = false;

	type Group = 'contamination' | 'materials' | 'equipment';
	type SuitabilityLevel = 'High' | 'Moderate' | 'Low';

	interface RecommendationResult {
		id: string;
		title: string;
		score: number; 
		level: SuitabilityLevel;
		predictionLabel: string; 
		predictionValue: string;
		regressionFormula: string;
		regressionInputs: string; 
		sugenoWeights: string; 
		recipe: string;
		supporting: string[];
		limiting: string[];
		remediation?: string;
		citation: string;
	}

	const NO_CONTAMINATION = 'No Contamination';

	const intendedApplications = [
		'Explore All Applications',
		'Compost & Soil Amendment',
		'Bio-Briquette Fuel',
		'Mushroom Cultivation',
		'Paper-Based Composite',
		'Natural Dye Extraction',
		'Bio-Based Desiccant'
	];

	const coffeeBlends = ['Arabica', 'Robusta', 'Mixed', 'Unknown'];
	const brewingCycles = ['1 Time', '2 Times', '3 Times', 'More than 4 times'];
	const brewingMethods = ['Espresso', 'Drip', 'French Press', 'Pour Over', 'Not Indicated'];
	const groundSizes = ['Fine', 'Medium', 'Coarse', 'Unsure'];
	const moistureConditions = ['Wet', 'Damp', 'Slightly Moist', 'Dry'];
	const storageDurations = [
		'Freshly Collected',
		'Stored for a Few Hours',
		'Stored for 1-2 Days',
		'Stored for longer'
	];
	const processingStates = ['Raw', 'Dried', 'Composted', 'Thermally Processed'];
	const dryingConditions = ['Not Dried', 'Air-Dried', 'Oven-Dried'];
	const compostingStatuses = [
		'Not Composted',
		'Currently Composting',
		'Composting',
		'Fully Composted'
	];

	const contaminationOptions = [NO_CONTAMINATION, 'Mold', 'Foreign Materials', 'Unsure'];
	const materialOptions = ['Soil', 'Peat Moss', 'Manure', 'Paper Pulp', 'Sawdust'];
	const equipmentOptions = ['Oven', 'Grinder', 'Blender'];

	const defaults = () => ({
		intendedApp: intendedApplications[0],
		coffeeBlend: coffeeBlends[0],
		brewingCycles: brewingCycles[0],
		brewingMethod: brewingMethods[0],
		groundSize: groundSizes[0],
		moistureCondition: moistureConditions[0],
		scgAmount: '' as string | number,
		storageDuration: storageDurations[0],
		processingState: processingStates[0],
		dryingCondition: dryingConditions[0],
		compostingStatus: compostingStatuses[0],
		contamination: [] as string[],
		materials: [] as string[],
		equipment: [] as string[]
	});

	let form = $state(defaults());
	let results = $state<RecommendationResult[] | null>(null);

	const pathwayColors: Record<string, string> = {
		'Compost & Soil Amendment': '#5c996e', // Sage Green
		'Bio-Briquette Fuel': '#d4a373', // Caramel
		'Mushroom Cultivation': '#c97b63', // Terracotta
		'Paper-Based Composite': '#7c9eb2', // Slate Blue
		'Natural Dye Extraction': '#a87ca0', // Muted Plum
		'Bio-Based Desiccant': '#e0b45c' // Warm Amber
	};

	// Automatically computes the Pie Chart slices & CSS conic-gradients whenever `results` updates
	let summaryStats = $derived.by(() => {
		if (!results || results.length === 0) return null;

		const totalScore = results.reduce((sum, item) => sum + item.score, 0) || 1;
		let currentAngle = 0;

		const pathwaySlices = results.map((item) => {
			const sharePercent = (item.score / totalScore) * 100;
			const startAngle = currentAngle;
			const endAngle = currentAngle + (sharePercent * 360) / 100;
			currentAngle = endAngle;
			return {
				...item,
				sharePercent: Math.round(sharePercent),
				color: pathwayColors[item.id] ?? '#d4a373',
				gradientStop: `${pathwayColors[item.id] ?? '#d4a373'} ${startAngle.toFixed(1)}deg ${endAngle.toFixed(1)}deg`
			};
		});

		// Count High / Moderate / Low tiers
		const highCount = results.filter((r) => r.level === 'High').length;
		const modCount = results.filter((r) => r.level === 'Moderate').length;
		const lowCount = results.filter((r) => r.level === 'Low').length;
		const totalCount = results.length;

		const highDeg = (highCount / totalCount) * 360;
		const modDeg = highDeg + (modCount / totalCount) * 360;
		const tierGradient = `conic-gradient(#5c996e 0deg ${highDeg.toFixed(1)}deg, #d4a373 ${highDeg.toFixed(1)}deg ${modDeg.toFixed(1)}deg, #b84a39 ${modDeg.toFixed(1)}deg 360deg)`;

		const avgScore = Math.round(totalScore / totalCount);

		return {
			pathwaySlices,
			pathwayGradient: `conic-gradient(${pathwaySlices.map((s) => s.gradientStop).join(', ')})`,
			tierGradient,
			highCount,
			modCount,
			lowCount,
			avgScore,
			topMatch: results[0]
		};
	});

	function resolveContamination(selected: string[], changed: string) {
		if (!selected.includes(changed)) return selected;
		return changed === NO_CONTAMINATION
			? [NO_CONTAMINATION]
			: selected.filter((option) => option !== NO_CONTAMINATION);
	}

	function toggleOption(group: Group, option: string) {
		const selected = form[group].includes(option)
			? form[group].filter((item) => item !== option)
			: [...form[group], option];

		form[group] = group === 'contamination' ? resolveContamination(selected, option) : selected;
	}

	let isFormValid = $derived(Number(form.scgAmount) > 0 && form.contamination.length > 0);

	function resetForm() {
	if (results && !saved && !confirm('This recommendation is not saved. Reset anyway?')) return;
	form = defaults();
	results = null;
	saved = false;
}

	// =========================================================================
	// TAKAGI-SUGENO FUZZY LOGIC HELPER FUNCTIONS
	// =========================================================================

	// Triangular Membership Function: returns μ in [0, 1]
	function triangleMF(x: number, a: number, b: number, c: number): number {
		if (x <= a || x >= c) return 0;
		if (x === b) return 1;
		return x < b ? (x - a) / (b - a) : (c - x) / (c - b);
	}

	// Zero-Order Sugeno Weighted Average Defuzzification
	// Singleton output constants: z_Low = 20, z_Mod = 55, z_High = 95
	function computeSugenoScore(wLow: number, wMod: number, wHigh: number): number {
		const sumWeights = wLow + wMod + wHigh;
		if (sumWeights === 0) return 50;
		const z = (wLow * 20 + wMod * 55 + wHigh * 95) / sumWeights;
		return Math.round(z);
	}

	function getSuitabilityLevel(score: number): SuitabilityLevel {
		if (score >= 75) return 'High';
		if (score >= 45) return 'Moderate';
		return 'Low';
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const amount = Number(form.scgAmount);

		// =========================================================================
		// STEP 1: FEATURE ENCODING (Map Form Inputs to Numerical Values)
		// =========================================================================
		const moistureMap: Record<string, number> = {
			Wet: 65,
			Damp: 42,
			'Slightly Moist': 22,
			Dry: 9
		};
		const particleSizeMap: Record<string, number> = {
			Fine: 0.35,
			Medium: 0.65,
			Coarse: 1.1,
			Unsure: 0.65
		};

		const estMoisture = moistureMap[form.moistureCondition] ?? 40; // X: Moisture (%)
		const estParticleMm = particleSizeMap[form.groundSize] ?? 0.65; // X: Particle size (mm)
		const isComposted =
			form.compostingStatus === 'Fully Composted' || form.processingState === 'Composted';
		const hasMold = form.contamination.includes('Mold');
		const hasForeign = form.contamination.includes('Foreign Materials');
		const isClean = form.contamination.includes(NO_CONTAMINATION);

		const muMoistureDry = triangleMF(estMoisture, 0, 9, 28);
		const muMoistureMoist = triangleMF(estMoisture, 15, 35, 55);
		const muMoistureWet = triangleMF(estMoisture, 35, 65, 100);

		const evaluatedPathways: RecommendationResult[] = [];

		// =========================================================================
		// PATHWAY 1: COMPOST & SOIL AMENDMENT
		// Linear Regression predicts: Germination Index (%)
		// Sugeno Fuzzy Logic evaluates: Predicted GI (Ŷ), Composting, Co-materials
		// =========================================================================
		{
			const compostFactor = isComposted ? 1 : form.compostingStatus === 'Not Composted' ? 0 : 0.5;
			const predictedGI = Math.min(
				100,
				Math.max(18, Math.round(32.5 + 58.0 * compostFactor - 0.12 * estMoisture))
			);

			// Fuzzify Linear Regression output (Predicted Germination Index) & conditions
			const muGILow = triangleMF(predictedGI, 0, 25, 55);
			const muGIMod = triangleMF(predictedGI, 40, 65, 85);
			const muGIHigh = triangleMF(predictedGI, 70, 90, 110);

			const hasSoilMix =
				form.materials.includes('Soil') ||
				form.materials.includes('Manure') ||
				form.materials.includes('Peat Moss');
			const muMix = hasSoilMix ? 1.0 : 0.3;

			// Sugeno Rule Firing Weights (w_Low, w_Mod, w_High)
			const wHigh = hasForeign ? 0 : Math.min(muGIHigh, muMix);
			const wMod = Math.max(
				muGIMod,
				Math.min(muGIHigh, 1 - muMix),
				Math.min(muGILow, hasSoilMix ? 0.8 : 0)
			);
			const wLow = Math.max(hasForeign ? 0.9 : 0, Math.min(muGILow, 1 - (hasSoilMix ? 0.7 : 0)));

			const fuzzyScore = computeSugenoScore(wLow, wMod, wHigh);

			const supporting: string[] = [];
			const limiting: string[] = [];

			if (isComposted) {
				supporting.push('Composted SCG reduces phytotoxic compounds and nitrogen immobilization.');
			} else {
				limiting.push(
					'Raw/uncomposted SCG contains phytotoxic compounds (caffeine, tannins) that can stunt direct plant growth.'
				);
			}
			if (hasSoilMix) {
				supporting.push(
					`Mixed with ${form.materials.filter((m) => ['Soil', 'Manure', 'Peat Moss'].includes(m)).join(', ')} to balance C:N ratio.`
				);
			} else {
				limiting.push('No soil, manure, or peat moss selected to buffer acidity and nitrogen draw.');
			}
			if (hasForeign) {
				limiting.push('Foreign materials must be sieved out before soil application.');
			}

			evaluatedPathways.push({
				id: 'Compost & Soil Amendment',
				title: 'Compost & Soil Amendment',
				score: fuzzyScore,
				level: getSuitabilityLevel(fuzzyScore),
				predictionLabel: 'Predicted Germination Index',
				predictionValue: `${predictedGI}% Plant Growth Viability`,
				regressionFormula: 'Ŷ = 32.5 + 58.0(X₁) - 0.12(X₂)',
				regressionInputs: `X₁ (Compost) = ${compostFactor}, X₂ (Moisture) = ${estMoisture}%`,
				sugenoWeights: `w_Low=${wLow.toFixed(2)}, w_Mod=${wMod.toFixed(2)}, w_High=${wHigh.toFixed(2)}`,
				recipe: isComposted
					? `Mix your ${amount}g of composted SCG at a 10–20% ratio with ${amount * 4}g of topsoil or peat moss.`
					: `Do not apply directly to sensitive crops. Compost your ${amount}g SCG with ${amount * 3}g of dry leaves/sawdust and ${amount}g of manure first.`,
				supporting,
				limiting,
				remediation: !isComposted
					? 'Compost this batch for 4–6 weeks before applying directly to garden beds to raise Germination Index above 80%.'
					: undefined,
				citation: 'Pérez-Burillo et al. (2022); Angeloni et al. (2024)'
			});
		}

		// =========================================================================
		// PATHWAY 2: BIO-BRIQUETTE FUEL
		// Linear Regression predicts: Calorific Value (MJ/kg)
		// Sugeno Fuzzy Logic evaluates: Predicted Calorific Value (Ŷ), Moisture, Sawdust
		// =========================================================================
		{
			const hasSawdust = form.materials.includes('Sawdust');
			const predictedCalorificNum = 22.4 - 0.14 * estMoisture + (hasSawdust ? 1.2 : 0);
			const predictedCalorific = predictedCalorificNum.toFixed(2);

			// Fuzzify Predicted Calorific Value (MJ/kg)
			const muCalLow = triangleMF(predictedCalorificNum, 10, 14, 17.5);
			const muCalMod = triangleMF(predictedCalorificNum, 16, 18.5, 21);
			const muCalHigh = triangleMF(predictedCalorificNum, 19.5, 22.5, 25);
			const muBinder = hasSawdust ? 1.0 : 0.25;

			// Sugeno Rule Firing Weights
			const wHigh = Math.min(muCalHigh, muMoistureDry, muBinder);
			const wMod = Math.max(
				muCalMod,
				muMoistureMoist,
				Math.min(muMoistureDry, 1 - muBinder),
				Math.min(muMoistureWet, hasSawdust ? 0.6 : 0)
			);
			const wLow = Math.max(muCalLow, Math.min(muMoistureWet, hasSawdust ? 0.4 : 1.0));

			const fuzzyScore = computeSugenoScore(wLow, wMod, wHigh);

			const supporting: string[] = [];
			const limiting: string[] = [];

			if (estMoisture <= 15 || form.dryingCondition !== 'Not Dried') {
				supporting.push(
					`Low moisture (${form.moistureCondition} / ${form.dryingCondition}) enables high calorific output and durability.`
				);
			} else {
				limiting.push(
					`High moisture (${form.moistureCondition}, ~${estMoisture}%) prevents ignition and lowers briquette density.`
				);
			}
			if (hasSawdust) {
				supporting.push(
					'Sawdust acts as a lignocellulosic binder that improves mechanical durability.'
				);
			} else {
				limiting.push(
					'No sawdust selected; pure SCG briquettes crumble more easily without a binder.'
				);
			}

			evaluatedPathways.push({
				id: 'Bio-Briquette Fuel',
				title: 'Bio-Briquette Solid Fuel',
				score: fuzzyScore,
				level: getSuitabilityLevel(fuzzyScore),
				predictionLabel: 'Predicted Calorific Value',
				predictionValue: `${predictedCalorific} MJ/kg`,
				regressionFormula: 'Ŷ = 22.4 - 0.14(X₁) + 1.2(X₂)',
				regressionInputs: `X₁ (Moisture) = ${estMoisture}%, X₂ (Sawdust) = ${hasSawdust ? 1 : 0}`,
				sugenoWeights: `w_Low=${wLow.toFixed(2)}, w_Mod=${wMod.toFixed(2)}, w_High=${wHigh.toFixed(2)}`,
				recipe: `Combine your ${amount}g of dried SCG (30%) with ${(amount * 2.33).toFixed(0)}g of Sawdust (70%) before pressing.`,
				supporting,
				limiting,
				remediation:
					estMoisture > 20 &&
					(form.equipment.includes('Oven') || form.equipment.includes('Sunlight'))
						? `Use your ${form.equipment.includes('Oven') ? 'Oven (105°C for 2–3 hrs)' : 'Sunlight (1–2 days)'} to dry the SCG below 10% moisture and boost calorific value to ~21.5 MJ/kg.`
						: undefined,
				citation: 'Brunerová et al. (2020)'
			});
		}

		// PATHWAY 3: MUSHROOM CULTIVATION SUBSTRATE Linear Regression predicts: Mycelial Growth Rate (mm/day)

		{
			const moistureDiff = Math.abs(60 - estMoisture);
			const predictedGrowthNum = Math.max(0, 6.8 - 0.04 * moistureDiff - (hasMold ? 5.5 : 0));
			const predictedGrowth = predictedGrowthNum.toFixed(2);

			// Fuzzify Predicted Growth Rate & Freshness
			const muGrowthLow = triangleMF(predictedGrowthNum, -1, 1.5, 4.5);
			const muGrowthMod = triangleMF(predictedGrowthNum, 3.5, 5.0, 6.2);
			const muGrowthHigh = triangleMF(predictedGrowthNum, 5.5, 6.8, 8.0);

			const isFresh =
				form.storageDuration === 'Freshly Collected' ||
				form.storageDuration === 'Stored for a Few Hours';
			const muFresh = isFresh ? 1.0 : 0.3;

			// Sugeno Rule
			const wHigh = hasMold || !isClean ? 0 : Math.min(muGrowthHigh, muFresh);
			const wMod = hasMold ? 0 : Math.max(muGrowthMod, Math.min(muGrowthHigh, 1 - muFresh));
			const wLow = hasMold || !isClean ? 1.0 : Math.max(muGrowthLow, 1 - muFresh);

			const fuzzyScore = computeSugenoScore(wLow, wMod, wHigh);

			const supporting: string[] = [];
			const limiting: string[] = [];

			if (hasMold || !isClean) {
				limiting.push(
					'Visible mold or contamination will outcompete mushroom mycelium and ruin the substrate.'
				);
			} else {
				supporting.push('Free of visible mold contamination.');
			}
			if (isFresh) {
				supporting.push(
					`${form.storageDuration} grounds retain low microbial competition after brewing pasteurization.`
				);
			} else {
				limiting.push(
					`${form.storageDuration} increases hidden fungal/bacterial spores; sterilization required.`
				);
			}
			if (form.materials.includes('Sawdust')) {
				supporting.push('Sawdust available as primary base substrate for supplementation.');
			}

			evaluatedPathways.push({
				id: 'Mushroom Cultivation',
				title: 'Mushroom Cultivation Substrate',
				score: fuzzyScore,
				level: getSuitabilityLevel(fuzzyScore),
				predictionLabel: 'Predicted Mycelial Growth Rate',
				predictionValue: `${predictedGrowth} mm/day`,
				regressionFormula: 'Ŷ = 6.8 - 0.04(X₁) - 5.5(X₂)',
				regressionInputs: `X₁ (Moisture Dev.) = ${moistureDiff}%, X₂ (Mold) = ${hasMold ? 1 : 0}`,
				sugenoWeights: `w_Low=${wLow.toFixed(2)}, w_Mod=${wMod.toFixed(2)}, w_High=${wHigh.toFixed(2)}`,
				recipe: `Supplement ${amount}g of clean SCG with ${amount * 4}g of rubberwood/hardwood sawdust (20% SCG ratio) at ~60% moisture.`,
				supporting,
				limiting,
				remediation:
					form.storageDuration !== 'Freshly Collected' && !hasMold
						? 'Pasteurize or steam-sterilize the substrate before inoculation to eliminate competing microbes.'
						: undefined,
				citation: 'Kaewkhon & Naksupan (2025)'
			});
		}

		// =========================================================================
		// PATHWAY 4: PAPER-BASED COMPOSITE MATERIALS
		// Linear Regression predicts: Composite Tensile Index (Nm/g)
		// =========================================================================
		{
			const hasPulp = form.materials.includes('Paper Pulp');
			const predictedTensileNum = 42.0 - 11.5 * estParticleMm + (hasPulp ? 8.0 : 0);
			const predictedTensile = predictedTensileNum.toFixed(1);

			// Fuzzify Predicted Tensile Index & Particle Size
			const muTensileLow = triangleMF(predictedTensileNum, 20, 30, 38);
			const muTensileMod = triangleMF(predictedTensileNum, 33, 39, 45);
			const muTensileHigh = triangleMF(predictedTensileNum, 41, 47, 52);

			const wHigh = hasPulp ? muTensileHigh : 0;
			const wMod = Math.max(muTensileMod, hasPulp ? 0.3 : 0.5);
			const wLow = !hasPulp ? 0.8 : muTensileLow;

			const fuzzyScore = computeSugenoScore(wLow, wMod, wHigh);

			const supporting: string[] = [];
			const limiting: string[] = [];

			if (hasPulp) {
				supporting.push('Paper pulp is available to form the cellulose fiber matrix.');
			} else {
				limiting.push('Paper pulp is required to bind SCG particles into sheets.');
			}
			if (form.groundSize === 'Fine' || form.groundSize === 'Medium') {
				supporting.push(
					`${form.groundSize} particle size (~${estParticleMm} mm) disperses evenly within paper fibers.`
				);
			} else {
				limiting.push('Coarse particles create weak points in paper composite sheets.');
			}

			evaluatedPathways.push({
				id: 'Paper-Based Composite',
				title: 'Paper-Based Composite Material',
				score: fuzzyScore,
				level: getSuitabilityLevel(fuzzyScore),
				predictionLabel: 'Predicted Tensile Index',
				predictionValue: `${predictedTensile} Nm/g`,
				regressionFormula: 'Ŷ = 42.0 - 11.5(X₁) + 8.0(X₂)',
				regressionInputs: `X₁ (Particle Size) = ${estParticleMm} mm, X₂ (Pulp) = ${hasPulp ? 1 : 0}`,
				sugenoWeights: `w_Low=${wLow.toFixed(2)}, w_Mod=${wMod.toFixed(2)}, w_High=${wHigh.toFixed(2)}`,
				recipe: `Blend ${amount}g of SCG (20% filler) with ${amount * 4}g of Paper Pulp (80% matrix) using a blender before pressing.`,
				supporting,
				limiting,
				remediation:
					form.groundSize === 'Coarse' && form.equipment.includes('Grinder')
						? 'Use your Grinder to reduce coarse SCG into a fine powder before mixing with paper pulp.'
						: undefined,
				citation: 'Bejenari et al. (2024)'
			});
		}

		// PATHWAY 5: NATURAL DYE EXTRACTION Linear Regression predicts: Natural Dye Extraction Yield (%)
		{
			const cycleMap: Record<string, number> = {
				'1 Time': 1,
				'2 Times': 2,
				'3 Times': 3,
				'More than 4 times': 4
			};
			const cycles = cycleMap[form.brewingCycles] ?? 1;
			const predictedDyeYieldNum = Math.max(4.5, 20.8 - 2.4 * cycles - 0.03 * estMoisture);
			const predictedDyeYield = predictedDyeYieldNum.toFixed(2);

			// Fuzzify Predicted Dye Yield (%)
			const muYieldLow = triangleMF(predictedDyeYieldNum, 0, 8, 13);
			const muYieldMod = triangleMF(predictedDyeYieldNum, 10, 14.5, 17.5);
			const muYieldHigh = triangleMF(predictedDyeYieldNum, 15.5, 18.5, 22);

			const wHigh = isComposted ? 0 : muYieldHigh;
			const wMod = isComposted ? 0.2 : muYieldMod;
			const wLow = isComposted ? 0.9 : muYieldLow;

			const fuzzyScore = computeSugenoScore(wLow, wMod, wHigh);

			const supporting: string[] = [];
			const limiting: string[] = [];

			if (cycles === 1) {
				supporting.push('Single brewing cycle leaves high residual phenolic and coloring compounds.');
			} else {
				limiting.push(
					`Brewed ${form.brewingCycles}; repeated extraction depletes water-soluble pigments.`
				);
			}
			if (isComposted) {
				limiting.push('Composted SCG has already degraded extractable dye pigments.');
			}

			evaluatedPathways.push({
				id: 'Natural Dye Extraction',
				title: 'Natural Dye Extraction',
				score: fuzzyScore,
				level: getSuitabilityLevel(fuzzyScore),
				predictionLabel: 'Predicted Natural Dye Yield',
				predictionValue: `${predictedDyeYield}% Yield (~${((amount * predictedDyeYieldNum) / 100).toFixed(1)}g extract)`,
				regressionFormula: 'Ŷ = 20.8 - 2.4(X₁) - 0.03(X₂)',
				regressionInputs: `X₁ (Brew Cycles) = ${cycles}, X₂ (Moisture) = ${estMoisture}%`,
				sugenoWeights: `w_Low=${wLow.toFixed(2)}, w_Mod=${wMod.toFixed(2)}, w_High=${wHigh.toFixed(2)}`,
				recipe: `Steep your ${amount}g of SCG in ${(amount / 60).toFixed(2)} Liters of water (60 g/L ratio) at 70°C for 90 minutes.`,
				supporting,
				limiting,
				citation: 'Melaku et al. (2023)'
			});
		}

		// PATHWAY 6: BIO-BASED DESICCANT / MOISTURE ADSORBENT Linear Regression predicts: Water Vapor Adsorption Capacity (g/g)
		{
			const predictedSorptionNum = Math.max(0.02, 0.28 - 0.0038 * estMoisture);
			const predictedSorption = predictedSorptionNum.toFixed(3);

			// Fuzzify Predicted Sorption Capacity (g/g)
			const muSorpLow = triangleMF(predictedSorptionNum, 0, 0.04, 0.14);
			const muSorpMod = triangleMF(predictedSorptionNum, 0.1, 0.17, 0.23);
			const muSorpHigh = triangleMF(predictedSorptionNum, 0.2, 0.25, 0.3);

			const isDried = form.dryingCondition !== 'Not Dried';
			const wHigh = hasMold ? 0 : Math.min(muSorpHigh, isDried ? 1.0 : 0.4);
			const wMod = hasMold ? 0 : Math.max(muSorpMod, Math.min(muSorpHigh, isDried ? 0.2 : 0.8));
			const wLow = hasMold ? 1.0 : muSorpLow;

			const fuzzyScore = computeSugenoScore(wLow, wMod, wHigh);

			const supporting: string[] = [];
			const limiting: string[] = [];

			if (form.moistureCondition === 'Dry' && isDried) {
				supporting.push(
					'Dry, thermally or air-dried SCG has open pores ready for moisture adsorption.'
				);
			} else {
				limiting.push(
					`Currently ${form.moistureCondition} (${form.dryingCondition}); pores are already occupied by water.`
				);
			}
			if (hasMold) {
				limiting.push('Moldy SCG cannot be used in enclosed packaging.');
			}

			evaluatedPathways.push({
				id: 'Bio-Based Desiccant',
				title: 'Bio-Based Desiccant Sachet',
				score: fuzzyScore,
				level: getSuitabilityLevel(fuzzyScore),
				predictionLabel: 'Predicted Moisture Sorption Capacity',
				predictionValue: `${predictedSorption} g/g (absorbs ~${(amount * predictedSorptionNum).toFixed(1)}g water)`,
				regressionFormula: 'Ŷ = 0.28 - 0.0038(X₁)',
				regressionInputs: `X₁ (Initial Moisture) = ${estMoisture}%`,
				sugenoWeights: `w_Low=${wLow.toFixed(2)}, w_Mod=${wMod.toFixed(2)}, w_High=${wHigh.toFixed(2)}`,
				recipe: `Pack ${amount}g of bone-dry SCG into breathable non-woven pouches (${Math.max(1, Math.floor(amount / 20))} sachets × 20g each).`,
				supporting,
				limiting,
				remediation:
					form.moistureCondition !== 'Dry'
						? 'Oven-dry at 105°C until constant mass before sealing into desiccant packets.'
						: undefined,
				citation: 'Moussa et al. (2022);'
			});
		}

		results = evaluatedPathways.sort((a, b) => {
			if (form.intendedApp !== 'Explore All Applications') {
				if (a.id === form.intendedApp) return -1;
				if (b.id === form.intendedApp) return 1;
			}
			return b.score - a.score;
		});

		recId = `REC-${Date.now().toString().slice(-6)}`;
		saved = false;

		setTimeout(() => {
			document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
		}, 50);
	}

	function saveRecommendation() {
	if (!results) return;

	const formSnapshot = $state.snapshot(form);
	const resultsSnapshot = $state.snapshot(results);

	experimentStore.update((list) => [
		{
			id: recId,
			batch: `${form.coffeeBlend} · ${form.scgAmount}g`,
			package: '',
			start: new Date().toLocaleDateString('en-US', {
				month: 'short',
				day: '2-digit',
				year: 'numeric'
			}),
			status: 'Complete',
			form: formSnapshot,
			results: resultsSnapshot
		},
		...list
	]);
	saved = true;
}


// This is for popup when use exits bifor change
beforeNavigate(({ cancel, to, willUnload }) => {
	if (leaving || !results || saved) return;
	cancel();
	if (willUnload) return;
	pendingUrl = to?.url ?? null;
	showLeaveModal = true;
});

function stay() {
	showLeaveModal = false;
	pendingUrl = null;
}

async function leaveWithoutSaving() {
	leaving = true;
	showLeaveModal = false;
	if (pendingUrl) await goto(pendingUrl);
}

async function saveAndLeave() {
	saveRecommendation();
	await leaveWithoutSaving();
}
</script>

{#snippet checkGroup(label: string, group: Group, options: string[])}
	<div class="md:col-span-2">
		<h2 class="mb-4 text-2xl font-semibold text-caramel">
			{label}
			{#if group === 'contamination'}
				<span class="text-danger ml-0.5" aria-hidden="true">*</span>
			{/if}
		</h2>
		<fieldset class="coffee-fieldset rounded-lg p-4">
			<legend class="sr-only">{label}</legend>
			<div class="flex flex-wrap gap-x-8 gap-y-2.5">
				{#each options as option (option)}
					<label class="coffee-check-label flex cursor-pointer items-center gap-2 text-cream">
						<input
							class="coffee-checkbox"
							type="checkbox"
							checked={form[group].includes(option)}
							onchange={() => toggleOption(group, option)}
						/>
						{option}
					</label>
				{/each}
			</div>
		</fieldset>
	</div>
{/snippet}

<!-- Page Content -->
<PageHeader pageTitle="Recommend" description="Get a recommendation for reusing your SCG" />

<form onsubmit={handleSubmit} class="coffee-form mt-16 px-12 pb-12">
	<div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
		<div class="md:col-span-2">
			<InputField
				id="intended_app"
				label="Intended Application (Target Goal)"
				component="select"
				bind:value={form.intendedApp}
			>
				{#each intendedApplications as option (option)}
					<option value={option}>{option}</option>
				{/each}
			</InputField>
		</div>

		<InputField
			id="coffee_blend"
			label="Coffee Blend"
			component="select"
			required
			bind:value={form.coffeeBlend}
		>
			{#each coffeeBlends as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		<InputField
			id="brewing_cycles"
			label="Brewing Cycle"
			component="select"
			required
			bind:value={form.brewingCycles}
		>
			{#each brewingCycles as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		<InputField
			id="brewing_method"
			label="Brewing Method"
			component="select"
			required
			bind:value={form.brewingMethod}
		>
			{#each brewingMethods as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		<InputField
			id="ground_size"
			label="Ground Size"
			component="select"
			required
			bind:value={form.groundSize}
		>
			{#each groundSizes as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		<InputField
			id="moisture_condition"
			label="Moisture Condition"
			component="select"
			required
			bind:value={form.moistureCondition}
		>
			{#each moistureConditions as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		<InputField
			id="scg_amount"
			type="number"
			inputmode="numeric"
			label="SCG Amount (grams)"
			required
			min={1}
			placeholder="Enter amount in grams (e.g. 250)"
			bind:value={form.scgAmount}
			onkeydown={(e) => {
				if (['e', 'E', '+', '-'].includes(e.key)) {
					e.preventDefault();
				}
			}}
			oninput={(e) => {
				const target = e.currentTarget as HTMLInputElement;
				target.value = target.value.replace(/[^0-9.]/g, '');
				form.scgAmount = target.value;
			}}
		/>

		<InputField
			id="storage_duration"
			label="Storage Duration"
			component="select"
			required
			bind:value={form.storageDuration}
		>
			{#each storageDurations as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		<InputField
			id="processing_state"
			label="Processing State"
			component="select"
			required
			bind:value={form.processingState}
		>
			{#each processingStates as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		<InputField
			id="drying_condition"
			label="Drying Condition"
			component="select"
			required
			bind:value={form.dryingCondition}
		>
			{#each dryingConditions as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		<InputField
			id="composting_status"
			label="Composting Status"
			component="select"
			required
			bind:value={form.compostingStatus}
		>
			{#each compostingStatuses as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</InputField>

		{@render checkGroup('Visible Contamination', 'contamination', contaminationOptions)}
		{@render checkGroup('Materials Mixed in', 'materials', materialOptions)}
		{@render checkGroup('Available Equipment', 'equipment', equipmentOptions)}
	</div>

	<div class="mt-12 flex justify-between">
		<BasicButton type="button" onclick={resetForm} variant="danger">Reset</BasicButton>
		<BasicButton type="submit" disabled={!isFormValid}>Get Recommendation</BasicButton>
	</div>
</form>

<!-- Recommendation results -->
{#if results}
	<section id="results-section" class="mt-4 px-12 pb-20 font-serif">
		<div class="mb-8 border-t-2 border-[#6e4833] pt-8">
			<h2 class="text-3xl font-bold text-caramel">Assessment & Application Recommendations</h2>
			<p class="mt-1 text-cream/80">
				Evaluated for <strong>{form.scgAmount}g</strong> of <strong>{form.coffeeBlend}</strong> SCG ({form.moistureCondition},
				{form.processingState})
			</p>
		</div>

		{#if summaryStats}
			<div class="mb-8 grid grid-cols-1 gap-8 rounded-xl border-2 border-[#6e4833] bg-[#4a2e20] p-6 lg:grid-cols-12">
				<div class="flex flex-col items-center justify-center gap-6 sm:flex-row lg:col-span-7">
					<div class="relative flex h-44 w-44 shrink-0 items-center justify-center rounded-full shadow-md" style="background: {summaryStats.pathwayGradient}">
						<div class="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#362016] text-center shadow-inner">
							<span class="text-[0.65rem] tracking-wider uppercase text-cream/60">Top Score</span>
							<span class="text-xl font-bold text-caramel">{summaryStats.topMatch.score}%</span>
						</div>
					</div>

					<div class="w-full space-y-2">
						<h3 class="text-lg font-bold text-caramel">
							Application Suitability Share
						</h3>
						<p class="text-xs text-cream/70">
							Relative suitability distribution across all 6 evaluated pathways:
						</p>
						<div class="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
							{#each summaryStats.pathwaySlices as slice (slice.id)}
								<div class="flex items-center justify-between gap-2 rounded bg-[#362016]/60 px-2.5 py-1 text-xs">
									<div class="flex items-center gap-2 truncate">
										<span
											class="h-3 w-3 shrink-0 rounded-sm"
											style="background-color: {slice.color}"
										></span>
										<span class="truncate text-cream">{slice.title}</span>
									</div>
									<span class="shrink-0 font-mono font-semibold text-caramel">
										{slice.score}% <span class="text-cream/50">({slice.sharePercent}%)</span>
									</span>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Right: High / Moderate / Low Tier Pie Chart -->
				<div class="flex flex-col items-center justify-center gap-6 border-t border-[#6e4833]/60 pt-6 sm:flex-row lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
					<div class="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full shadow-md" style="background: {summaryStats.tierGradient}">
						<div class="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-[#362016] text-center shadow-inner">
							<span class="text-[0.6rem] tracking-wider uppercase text-cream/60">Avg Fit</span>
							<span class="text-lg font-bold text-cream">{summaryStats.avgScore}%</span>
						</div>
					</div>

					<div class="w-full space-y-2">
						<h3 class="text-lg font-bold text-caramel">Suitability Breakdown</h3>
						<div class="space-y-1.5 text-xs">
							<div class="flex items-center justify-between rounded bg-[#362016]/60 px-3 py-1.5">
								<span class="flex items-center gap-2 text-cream">
									<span class="h-3 w-3 rounded-full bg-[#5c996e]"></span>
									High Suitability (≥75%)
								</span>
								<span class="font-bold text-[#9be0af]">{summaryStats.highCount} / 6</span>
							</div>
							<div class="flex items-center justify-between rounded bg-[#362016]/60 px-3 py-1.5">
								<span class="flex items-center gap-2 text-cream">
									<span class="h-3 w-3 rounded-full bg-[#d4a373]"></span>
									Moderate (45–74%)
								</span>
								<span class="font-bold text-caramel">{summaryStats.modCount} / 6</span>
							</div>
							<div class="flex items-center justify-between rounded bg-[#362016]/60 px-3 py-1.5">
								<span class="flex items-center gap-2 text-cream">
									<span class="h-3 w-3 rounded-full bg-[#b84a39]"></span>
									Low Suitability (&lt;45%)
								</span>
								<span class="font-bold text-[#f29b94]">{summaryStats.lowCount} / 6</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			{#each results as item, index (item.id)}
				{@const isIntended = form.intendedApp === item.id}
				<div
					class="flex flex-col justify-between rounded-xl border-2 p-6 transition-all {isIntended
						? 'border-caramel bg-[#523322] lg:col-span-2'
						: 'border-[#6e4833] bg-[#4a2e20]'}"
				>
					<div>

						<div class="flex flex-wrap items-start justify-between gap-4">
							<div>
								{#if isIntended}
									<span
										class="mb-1 inline-block rounded bg-caramel px-2.5 py-0.5 text-xs font-bold uppercase text-[#2b1810]"
									>
										Your Intended Application
									</span>
								{:else if index === 0 || (form.intendedApp !== 'Explore All Applications' && index === 1)}
									<span
										class="mb-1 inline-block rounded bg-[#34593f] px-2.5 py-0.5 text-xs font-semibold text-cream"
									>
										Top Recommended Match
									</span>
								{/if}
								<h3 class="text-2xl font-bold text-caramel">{item.title}</h3>
							</div>

							<div class="text-right">
								<span
									class="inline-block rounded-lg px-3 py-1 text-sm font-bold {item.level === 'High'
										? 'bg-[#34593f] text-cream'
										: item.level === 'Moderate'
											? 'bg-[#8a6229] text-cream'
											: 'bg-[#6e2b25] text-cream'}"
								>
									{item.score}% — {item.level} Suitability
								</span>
								<!-- <div class="mt-1 font-mono text-[0.7rem] text-cream/60">
									Sugeno: {item.sugenoWeights}
								</div> -->
							</div>
						</div>

						<!-- <div class="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#2e1b12]">
							<div
								class="h-full transition-all duration-500 {item.level === 'High'
									? 'bg-[#5c996e]'
									: item.level === 'Moderate'
										? 'bg-[#d4a373]'
										: 'bg-[#b84a39]'}"
								style="width: {item.score}%"
							></div>
						</div> -->

						<div class="mt-5 rounded-lg border border-[#875940] bg-[#362016]/80 p-4">
							<!-- <div class="flex items-center justify-between border-b border-[#6e4833]/50 pb-2">
								<span class="text-xs font-bold tracking-wider uppercase text-caramel">
									Linear Regression Model Output
								</span>
								<code class="rounded bg-[#2b1810] px-2 py-0.5 font-mono text-xs text-cream/90">
									{item.regressionFormula}
								</code>
							</div> -->

							<div class="mt-2.5 flex flex-wrap items-baseline justify-between gap-2">
								<div>
									<div class="text-xs text-cream/70">{item.predictionLabel}</div>
									<div class="text-2xl font-bold text-cream">{item.predictionValue}</div>
								</div>
								<!-- <div class="text-right font-mono text-xs text-cream/75">
									{item.regressionInputs}
								</div> -->
							</div>
						</div>

						<div class="mt-4 rounded-lg bg-[#3d2519] p-3 text-sm text-cream/95">
							<strong class="text-caramel">Preparation & Ratio Guide:</strong>
							{item.recipe}
						</div>

						<div class="mt-4 space-y-2 text-sm">
							{#each item.supporting as reason (reason)}
								<div class="flex items-start gap-2 text-[#9be0af]">
									<span>✓</span>
									<span>{reason}</span>
								</div>
							{/each}
							{#each item.limiting as reason (reason)}
								<div class="flex items-start gap-2 text-[#f29b94]">
									<span>✕</span>
									<span>{reason}</span>
								</div>
							{/each}
						</div>

						{#if item.remediation}
							<div
								class="mt-4 rounded-lg border border-caramel/40 bg-caramel/10 p-3 text-sm text-cream"
							>
								<strong class="text-caramel">How to Improve Suitability:</strong>
								{item.remediation}
							</div>
						{/if}
					</div>

					<div class="mt-5 border-t border-[#6e4833]/60 pt-2.5 text-xs text-cream/60">
						Reference Basis: {item.citation}
					</div>
				</div>
			{/each}
		</div>

		{#if form.intendedApp !== 'Explore All Applications'}
			<div class="mt-6 text-sm text-cream/70">
				Note: The recommendation for your intended application is highlighted above. Other pathways are also evaluated for comparison.
			</div>
{/if}

				<!-- Save bar: very bottom of the results -->
		<div class="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 border-[#6e4833] bg-[#4a2e20] p-5">
			<div>
				<h3 class="text-lg font-bold text-caramel">
					{saved ? 'Recommendation saved' : 'Save this recommendation?'}
				</h3>
				<p class="text-sm text-cream/70">
					{saved
						? 'It has been added to your history.'
						: 'Save it to your history so you can view it later.'}
				</p>
			</div>
			<div class="flex items-center gap-3">
				{#if saved}
					<BasicButton type="button" onclick={() => goto(resolve('/(app)/history'))}>
						View History
					</BasicButton>
				{:else}
					<BasicButton type="button" onclick={saveRecommendation}>
						Save Recommendation
					</BasicButton>
				{/if}
			</div>
		</div>
	</section>
{/if}

		{#if showLeaveModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="leave-title"
	>
		<div class="w-full max-w-md rounded-xl border-2 border-[#6e4833] bg-[#4a2e20] p-6">
			<h3 id="leave-title" class="text-xl font-bold text-caramel">Leave without saving?</h3>
			<p class="mt-2 text-sm text-cream/80">
				This recommendation hasn't been saved to your history. If you leave now, it will be lost.
			</p>
			<div class="mt-6 flex flex-wrap justify-end gap-3">
				<BasicButton type="button" variant="danger" onclick={leaveWithoutSaving}>
					Leave without saving
				</BasicButton>
				<BasicButton type="button" onclick={stay}>Stay</BasicButton>
				<BasicButton type="button" onclick={saveAndLeave}>Save & leave</BasicButton>
			</div>
		</div>
	</div>
{/if}

<style>
	.coffee-form {
		margin: 0 auto;
	}

	.coffee-fieldset {
		background-color: #4a2e20;
		border: 2px solid #6e4833;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.coffee-fieldset:hover {
		border-color: #875940;
	}

	.coffee-fieldset:focus-within {
		border-color: #d4a373;
		box-shadow: 0 0 0 2px rgba(212, 163, 115, 0.2);
	}

	.coffee-check-label {
		font-size: 1.05rem;
		user-select: none;
	}

	.coffee-checkbox {
		appearance: none;
		-webkit-appearance: none;
		width: 1.15rem;
		height: 1.15rem;
		background-color: #5c3a28;
		border: 1.5px solid #8c6249;
		border-radius: 0.25rem;
		cursor: pointer;
		display: inline-grid;
		place-content: center;
		transition: all 0.15s ease;
	}

	.coffee-checkbox:hover {
		border-color: #d4a373;
		background-color: #69432f;
	}

	.coffee-checkbox:checked {
		background-color: #d4a373;
		border-color: #d4a373;
	}

	.coffee-checkbox:checked::before {
		content: '';
		width: 0.65rem;
		height: 0.65rem;
		transform: scale(1);
		background-color: #362016;
		clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
	}
</style>