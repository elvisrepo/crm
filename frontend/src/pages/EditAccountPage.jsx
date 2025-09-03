import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccount, updateAccount, getAccounts } from '../api/client';
import EditAccountForm from '../components/EditAccountForm';
import styles from './AccountsPage.module.css'; // Reusing styles

const EditAccountPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch the specific account to edit
    const { data: account, isLoading: isLoadingAccount, isError: isErrorAccount, error: errorAccount } = useQuery({
        queryKey: ['account', id],
        queryFn: () => getAccount(id),
    });

    // Fetch all accounts for the parent account dropdown
    const { data: accounts = [] } = useQuery({
        queryKey: ['accounts'],
        queryFn: getAccounts,
    });

    const updateAccountMutation = useMutation({
        mutationFn: (accountData) => updateAccount(id, accountData),
        onSuccess: () => {
            // Invalidate and refetch the account query and the list of accounts
            queryClient.invalidateQueries({ queryKey: ['accounts'], exact: true });
            queryClient.invalidateQueries({ queryKey: ['account', id], exact: true });
            // Redirect to the account detail page
            navigate(`/accounts/${id}`);
        },
    });

    const handleSubmit = (formData) => {
        updateAccountMutation.mutate({ ...formData, version: account.version });
    };

    const handleCancel = () => {
        navigate(`/accounts/${id}`);
    };

    if (isLoadingAccount) {
        return <div className={styles.container}>Loading...</div>;
    }

    if (isErrorAccount) {
        return <div className={styles.container}>Error loading account: {errorAccount.message}</div>;
    }

    return (
        <div className={styles.container}>
            <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '8px' }}>
                <EditAccountForm
                    initialData={account}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={updateAccountMutation.isLoading}
                    error={updateAccountMutation.error}
                    accounts={accounts}
                />
            </div>
        </div>
    );
};

export default EditAccountPage;