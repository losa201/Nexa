// api/src/auth-did.ts
import { Resolver } from 'did-resolver';
import { get3IDResolver } from '@ceramicnetwork/3id-did-resolver';
import { verifyJWT } from 'did-jwt';
import { Request, Response, NextFunction } from 'express';

const ceramicResolver = get3IDResolver({ ceramic: process.env.CERAMIC_URL! });
const resolver = new Resolver(ceramicResolver);

/**
 * Middleware to validate a DID JWT.
 * Expects an Authorization header: "Bearer <DID_JWT>".
 * On success, sets req.did to the verified issuer DID.
 */
export async function checkDIDJwt(
  req: Request & { did?: string },
  res: Response,
  next: NextFunction
) {
  try {
    const auth = req.headers.authorization;
    if (!auth) throw new Error('Missing Authorization header');
    const token = auth.split(' ')[1];
    if (!token) throw new Error('Malformed Authorization header');

    const verified = await verifyJWT(token, { resolver });
    req.did = verified.issuer; // e.g. "did:3:..."
    next();
  } catch (err: any) {
    console.error('DID auth error:', err);
    res.status(401).json({ error: 'Invalid DID token' });
  }
}
