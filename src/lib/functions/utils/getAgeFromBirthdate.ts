export function getAgeFromBirthdate(birthdate: Date | string) {
  const today = new Date();
  const birth = new Date(birthdate);

  let yearDiff = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    yearDiff--;
  }

  return yearDiff;
}