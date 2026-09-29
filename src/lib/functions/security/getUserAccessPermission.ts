  import { UserRoles } from "../../../generated/prisma/client";

export type AccessSection = 'patients' | 'transactions' | 'inventory' | 'appointments' | 'archive' | 'maintenance';
export enum AccessPermission {
  ENHANCED = 2,
  FULL = 1,
  READ = 0,
  NONE = -1
}
export type PermissionMap  = Record<AccessSection, AccessPermission>;

const roleAccessPermissions: Record<UserRoles, PermissionMap> = {
  [UserRoles.ADMIN]: {
    archive: AccessPermission.FULL,
    maintenance: AccessPermission.FULL,
    
		patients: AccessPermission.READ,
		transactions: AccessPermission.READ,
		inventory: AccessPermission.READ,
		appointments: AccessPermission.READ,
	},
	[UserRoles.MANAGER]: {
		patients: AccessPermission.ENHANCED,
		transactions: AccessPermission.ENHANCED,
		inventory: AccessPermission.ENHANCED,
		appointments: AccessPermission.ENHANCED,

		archive: AccessPermission.FULL,

		maintenance: AccessPermission.READ
	},
	[UserRoles.DOCTOR]: {
    patients: AccessPermission.FULL,
    
		appointments: AccessPermission.READ	,

		transactions: AccessPermission.NONE,
		inventory: AccessPermission.NONE,
		archive: AccessPermission.NONE,
		maintenance: AccessPermission.NONE
	},
	[UserRoles.INVENTORY]: {
		inventory: AccessPermission.FULL,

		transactions: AccessPermission.READ,

		patients: AccessPermission.NONE,
		appointments: AccessPermission.NONE,
		archive: AccessPermission.NONE,
		maintenance: AccessPermission.NONE
	},
	[UserRoles.SALES]: {
		transactions: AccessPermission.FULL,
		appointments: AccessPermission.FULL,
		patients: AccessPermission.FULL,

		inventory: AccessPermission.READ,

		archive: AccessPermission.NONE,
		maintenance: AccessPermission.NONE
	}
} as const;

  export function canRoleAccess(options: {role?: UserRoles, section: AccessSection}): AccessPermission {
    const { role, section } = options;

  if (!role) return AccessPermission.NONE;

    return roleAccessPermissions[role][section];
  }

  export function getAccessibleSections(role: UserRoles): AccessSection[] {
    const accessibleSections: AccessSection[] = [];

  for (const [section, permission] of Object.entries(roleAccessPermissions[role])) {
    if (permission !== AccessPermission.NONE) {
      accessibleSections.push(section as AccessSection);
    }
  }

    return accessibleSections;
  }