import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { Request, Response } from "express";
admin.initializeApp();
const db = admin.firestore();


// ========================
// 🔐 ADMIN AUTH CHECK
// ========================
const verifyAdmin = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      res.status(401).send("No token provided");
      return null;
    }

    const decoded = await admin.auth().verifyIdToken(token);

    // SIMPLE ADMIN CHECK (email-based)
    if (decoded.email !== "admin@gmail.com") {
      res.status(403).send("Admin only access");
      return null;
    }

    return decoded;
  } catch (error) {
    res.status(401).send("Invalid token");
    return null;
  }
};


// ========================
// 👤 CREATE ORDER (USER)
// ========================
export const createOrder = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    const order = req.body;

    const ref = await db.collection("orders").add({
      ...order,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: ref.id });
    return;
  } catch (error) {
    res.status(500).json({ error: "Unable to create order" });
    return;
  }
});


// ========================
// 📦 GET PRODUCTS (PUBLIC USER)
// ========================
export const getProducts = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Cannot fetch products" });
  }
});


// ========================
// 📦 ADD PRODUCT (ADMIN ONLY)
// ========================
export const addProduct = functions.https.onRequest(async (req, res) => {
  try {
    const adminUser = await verifyAdmin(req, res);
    if (!adminUser) return;

    const product = req.body;

    const ref = await db.collection("products").add({
      ...product,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: ref.id });
    return;
  } catch (error) {
    res.status(500).json({ error: "Add product failed" });
    return;
  }
});


// ========================
// 🗑 DELETE PRODUCT (ADMIN ONLY)
// ========================
export const deleteProduct = functions.https.onRequest(async (req, res) => {
  try {
    const adminUser = await verifyAdmin(req, res);
    if (!adminUser) return;

    const { productId } = req.body;

    await db.collection("products").doc(productId).delete();

    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});


// ========================
// 📦 GET ALL ORDERS (ADMIN ONLY)
// ========================
export const getOrders = functions.https.onRequest(async (req, res) => {
  try {
    const adminUser = await verifyAdmin(req, res);
    if (!adminUser) return;

    const snapshot = await db.collection("orders").get();

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: "Cannot fetch orders" });
  }
});


// ========================
// ✏️ UPDATE ORDER STATUS (ADMIN ONLY)
// ========================
export const updateOrderStatus = functions.https.onRequest(async (req: Request, res: Response) => {
  try {
    const adminUser = await verifyAdmin(req, res);
    if (!adminUser) return;

    if (req.method !== "PUT") {
      res.status(405).send("Method not allowed");
      return;
    }

    const { orderId, status } = req.body;

    await db.collection("orders").doc(orderId).update({
      status,
    });

    res.status(200).json({ message: "Order updated" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
    return;
  }
});


// ========================
// ❌ CANCEL ORDER (ADMIN ONLY)
// ========================
export const cancelOrder = functions.https.onRequest(async (req: Request, res: Response) => {
  try {
    const adminUser = await verifyAdmin(req, res);
    if (!adminUser) return;

    if (req.method !== "DELETE") {
      res.status(405).send("Method not allowed");
      return;
    }

    const { orderId } = req.body;

    await db.collection("orders").doc(orderId).delete();

    res.status(200).json({ message: "Order cancelled" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Cancel failed" });
    return;
  }
});
export const onOrderCreate = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    const order = snap.data();

    if (!order?.items) return;

    const batch = db.batch();

    for (const item of order.items) {
      const productRef = db.collection("products").doc(item.productId);

      const productSnap = await productRef.get();

      if (!productSnap.exists) continue;

      const productData = productSnap.data();
      const currentStock = productData?.stock || 0;

      const newStock = currentStock - item.quantity;

      batch.update(productRef, {
        stock: newStock < 0 ? 0 : newStock,
      });
    }

    await batch.commit();
  });
  