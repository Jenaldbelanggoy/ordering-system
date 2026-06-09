import { initializeApp, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  getCountFromServer,
  doc,
  getDoc,
} from "firebase/firestore";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { increment } from "firebase/firestore";
// =======================
// 🔥 FIREBASE CONFIG
// =======================
// PRODUCTS

export async function addProduct(product: {
  name: string;
  price: number;
  stock: number;
}) {
  const ref = await addDoc(collection(db, "products"), product);
  return ref.id;
}

export async function getProducts() {
  const snapshot = await getDocs(collection(db, "products"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function deleteProduct(productId: string) {
  await deleteDoc(doc(db, "products", productId));
}
export async function updateProductStock(
  productId: string,
  currentStock: number
) {
  const productRef = doc(db, "products", productId);

  await updateDoc(productRef, {
    stock: currentStock + 1,
  });
}
// STATS

export async function getStats() {
  const ordersCount = await getCountFromServer(
    collection(db, "orders")
  );

  const productsCount = await getCountFromServer(
    collection(db, "products")
  );

  return {
    orders: ordersCount.data().count,
    products: productsCount.data().count,
  };
}
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  throw new Error("Firebase API Key not found. Check .env file.");
}

// =======================
// 🔥 INIT APP
// =======================
let app;
try {
  app = getApp();
} catch {
  app = initializeApp(firebaseConfig);
}

const db = getFirestore(app);
const auth = getAuth(app);

// =======================
// 👤 AUTH FUNCTIONS
// =======================
export async function registerUser(email: string, password: string): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// =======================
// 🔐 NEW: GET ID TOKEN (IMPORTANT FOR BACKEND SECURITY)
// =======================
export async function getUserToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  const token = await user.getIdToken();
  return token;
}

// =======================
// 📦 ORDER FUNCTIONS
// =======================
export async function placeOrder(order: {
  items: any[];
  total: number;
  createdAt: string;
  userId: string;
  deliveryMethod: "pickup" | "delivery";
  address?: string;
}) {
  try {
    const ordersCollection = collection(db, "orders");

    await addDoc(ordersCollection, {
      ...order,
      status: "pending",
      assignedDriver: null,
    });
  } catch (error: any) {
    console.error("Place Order Error:", error.message);
    throw new Error(error.message || "Failed to place order.");
  }
}

export async function getOrders(userId: string) {
  try {
    const ordersCollection = collection(db, "orders");
    const q = query(ordersCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        items: data.items ?? [],
        total: data.total ?? 0,
        createdAt: data.createdAt ?? "",
        status: data.status ?? "pending",
        userId: data.userId ?? "",
        deliveryMethod: data.deliveryMethod ?? "pickup",
        address: data.address ?? "", 
      };
    });
  } catch (error: any) {
    console.error("Get Orders Error:", error.message);
    return [];
  }
}

export async function getAllOrders() {
  try {
    const ordersCollection = collection(db, "orders");
    const snapshot = await getDocs(ordersCollection);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    console.error("Get All Orders Error:", error.message);
    return [];
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "delivered" | "processing",
  driverId?: string
) {
  try {
    const orderRef = doc(db, "orders", orderId);

    await updateDoc(orderRef, {
      status,
      updatedAt: new Date().toISOString(),
      
    });
  } catch (error: any) {
    console.error("Update Order Error:", error.message);
    throw error;
  }
}
// =======================
// 🔥 EXPORTS
// =======================
export { db, auth };