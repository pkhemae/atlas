import { createHash, randomBytes } from 'node:crypto'

export class TokenUtils {
  /**
   * Generates a random plaintext token (hex encoded).
   */
  static generateToken(byteSize = 20) {
    return randomBytes(byteSize).toString('hex')
  }

  /**
   * Hashes a token for at-rest storage — only the hash ever
   * touches the database, the plaintext goes to the user.
   */
  static hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex')
  }
}
