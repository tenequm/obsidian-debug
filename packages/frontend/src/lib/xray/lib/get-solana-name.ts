import { publicKeyMappings } from "../config";

// @ts-expect-error
export const getSolanaName = (publicKey) => publicKeyMappings[publicKey];
