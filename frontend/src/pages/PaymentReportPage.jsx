import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPaymentMatrix } from '../api/client';
import styles from './PaymentReportPage.module.css';

const PaymentReportPage = () => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const { data: reportData, isLoading, error } = useQuery({
        queryKey: ['paymentMatrix', selectedYear],
        queryFn: () => getPaymentMatrix(selectedYear)
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate year options (current year ± 5 years)
    const yearOptions = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        yearOptions.push(i);
    }

    const getCellClassName = (amount) => {
        if (amount > 0) return styles.paid;
        return styles.unpaid;
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading payment report...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    Error loading report: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Payment Matrix Report</h1>
                <div className={styles.controls}>
                    <label htmlFor="year-select">Year:</label>
                    <select
                        id="year-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className={styles.yearSelect}
                    >
                        {yearOptions.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.paymentTable}>
                    <thead>
                        <tr>
                            <th className={styles.companyHeader}>Company</th>
                            {months.map((month, index) => (
                                <th key={index}>{month}</th>
                            ))}
                            <th className={styles.totalColumn}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData?.accounts?.map(account => (
                            <tr key={account.id}>
                                <td className={styles.companyCell}>{account.name}</td>
                                {months.map((_, index) => {
                                    const monthNum = index + 1;
                                    const amount = account.monthly_payments[monthNum.toString()] || 0;
                                    return (
                                        <td
                                            key={monthNum}
                                            className={getCellClassName(amount)}
                                        >
                                            {amount > 0 ? `$${amount.toFixed(2)}` : '0'}
                                        </td>
                                    );
                                })}
                                <td className={`${styles.totalColumn} ${styles.totalCell}`}>
                                    ${account.total_year.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        {reportData?.accounts?.length === 0 && (
                            <tr>
                                <td colSpan={14} className={styles.noData}>
                                    No payment data available for {selectedYear}
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {reportData?.accounts?.length > 0 && (
                        <tfoot>
                            <tr className={styles.totalRow}>
                                <td className={styles.companyCell}>Total</td>
                                {months.map((_, index) => {
                                    const monthNum = index + 1;
                                    const total = reportData?.monthly_totals?.[monthNum.toString()] || 0;
                                    return (
                                        <td key={monthNum} className={styles.totalCell}>
                                            ${total.toFixed(2)}
                                        </td>
                                    );
                                })}
                                <td className={`${styles.totalColumn} ${styles.totalCell}`}>
                                    ${reportData?.grand_total?.toFixed(2) || '0.00'}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};

export default PaymentReportPage;
