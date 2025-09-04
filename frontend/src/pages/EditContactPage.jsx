// 

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { getContact, updateContact, getContacts, getAccounts } from "../api/client"
import styles from './ContactPage.module.css'; 
import EditContactForm from "../components/EditContactForm";

const EditContactPage = () => {

    const {id} = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    // contact which we want to edit, and the update mutation
    const {data: contact, isLoading: isLoadingContact, isError: isErrorContact, error: errorContact} = useQuery({
        queryKey: ['contact',id],
        queryFn : () => getContact(id)
    })

    // Fetch all accounts for the  account dropdown
        const { data: accounts = [] } = useQuery({
            queryKey: ['accounts'],
            queryFn: getAccounts,
        });

        //reports to

        const  {data: contacts= []} = useQuery({
            queryKey: ['contacts'],
            queryFn: getContacts,
        })

        const updateContactMutation = useMutation({
            mutationFn: (contactData) => updateContact(id, contactData),
            onSuccess: () => {
                 queryClient.invalidateQueries({ queryKey: ['accounts'], exact: true });
                queryClient.invalidateQueries({ queryKey: ['contact', id], exact: true });
                 queryClient.invalidateQueries({ queryKey: ['contacts'], exact: true });
                navigate(`/contacts/${id}`)
            }
        })


        const handleSubmit= (formData) => {
            updateContactMutation.mutate({...formData, version: contact.version})
        }

        const handleCancel = () => {
            navigate(`/contacts/${id}`)
        }


         if (isLoadingContact) {
                return <div className={styles.container}>Loading...</div>;
            }
        
            if (isErrorContact) {
                return <div className={styles.container}>Error loading account: {errorContact.message}</div>;
            }


    return (
       <div className={styles.container}>
            <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '8px' }}>
                <EditContactForm
                     initialData={contact}
                     onSubmit = {handleSubmit}
                     onCancel = {handleCancel}
                     isLoading = {updateContactMutation.isLoading}
                     error = {updateContactMutation.error}
                     accounts={accounts}
                     contacts ={contacts}
                     
                />
            </div>
        </div>
    )

}


export default EditContactPage