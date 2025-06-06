import { useState } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/credenciaisFirebase';

const useFirebase = () => {
  const [loading, setLoading] = useState(false);

  const addUser = async (data) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'aluguel'), data);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, 'aluguel'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const deleteUser = async (id) => {
    await deleteDoc(doc(db, 'aluguel', id));
  };

  const getUserById = async (id) => {
    const document = await getDoc(doc(db, 'aluguel', id));
    return document.data();
  };

  return { addUser, fetchUsers, deleteUser, getUserById, loading };
};

export default useFirebase;
