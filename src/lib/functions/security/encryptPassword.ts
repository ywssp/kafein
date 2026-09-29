import bcrypt from 'bcryptjs';

export async function encryptPassword(plaintextPassword: string): Promise<string> {
  const saltRounds = 10;

  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(plaintextPassword, salt);

  return hashedPassword;
}