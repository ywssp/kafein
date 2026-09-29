import { ProductCategories } from '../../../generated/prisma/enums';

export const expirableCategories: ProductCategories[] = [
	ProductCategories.CONTACT_LENS_SOLUTIONS,
	ProductCategories.SOLUTIONS,
	ProductCategories.CONTACT_LENSES,
	ProductCategories.LENS_CLEANERS
];

export const nonExpirableCategories: ProductCategories[] =
  Object.values(ProductCategories)
    .filter(
      (category) =>
        !expirableCategories.includes(category)
);

export function isProductCategoryExpirable(category: ProductCategories) {
	return expirableCategories.includes(category);
}
