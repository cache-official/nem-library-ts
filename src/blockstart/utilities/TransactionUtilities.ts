/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 NEM
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Mosaic } from '../../models/mosaic/Mosaic';
import { XEM } from '../../models/mosaic/XEM';
import { MultisigTransaction } from '../../models/transaction/MultisigTransaction';
import { Transaction } from '../../models/transaction/Transaction';
import { TransactionTypes } from '../../models/transaction/TransactionTypes';
import { BTransferTransaction } from '../models/bTransferTransaction';

/**
 * Filters a list of Transactions and only returns transactions of type Transfer
 * @param {Transaction} transaction
 * @returns {boolean} isTransferTransaction
 */
export const transferFilter = (transaction: Transaction): boolean => {
  if (transaction.type == TransactionTypes.TRANSFER) {
    return true;
  } else if (transaction.type == TransactionTypes.MULTISIG && (transaction as MultisigTransaction).otherTransaction.type == TransactionTypes.TRANSFER) {
    return true;
  }
  return false;
};

/**
 * Parses through list of transactions and casts them to CacheTransferTransaction so we
 * can have access to important transfer details
 * @param {Transaction} transaction
 * @returns {TransferTransaction}
 */
export const mapTransfer = (transaction: Transaction): BTransferTransaction => {
  let mosaics: Array<Mosaic> = [];
  let xem: XEM = new XEM(1);
  if (transaction.type === TransactionTypes.TRANSFER) {
    const transferTX = transaction as BTransferTransaction;
    if (transferTX.containsMosaics()) {
      mosaics = transferTX.mosaics();
    } else {
      xem = transferTX.xem();
    }
    let transactionInfo;
    if (transferTX.isConfirmed()) {
      transactionInfo = transferTX.getTransactionInfo();
    }
    return new BTransferTransaction(transferTX.recipient, xem, transferTX.timeWindow,
      transferTX.version, transferTX.fee, transferTX.message, transferTX.signature, mosaics,
      transferTX.signer, transactionInfo
    );
  } else if (transaction.type === TransactionTypes.MULTISIG && (transaction as MultisigTransaction).otherTransaction.type === TransactionTypes.TRANSFER) {
    const transferTX = (transaction as MultisigTransaction).otherTransaction as BTransferTransaction;
    if (transferTX.containsMosaics()) {
      mosaics = transferTX.mosaics();
    } else {
      xem = transferTX.xem();
    }
    let transactionInfo;
    if (transferTX.isConfirmed()) {
      transactionInfo = transferTX.getTransactionInfo();
    }
    return new BTransferTransaction(transferTX.recipient, xem, transferTX.timeWindow,
      transferTX.version, transferTX.fee, transferTX.message, transferTX.signature, mosaics,
      transferTX.signer, transactionInfo
    );
  }
  throw new Error("Transaction does not contain TransferTransaction");
};
