import { Router, Request, Response } from 'express';
import { CredentialService } from '../services/credential.service';
import { EncryptionService } from '../services/encryption.service';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { validateBody, createCredentialSchema } from '../middleware/validation.middleware';

const router = Router();

const encryptionKey = process.env.ENCRYPTION_KEY;
if (!encryptionKey) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

const encryptionService = new EncryptionService(encryptionKey);
const credentialService = new CredentialService(encryptionService);

router.post(
  '/credentials',
  validateBody(createCredentialSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, provider, apiKey, keyName } = req.body;

    const credential = await credentialService.createCredential({
      userId,
      provider,
      apiKey,
      keyName,
    });

    res.status(201).json({
      success: true,
      data: credential,
    });
  })
);

router.get(
  '/credentials/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
      throw new AppError('userId is required', 400);
    }

    const credentials = await credentialService.listCredentials(userId);

    res.status(200).json({
      success: true,
      data: credentials,
    });
  })
);

router.delete(
  '/credentials/:userId/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, id } = req.params;

    if (!userId || !id) {
      throw new AppError('userId and id are required', 400);
    }

    const deleted = await credentialService.deleteCredential(id, userId);

    if (!deleted) {
      throw new AppError('Credential not found or already deleted', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Credential deleted successfully',
    });
  })
);

router.get(
  '/credentials/:userId/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, id } = req.params;

    if (!userId || !id) {
      throw new AppError('userId and id are required', 400);
    }

    const credential = await credentialService.getCredential(id, userId);

    if (!credential) {
      throw new AppError('Credential not found', 404);
    }

    res.status(200).json({
      success: true,
      data: credential,
    });
  })
);

export default router;
