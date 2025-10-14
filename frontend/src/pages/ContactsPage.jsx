import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getContacts, createContact, getAccounts } from "../api/client";
import styles from './ContactsPage.module.css';
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import NewContactForm from "../components/NewContactForm";

const ContactsPage = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false)
    const queryClient = useQueryClient()

    const { data: contacts = [], isLoading, isError, error } = useQuery({
        queryKey: ['contacts'],
        queryFn: getContacts
    });

    const { data: accounts = [] } = useQuery({
        queryKey: ['accounts'],
        queryFn: getAccounts,
    });

    const createContactMutation = useMutation({
        mutationFn: createContact,
        onSuccess: () => {
            queryClient.invalidateQueries(['contacts'])
            setIsModalOpen(false)
        }

    })

    const filteredContacts = contacts.filter(contact =>
        contact.is_active &&
        `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading contacts...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>{error.message}</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Contacts</h1>
                <button onClick={() => setIsModalOpen(true)} className={styles.newButton}>New Contact</button>
            </div>

            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Contact Name</th>
                            <th>Title</th>
                            <th>Phone</th>
                            <th>Account</th>
                            <th>Owner</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContacts.map((contact) => (
                            <tr key={contact.id}>
                                <td>
                                    <Link to={`/contacts/${contact.id}`} className={styles.contactLink}>
                                        {contact.first_name} {contact.last_name}
                                    </Link>
                                </td>
                                <td>{contact.title || '-'}</td>
                                <td>{contact.phone || '-'}</td>
                                <td>{contact.account?.name || '-'}</td>
                                <td>{contact.owner?.first_name} {contact.owner?.last_name || '-'}</td>
                                <td>
                                    <Link to={`/contacts/${contact.id}/edit`} className={styles.editButton}>
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.summary}>
                Showing {filteredContacts.length} of {contacts.length} contacts
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <NewContactForm
                    onSubmit={createContactMutation.mutate}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={createContactMutation.isLoading}
                    error={createContactMutation.error}
                    contacts={contacts}
                    accounts={accounts}
                />
            </Modal>
        </div>
    );
};

export default ContactsPage;
