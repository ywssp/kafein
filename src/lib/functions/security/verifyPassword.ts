import bcrypt from 'bcrypt';

export async function verifyPassword(
  plaintextPassword: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(plaintextPassword, hash);
}