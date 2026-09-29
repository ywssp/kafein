import { UserRoles } from "../../../generated/prisma/enums";

const roleStrings: Record<UserRoles, string> = {
  [UserRoles.ADMIN]: 'Administrator',
  [UserRoles.MANAGER]: 'Manager',
  [UserRoles.DOCTOR]: 'Doctor',
  [UserRoles.INVENTORY]: 'Inventory Manager',
  [UserRoles.SALES]: 'Sales Staff'
}

export function roleToReadable(role: UserRoles | undefined) {
  if (!role) return 'Anonymous User';

  return roleStrings[role];
}