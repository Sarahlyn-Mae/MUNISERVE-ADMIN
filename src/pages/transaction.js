import React from 'react';
import Sidebar from '../components/sidebar'

const TransactionPage = () => {
    // Sample transaction data (you can replace this with your data)
    const transactions = [
        {
            date: '2023-09-15',
            description: 'Purchase at XYZ Store',
            amount: '-$50.00',
        },
        {
            date: '2023-09-14',
            description: 'Deposit from ABC Inc.',
            amount: '$1,000.00',
        },
        {
            date: '2023-09-12',
            description: 'Online Subscription',
            amount: '-$10.99',
        },
        // Add more transactions as needed
    ];

    return (
        <div>
            <Sidebar />
        <div className="transaction-page">
            <h1>Transaction History</h1>
            <table className="transaction-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction, index) => (
                        <tr key={index}>
                            <td>{transaction.date}</td>
                            <td>{transaction.description}</td>
                            <td className={transaction.amount.startsWith('-') ? 'expense' : 'income'}>
                                {transaction.amount}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    );
};

export default TransactionPage;
