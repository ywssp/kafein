import { ProductCategories } from '../../../generated/prisma/enums';

type ProductCategoryColors = {
	[category in ProductCategories]: string;
};

export const categoryStyles: ProductCategoryColors = {
	[ProductCategories.HARDCASES]: 'bg-amber-50 text-amber-700 border-amber-200',
	[ProductCategories.GLASSES]: 'bg-blue-50 text-blue-700 border-blue-200',
	[ProductCategories.CONTACT_LENSES]: 'bg-green-50 text-green-700 border-green-200',
	[ProductCategories.LENS]: 'bg-purple-50 text-purple-700 border-purple-200',
	[ProductCategories.FRAMES]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
	[ProductCategories.CUSTOM_GLASSES]: 'bg-pink-50 text-pink-700 border-pink-200',
	[ProductCategories.CORDS]: 'bg-gray-50 text-gray-700 border-gray-200',
	[ProductCategories.LENS_CLEANERS]: 'bg-teal-50 text-teal-700 border-teal-200',
	[ProductCategories.SOLUTIONS]: 'bg-cyan-50 text-cyan-700 border-cyan-200',
	[ProductCategories.CONTACT_LENS_SOLUTIONS]: 'bg-emerald-50 text-emerald-700 border-emerald-200'
};


export function getProductCategoryColor(category: ProductCategories): string {
  return categoryStyles[category] || 'bg-gray-50 text-gray-700 border-gray-200';
}