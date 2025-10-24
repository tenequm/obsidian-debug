import type { EnrichedTransaction } from "helius-sdk";
import { Source, type TransactionType } from "helius-sdk";
import * as parser from "./parsers";

export const SOL = "So11111111111111111111111111111111111111112";

export enum ProtonSupportedType {
  BURN = 0,
  BURN_NFT = 1,
  NFT_BID = 2,
  NFT_BID_CANCELLED = 3,
  NFT_CANCEL_LISTING = 4,
  NFT_LISTING = 5,
  NFT_SALE = 6,
  NFT_MINT = 7,
  SWAP = 8,
  TRANSFER = 9,
  UNKNOWN = 10,
  BORROW_FOX = 11,
  LOAN_FOX = 12,
  TOKEN_MINT = 13,
  EXECUTE_TRANSACTION = 14,
  COMPRESSED_NFT_MINT = 15,
  COMPRESSED_NFT_TRANSFER = 16,
  COMPRESSED_NFT_UPDATE_METADATA = 17,
  APPROVE_TRANSACTION = 18,
  STAKE_SOL = 19,
  SFT_MINT = 20,
  OFFER_LOAN = 21,
  RESCIND_LOAN = 22,
  TAKE_LOAN = 23,
  REPAY_LOAN = 24,
  ADD_ITEM = 25,
  UPDATE_ITEM = 26,
  CANCEL_OFFER = 27,
  LEND_FOR_NFT = 28,
  REQUEST_LOAN = 29,
  CANCEL_LOAN_REQUEST = 30,
  BORROW_SOL_FOR_NFT = 31,
  REBORROW_SOL_FOR_NFT = 32,
  CLAIM_NFT = 33,
  UPDATE_OFFER = 34,
  FORECLOSE_LOAN = 35,
  STAKE_TOKEN = 36,
  UNSTAKE_TOKEN = 37,
  BUY_ITEM = 38,
  CLOSE_ITEM = 39,
  CLOSE_ORDER = 40,
  DELIST_ITEM = 41,
  LIST_ITEM = 42,
  CANCEL_ORDER = 43,
  CREATE_ORDER = 44,
  UPDATE_ORDER = 45,
  FILL_ORDER = 46,
  UPGRADE_FOX_REQUEST = 47,
  MIGRATE_TO_PNFT = 48,
  COMPRESSED_NFT_BURN = 49,
}

export enum ProtonSupportedActionType {
  SENT = 0,
  RECEIVED = 1,
  TRANSFER = 2,
  TRANSFER_SENT = 3,
  TRANSFER_RECEIVED = 4,
  SWAP = 5,
  SWAP_SENT = 6,
  SWAP_RECEIVED = 7,
  UNKNOWN = 8,
  NFT_SALE = 9,
  NFT_BUY = 10,
  NFT_SELL = 11,
  NFT_LISTING = 12,
  NFT_CANCEL_LISTING = 13,
  NFT_BID = 14,
  NFT_BID_CANCELLED = 15,
  NFT_GLOBAL_BID = 16,
  NFT_MINT = 17,
  AIRDROP = 18,
  BURN = 19,
  BURN_NFT = 20,
  FREEZE = 21,
  TOKEN_MINT = 22,
  BORROW_FOX = 23,
  LOAN_FOX = 24,
  EXECUTE_TRANSACTION = 25,
  XNFT_INSTALL = 26,
  XNFT_UNINSTALL = 27,
  COMPRESSED_NFT_MINT = 28,
  COMPRESSED_NFT_TRANSFER = 29,
  COMPRESSED_NFT_UPDATE_METADATA = 30,
  APPROVE_TRANSACTION = 31,
  STAKE_SOL = 32,
  SFT_MINT = 33,
  OFFER_LOAN = 34,
  RESCIND_LOAN = 35,
  TAKE_LOAN = 36,
  REPAY_LOAN = 37,
  ADD_ITEM = 38,
  UPDATE_ITEM = 39,
  CANCEL_OFFER = 40,
  LEND_FOR_NFT = 41,
  REQUEST_LOAN = 42,
  CANCEL_LOAN_REQUEST = 43,
  BORROW_SOL_FOR_NFT = 44,
  REBORROW_SOL_FOR_NFT = 45,
  CLAIM_NFT = 46,
  UPDATE_OFFER = 47,
  FORECLOSE_LOAN = 48,
  STAKE_TOKEN = 49,
  UNSTAKE_TOKEN = 50,
  BUY_ITEM = 51,
  CLOSE_ITEM = 52,
  CLOSE_ORDER = 53,
  DELIST_ITEM = 54,
  LIST_ITEM = 55,
  CANCEL_ORDER = 56,
  CREATE_ORDER = 57,
  UPDATE_ORDER = 58,
  FILL_ORDER = 59,
  UPGRADE_FOX_REQUEST = 60,
  MIGRATE_TO_PNFT = 61,
  COMPRESSED_NFT_BURN = 62,
}

