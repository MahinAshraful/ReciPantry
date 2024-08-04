'use client'
import React from "react";
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, onSnapshot, deleteDoc, doc, updateDoc, where } from "firebase/firestore"; 
import { db } from "./firebase";
import "./globals.css";
import axios from "axios";

interface Item {
  name: string;
  nameLower: string;
  items: number | null;
  id?: string;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<Item>({name: '', nameLower: '', items: null});

  // Add item to database
  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();

    const itemName = newItem.name.trim();
    const itemNameLower = itemName.toLowerCase();
    const numericItems = Number(newItem.items);

    try {
      const existingItemRef = query(
        collection(db, 'items'),
        where('nameLower', '==', itemNameLower)
      );
      const snapshot = await getDocs(existingItemRef);

      if (snapshot.empty) {
        await addDoc(collection(db, 'items'), {
          name: itemName,
          nameLower: itemNameLower,
          items: numericItems,
        });
      } else {
        const existingDoc = snapshot.docs[0];
        const existingData = existingDoc.data() as Item;
        const existingItems = existingData.items || 0;

        await updateDoc(existingDoc.ref, {
          items: existingItems + numericItems,
        });
      }

      setNewItem({ name: '', nameLower: '', items: null });
    } catch (error) {
      console.error('Error adding item to Firebase:', error);
    }
  };

  // Read items from database
  useEffect(() => {
    const q = query(collection(db, 'items'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let itemsArr: Item[] = []
      querySnapshot.forEach((doc) => {
        itemsArr.push({...doc.data(), id: doc.id} as Item)
      })
      setItems(itemsArr)
    })
    return () => unsubscribe();
  }, [])

  // Delete item from database
  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, 'items', id));
  }

  const [itemLog, setItemLog] = useState<string>('');

  const createItemLog = () => {
    const log = items.map(item => `${item.name}: ${item.items}`).join('\n');
    setItemLog(log);
    return log;
  };

  const[dish, setDish] = useState("");
  const[recipe, setRecipe] = useState("");

  async function generateAns(){

    const x = createItemLog();
    const question = "Give me something I can cook with these ingredients" + x + "dont say anything else but the dish"
    setDish('Loading...')
    const response = await axios ({
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyB5dkbTsUCmPWzACkDq48YnBGC0jDBm7p8",
      method: "post",
      data: {contents:[{parts:[{text: question}]},],}
    })
    setDish(response['data']['candidates'][0]['content']['parts'][0]['text'])

    const newQuestion = "Give me instructions how to make " + dish + "only use these ingredients and only this/these ingredients" + x + " dont say anything other than the instructions"
    const newResponse = await axios ({
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyB5dkbTsUCmPWzACkDq48YnBGC0jDBm7p8",
      method: "post",
      data: {contents:[{parts:[{text: newQuestion}]},],}
    })
    setRecipe(newResponse['data']['candidates'][0]['content']['parts'][0]['text'])

  }

  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
          Pantry Tracker
        </h1>

        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl p-6 mb-8">
          <form onSubmit={addItem} className="flex flex-col sm:flex-row gap-4">
            <input
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              className="flex-grow px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Enter Item"
            />
            <input 
              value={newItem.items ?? ''}
              onChange={(e) => setNewItem({...newItem, items: e.target.value as unknown as number})}
              className="w-full sm:w-32 px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="number" 
              placeholder="Amount"
            />
            <button 
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              Add
            </button>
          </form>
        </div>

        <div className="mb-4">
  <input
    type="text"
    placeholder="Search items..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

        <ul className="space-y-4">
          
        {filteredItems.map((item) => (
            <li key={item.id} className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg overflow-hidden shadow-md transition duration-300 ease-in-out hover:shadow-lg">
              <div className="p-4 flex justify-between items-center">
                <span className="text-lg font-medium capitalize">{item.name}</span>
                <span className="text-lg font-bold">{item.items}</span>
              </div>
              <button 
                onClick={() => deleteItem(item.id!)}
                className="w-full bg-red-600 hover:bg-red-700 py-2 transition duration-300 ease-in-out"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <div className="flex justify-center mt-10">
          <button 
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
          onClick={generateAns}
          >
            Generate Recipes
            </button>
        </div>
        <div className="flex justify-center mt-10">
          <p>{dish}</p>
          <br />
        </div>
        <div className="flex justify-center mt-10">
          <p>{recipe}</p>
          <br />
        </div>

      </div>
    </main>
  );
}