import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getContacts } from "../api/client";
import styles from './ContactsPage.module.css';
import { Link } from "react-router-dom";

const ContactsPage = () => {

    const [searchTerm, setSearchTerm] = useState('');

    const { data: contacts = [], isLoading, isError, error } = useQuery({
        queryKey: ['contacts'],
        queryFn: getContacts
    });

    const filteredContacts = contacts.filter(contact =>
        contact.is_active &&
        contact.first_name &&
        `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className={styles.loading}>
                Loading contacts...
            </div>
        );
    }

    if (isError) {
        return (
            <div className={styles.error}>
                Error: {error.message}
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Contacts Page</h1>
                <button className={styles.newContactButton}>New Contact</button>
            </div>

            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Search contacts"
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
                                <td>{contact.title || 'N/A'}</td>
                                <td>{contact.phone || 'N/A'}</td>
                                <td>{contact.account?.name || 'N/A'}</td>
                                <td>{contact.owner?.first_name} {contact.owner?.last_name || 'N/A'}</td>
                                <td>
                                    <button className={styles.actionButton}>Edit</button>
                                    <button className={styles.actionButton}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContactsPage;
