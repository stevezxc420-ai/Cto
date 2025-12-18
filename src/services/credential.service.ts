import { PrismaClient } from '@prisma/client';
import { EncryptionService } from './encryption.service';
import { ValidationService, ApiProvider } from './validation.service';

const prisma = new PrismaClient();

export interface CreateCredentialInput {
  userId: string;
  provider: ApiProvider;
  apiKey: string;
  keyName?: string;
}

export interface CredentialResponse {
  id: string;
  userId: string;
  provider: string;
  keyName?: string;
  maskedKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CredentialService {
  private encryptionService: EncryptionService;

  constructor(encryptionService: EncryptionService) {
    this.encryptionService = encryptionService;
  }

  async createCredential(input: CreateCredentialInput): Promise<CredentialResponse> {
    const validation = ValidationService.validateApiKey(input.provider, input.apiKey);
    
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid API key');
    }

    const encryptedKey = this.encryptionService.encrypt(input.apiKey);

    const credential = await prisma.credential.create({
      data: {
        userId: input.userId,
        provider: input.provider,
        encryptedKey,
        keyName: input.keyName || null,
      },
    });

    return this.toResponse(credential, input.apiKey);
  }

  async listCredentials(userId: string): Promise<CredentialResponse[]> {
    const credentials = await prisma.credential.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return credentials.map(credential => {
      const decryptedKey = this.encryptionService.decrypt(credential.encryptedKey);
      return this.toResponse(credential, decryptedKey);
    });
  }

  async getCredential(id: string, userId: string): Promise<CredentialResponse | null> {
    const credential = await prisma.credential.findFirst({
      where: { id, userId },
    });

    if (!credential) {
      return null;
    }

    const decryptedKey = this.encryptionService.decrypt(credential.encryptedKey);
    return this.toResponse(credential, decryptedKey);
  }

  async deleteCredential(id: string, userId: string): Promise<boolean> {
    try {
      await prisma.credential.delete({
        where: { 
          id,
          userId,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getDecryptedKey(id: string, userId: string): Promise<string | null> {
    const credential = await prisma.credential.findFirst({
      where: { id, userId },
    });

    if (!credential) {
      return null;
    }

    return this.encryptionService.decrypt(credential.encryptedKey);
  }

  private toResponse(credential: any, decryptedKey: string): CredentialResponse {
    return {
      id: credential.id,
      userId: credential.userId,
      provider: credential.provider,
      keyName: credential.keyName || undefined,
      maskedKey: this.encryptionService.maskKey(decryptedKey),
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    };
  }
}
