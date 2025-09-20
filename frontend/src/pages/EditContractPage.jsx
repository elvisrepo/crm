import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContract, updateContract } from '../api/client';
import ContractForm from '../components/ContractForm';
import styles from './AccountsPage.module.css'; // Reusing styles

const EditContractPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: contract, isLoading, isError, error } = useQuery({
        queryKey: ['contract', id],
        queryFn: () => getContract(id),
    });

    const updateContractMutation = useMutation({
        mutationFn: (contractData) => updateContract(id, contractData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contracts'], exact: true });
            queryClient.invalidateQueries({ queryKey: ['contract', id], exact: true });
            navigate(`/contracts/${id}`);
        },
    });

    const handleSubmit = (formData) => {
        updateContractMutation.mutate({ ...formData, version: contract.version });
    };

    const handleCancel = () => {
        navigate(`/contracts/${id}`);
    };

    if (isLoading) {
        return <div className={styles.container}>Loading...</div>;
    }

    if (isError) {
        return <div className={styles.container}>Error: {error.message}</div>;
    }

    return (
        <div className={styles.container}>
            <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '8px' }}>
                <ContractForm
                    initialData={contract}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={updateContractMutation.isLoading}
                    error={updateContractMutation.error}
                />
            </div>
        </div>
    );
};

export default EditContractPage;
