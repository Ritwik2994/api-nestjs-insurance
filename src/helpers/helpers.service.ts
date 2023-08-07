import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from 'crypto';
import NodeRSA from 'node-rsa';

import { ResponseMessage } from '../shared/constants/ResponseMessage';
import { argon2hash } from './argon/argon';
import { ResponseHandlerModel } from '../shared/model/response-handler.model';

@Injectable()
export class HelpersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly responseHandlerService: ResponseHandlerModel
  ) {}

  /**
   * @description This is the function for decrypting the encrypted password
   * @param encryptedPassword It takes encryptedPassword as an argument
   * @returns it will return decrypted password in response
   * @author Ritwik Rohitashwa
   */
  async decryptPassword(encryptedPassword: string): Promise<string> {
    const privateKeyData = this.configService.get('RSA_PRIVATE_KEY');
    const formattedPrivateKey = privateKeyData.replace(/\\n/g, '\n');
    try {
      const privateKey = new NodeRSA(formattedPrivateKey);
      return privateKey.decrypt(encryptedPassword, 'utf8');
    } catch (err) {
      this.responseHandlerService.error(ResponseMessage.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * @description This method generates hashed password
   * @param password It takes password as an argument
   * @returns {Promise<string>} - Returns a promise that resolves with the hashed password.
   * @author Ritwik Rohitashwa
   */
  async getHashedPassword(password: string): Promise<string> {
    return argon2hash(password);
  }

  /**
   * @description The function encrypts data using AES-256-CBC encryption with a randomly generated salt and
   * initialization vector (IV), and returns the encrypted data concatenated with the salt and IV.
   * @param data - The `data` parameter is the data that you want to encrypt. It can be any type of
   * data, but it will be converted to a string using the `toString()` method before encryption.
   * @returns a string that consists of the salt, iv, and the encrypted data, all converted to
   * hexadecimal format.
   * @author Ritwik Rohitashwa
   */
  async encryptData(data) {
    const secretKey = process.env.SECRET_KEY;
    const salt = randomBytes(16);
    const key = await this.deriveKey(secretKey, salt);
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return salt.toString('hex') + iv.toString('hex') + encrypted;
  }

  async decryptData(data) {
    const secretKey = process.env.SECRET_KEY;
    const salt = Buffer.from(data.slice(0, 32), 'hex');
    const iv = Buffer.from(data.slice(32, 64), 'hex');
    const cipherText = data.slice(64);
    const key = await this.deriveKey(secretKey, salt);
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async deriveKey(passphrase, salt) {
    return pbkdf2Sync(passphrase, salt, 100000, 32, 'sha256');
  }

  searchData(data: string) {
    return { $regex: new RegExp(`^${data}$`, 'i') };
  }

  async makeQuery(nextPageToken: string): Promise<{ query: Object }> {
    const query = {};
    if (nextPageToken) {
      const lastDocumentId = await this.decryptData(nextPageToken);
      query['_id'] = { $gte: lastDocumentId };
    }

    return { query };
  }

  async generateNextPageToken(data, limit: number): Promise<string> {
    if (data.length > limit) {
      const lastDocumentId = data[limit]._id;
      // Generate the hash for the next page using the last document ID
      return await this.encryptData(lastDocumentId); // Generate the hash based on the lastDocumentId
    }
    return null;
  }

  async makeUniqueSlug(inputString, existingSlugs = new Set()) {
    // Replace spaces with hyphens and convert to lowercase
    let slug = inputString.trim().replace(/\s+/g, '-').toLowerCase();

    // Check if the slug is already taken
    let counter = 1;
    let originalSlug = slug;
    while (existingSlugs.has(slug)) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
