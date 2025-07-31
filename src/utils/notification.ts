import { ITransaction } from '../modules/transaction/transaction.model';

export const NotificationService = {
  sendTransactionNotification: (transaction: ITransaction, eventType: string) => {
    console.log(`\n--- Notification: ${eventType} ---`);
    console.log(`Transaction ID: ${transaction.id}`);
    console.log(`Sender: ${transaction.sender}`);
    if (transaction.receiver) {
        console.log(`Receiver: ${transaction.receiver}`);
    }
    console.log(`Amount: ${transaction.amount}`);
    console.log(`Type: ${transaction.type}`);
    console.log(`Status: ${transaction.status}`);
    if (transaction.commission && transaction.commission > 0) {
        console.log(`Commission: ${transaction.commission.toFixed(2)}`);
    }
    console.log(`Description: ${transaction.description}`);
    console.log('--------------------------\n');

  },

};