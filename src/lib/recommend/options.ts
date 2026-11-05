export const NO_CONTAMINATION = 'No Contamination';
export const EXPLORE_ALL = 'Explore All Applications';

export const intendedApplications = [
  EXPLORE_ALL,
  'Compost & Soil Amendment',
  'Bio-Briquette Fuel',
  'Mushroom Cultivation',
  'Paper-Based Composite',
  'Natural Dye Extraction',
  'Bio-Based Desiccant'
];

export const coffeeBlends = ['Arabica', 'Robusta', 'Mixed', 'Unknown'];
export const brewingCycles = ['1 Time', '2 Times', '3 Times', 'More than 4 times'];
export const brewingMethods = ['Espresso', 'Drip', 'French Press', 'Pour Over', 'Not Indicated'];
export const groundSizes = ['Fine', 'Medium', 'Coarse', 'Unsure'];
export const moistureConditions = ['Wet', 'Damp', 'Slightly Moist', 'Dry'];
export const storageDurations = [
  'Freshly Collected',
  'Stored for a Few Hours',
  'Stored for 1-2 Days',
  'Stored for longer'
];
export const processingStates = ['Raw', 'Dried', 'Composted', 'Thermally Processed'];
export const dryingConditions = ['Not Dried', 'Air-Dried', 'Oven-Dried'];
export const compostingStatuses = ['Not Composted', 'Currently Composting', 'Fully Composted'];

export const contaminationOptions = [NO_CONTAMINATION, 'Mold', 'Foreign Materials', 'Unsure'];
export const materialOptions = ['Soil', 'Peat Moss', 'Manure', 'Paper Pulp', 'Sawdust'];
export const equipmentOptions = ['Oven', 'Sunlight', 'Grinder', 'Blender'];

export const defaultForm = () => ({
  intendedApp: intendedApplications[0],
  coffeeBlend: coffeeBlends[0],
  brewingCycles: brewingCycles[0],
  brewingMethod: brewingMethods[0],
  groundSize: groundSizes[0],
  moistureCondition: moistureConditions[0],
  measuredMoisture: '' as string | number,
  scgAmount: '' as string | number,
  storageDuration: storageDurations[0],
  processingState: processingStates[0],
  dryingCondition: dryingConditions[0],
  compostingStatus: compostingStatuses[0],
  contamination: [] as string[],
  materials: [] as string[],
  equipment: [] as string[]
});
