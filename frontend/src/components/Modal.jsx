import styles from './Modal.module.css';

/**
 * 
 * this component is a well-structured "wrapper". It doesn't care what it
  displays; it only cares whether to display it (isOpen) and how to close itself
  (onClose).
 */

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
                {children}
            </div>
        </div>
    );
};

export default Modal;


/**
 * 
 * onClick={onClose}`: This is a key piece of user experience. It allows a user to close
     the modal by simply clicking on the dark background area


     onClick={(e) => e.stopPropagation()}

     This is a crucial detail. It prevents a click
     inside the modal content from "bubbling up" to the overlay. Without this, clicking on
     any form field would also trigger the onClose event of the overlay, immediately closing
     the modal. stopPropagation ensures that only clicks on the background overlay will close
      it.


       <button className={styles.closeButton}
     onClick={onClose}>&times;</button>

   * This is the "X" button in the top-right corner, providing another explicit way for the
     user to close the modal.

   1                 {children}

   * And here, the children prop is rendered. This is where the content passed from the
     parent component (like our NewAccountForm) gets displayed inside the modal.

 * 
 */