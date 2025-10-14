import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createContact, getContacts } from '../api/client';
import NewContactForm from './NewContactForm';
import Modal from './Modal';

const NewContactModal = ({ isOpen, onClose, onContactCreated, defaultAccountId = null }) => {
  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: getContacts,
    enabled: isOpen
  });

  const createContactMutation = useMutation({
    mutationFn: (contactData) => {
      // Ensure account_id is set from defaultAccountId if provided
      const dataToSubmit = {
        ...contactData,
        account_id: contactData.account_id || defaultAccountId
      };
      return createContact(dataToSubmit);
    },
    onSuccess: (newContact) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      
      // Call the callback with the newly created contact
      if (onContactCreated) {
        onContactCreated(newContact);
      }
      
      // Close the modal
      onClose();
    },
    onError: (err) => {
      console.error('Error creating contact:', err);
    }
  });

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <NewContactForm
        onSubmit={createContactMutation.mutate}
        onCancel={handleCancel}
        isLoading={createContactMutation.isLoading}
        error={createContactMutation.error}
        contacts={contacts}
        defaultAccountId={defaultAccountId}
      />
    </Modal>
  );
};

export default NewContactModal;