export const ProtonCustomActionLabelTypes = {
  AIRDROP: "Airdropped",
  BURN: "Burned",
  BURN_NFT: "Burned NFT",
  COMPRESSED_NFT_BURN: "Burned NFT",
  FREEZE: "Frozen",
  XNFT_INSTALL: "xNFT Install",
  XNFT_UNINSTALL: "xNFT Uninstall",
};

export type ProtonParser = (
  transaction: EnrichedTransaction,
  address?: string
) => ProtonTransaction;

export interface ProtonTransactionAction {
  actionType: ProtonActionType;
  from: string | null;
  to: string;
  sent?: string;
  received?: string;
  amount: number;
}

export interface ProtonTransaction {
  type: ProtonType | TransactionType | ProtonActionType;
  primaryUser: string;
  fee: number;
  signature: string;
  timestamp: number;
  source: Source;
  actions: ProtonTransactionAction[];
  accounts: ProtonAccount[];
  raw?: EnrichedTransaction;
  metadata?: { [key: string]: any };
}

export interface ProtonAccount {
  account: string;
  changes: ProtonAccountChange[];
}

export interface ProtonAccountChange {
  mint: string;
  amount: number;
}

export type ProtonParsers = Record<string, ProtonParser>;

export const unknownProtonTransaction: ProtonTransaction = {
  accounts: [],
  actions: [],
  fee: 0,
  primaryUser: "",
  signature: "",
  source: Source.SYSTEM_PROGRAM,
  timestamp: 0,
  type: "UNKNOWN",
};

export const protonParsers = {
  BORROW_FOX: parser.parseBorrowFox,
  BURN: parser.parseBurn,
  BURN_NFT: parser.parseBurn,
  COMPRESSED_NFT_BURN: parser.parseCompressedNftBurn,
  COMPRESSED_NFT_MINT: parser.parseCompressedNftMint,
  COMPRESSED_NFT_TRANSFER: parser.parseCompressedNftTransfer,
  EXECUTE_TRANSACTION: parser.parseTransfer,
  LOAN_FOX: parser.parseLoanFox,
  NFT_BID: parser.parseNftBid,
  NFT_BID_CANCELLED: parser.parseNftCancelBid,
  NFT_CANCEL_LISTING: parser.parseNftCancelList,
  NFT_GLOBAL_BID: parser.parseNftGlobalBid,
  NFT_LISTING: parser.parseNftList,
  NFT_MINT: parser.parseNftMint,
  NFT_SALE: parser.parseNftSale,
  SWAP: parser.parseSwap,
  TOKEN_MINT: parser.parseTokenMint,
  TRANSFER: parser.parseTransfer,
  UNKNOWN: parser.parseUnknown,
};

export type ProtonType = keyof typeof protonParsers;
export type ProtonActionType = keyof typeof ProtonSupportedActionType;
