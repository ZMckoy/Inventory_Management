'use client'
import React, { useState, useEffect } from 'react';
import { firestore } from '@/firebase'
import * as tf from '@tensorflow/tfjs';
import { Box, Modal, Typography, Stack, TextField, Button, AppBar, Toolbar } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from 'firebase/firestore';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [model, setModel] = useState(null);

  const loadModel = async () => {
    try {
      const loadedModel = await tf.loadLayersModel('/models/model.json');
      setModel(loadedModel);
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Failed to load model:', error);
    }
  };

  useEffect(() => {
    loadModel();
    updateInventory();
  }, []);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const quantity = docSnap.data().quantity;
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const quantity = docSnap.data().quantity;
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const makePrediction = async () => {
    if (model) {
      const inputData = tf.tensor2d([[1, 2, 3, 4]]);
      const result = model.predict(inputData);
    } else {
      console.warn('Model not yet loaded');
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Inventory Management System</Typography>
        </Toolbar>
        <Button variant="text"> 
          <Typography>Camera</Typography>
        </Button>
      </AppBar>
      <Box p={4}>
        <Button variant="contained" onClick={handleOpen}>Add New Item</Button>
        <Box mt={2}>
          <Typography variant="h4">Inventory Items</Typography>
          {inventory.map(({ name, quantity }) => (
            <Box key={name} mt={2} border="1px solid #ccc" p={2}>
              <Typography variant="h6">{name}</Typography>
              <Typography>Quantity: {quantity}</Typography>
              <Button variant="contained" onClick={() => addItem(name)}>Add</Button>
              <Button variant="contained" onClick={() => removeItem(name)}>Remove</Button>
            </Box>
          ))}
        </Box>
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'white',
            border: '4px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <TextField
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button variant="contained" onClick={() => {
            addItem(itemName);
            setItemName('');
            handleClose();
          }} sx={{ mt: 2 }}>Add</Button>
        </Box>
      </Modal>
    </Box>
  );
}
