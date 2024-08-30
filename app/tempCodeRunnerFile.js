'use client'
import Image from 'next/image'
import {useState, useEffect} from 'react'
import {firestore} from '@/firebase'
import {Box, Modal, Typography, Stack} from '@mui/material'
import {collection, deleteDoc, doc, getDocs, query} from 'firebase/firestore'


export default function Home() {
  const[inventory, setInventory] = useState([])
  const[open, setOpen] = useState(false)
  const[itemName, setItemName] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(fireStore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => 
    {inventoryList.push({
      name: doc.id,
      ...doc.data(),
    })
  })
  setInventory(inventoryList)
  }//Stops the website from freezing when fetching


  const addItem = async(item) =>{
    const docRef = doc(collection,(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const quantity = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
      } else{
        await setDoc(docRef, {quantity: 1})
      }
      await updateInventory
    }
    

    const removeItem = async(item) =>{
      const docRef = doc(collection,(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)
  
      if(docSnap.exists()){
        const quantity = docSnap.data()
        if (quantity === 1 ){
          await deleteDoc(docRef)
        } else {
          await setDoc(docRef, {quantity: quantity - 1})
        }
      }
      await updateInventory
    }
  
  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box width = "100vw"  
      height = "100vh" 
      display:flex 
      justifyContent:center 
      alignItems:center 
      gap={2}
      > 
      <Modal>  open={open} onClose={handleClose}</Modal>
      <Box 
      position="absolute" 
      top="50%" 
      left="50%" 
      width={400}
      bgcolor="white"
      border="4px solid #000"
      boxShadow={24}
      p={4}
      display="flex"
      flexDirection="column"
      gap={3}
      sx={{
        transform: 'translate(-50%,-50%)'
      }}
      >
        <Typography variant="h6"> Add Item</Typography>
        <Stack width="100%" direction="row" spacing={2}>
          <TextField></TextField>
        </Stack>
      </Box>
      <Typography variant="h1">Inventory Management</Typography>
      {/* {
        inventory.forEach((item) =>{
          console.log(item)
          return(
          <Box>
            {item.name}
            {item.count}
          </Box>
          )
        })} */}
    </Box>
  )
}
