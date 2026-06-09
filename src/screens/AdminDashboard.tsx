import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";

import {
  getAllOrders,
  updateOrderStatus,
  getStats,
  addProduct,
  getProducts,
  deleteProduct,
  updateProductStock,
} from "../services/firebase";

import { db } from "../services/firebase";
import { collection, onSnapshot } from "firebase/firestore";
export default function AdminDashboard({ onLogout }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
const [productStock, setProductStock] = useState("");
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
  });

  const loadData = async () => {
    const allOrders = await getAllOrders();
    const allProducts = await getProducts();
    const statData = await getStats();

    setOrders(allOrders);
    setProducts(allProducts);
    setStats(statData);
  };

 useEffect(() => {
  const unsubProducts = onSnapshot(
    collection(db, "products"),
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    }
  );

  const unsubOrders = onSnapshot(
    collection(db, "orders"),
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
    }
  );

  return () => {
    unsubProducts();
    unsubOrders();
  };
}, []);

 const handleAddProduct = async () => {
  if (!productName || !productPrice || !productStock) return;

  await addProduct({
    name: productName,
    price: Number(productPrice),
    stock: Number(productStock),

  });
setProductStock("");
  setProductName("");
  setProductPrice("");
  setProductStock("");

  loadData();
};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <View style={styles.statsRow}>
        <View style={styles.card}>
          <Text style={styles.number}>{stats.products}</Text>
          <Text>Products</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>{stats.orders}</Text>
          <Text>Orders</Text>
        </View>
      </View>

      <Text style={styles.section}>
        Add Product
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Product Name"
        value={productName}
        onChangeText={setProductName}
      />

      <TextInput
        style={styles.input}
        placeholder="Price"
        value={productPrice}
        keyboardType="numeric"
        onChangeText={setProductPrice}
      />
<TextInput
  style={styles.input}
  placeholder="Stock"
  value={productStock}
  keyboardType="numeric"
  onChangeText={setProductStock}
/>
      <TouchableOpacity
        style={styles.button}
        onPress={handleAddProduct}
      >
        <Text style={styles.buttonText}>
          Add Product
        </Text>
      </TouchableOpacity>

      <Text style={styles.section}>
       Available Products
      </Text>

{products.map((product: any) => (
  <View key={product.id} style={styles.productCard}>
    
    <View style={{ flex: 1 }}>
      <Text style={styles.productName}>
        {product.name}
      </Text>

      <Text style={styles.productPrice}>
        ₱{product.price}
      </Text>

     <Text
  style={{
    fontSize: 12,
    fontWeight: "600",
    color: product.stock > 0 ? "#22c55e" : "red",
    marginTop: 4,
  }}
>
  {product.stock > 0
    ? `Stock: ${product.stock}`
    : "Out of Stock"}
</Text>
    </View>
<View style={{ flexDirection: "row" }}>
  <TouchableOpacity
    style={styles.stockBtn}
    onPress={async () => {
     await updateProductStock(
  product.id,
  (product.stock || 0) + 1
);
      loadData();
    }}
  >
    <Text style={{ color: "#fff" }}>
      + Stock
    </Text>
  </TouchableOpacity>


  <TouchableOpacity
    style={styles.deleteBtn}
    onPress={async () => {
      await deleteProduct(product.id);
      loadData();
    }}
  >
    <Text style={{ color: "#fff" }}>
      Delete
    </Text>
  </TouchableOpacity>
</View>

  </View>
))}

      <Text style={styles.section}>
        Orders
      </Text>

{orders.map((order: any) => {
  const isDelivered = order.status === "delivered";

  return (
    <View key={order.id} style={styles.orderCard}>
      <Text>ID: {order.id}</Text>

      <Text>Total: ${order.total}</Text>

      <Text>Status: {order.status}</Text>

      <Text style={{ marginTop: 10, fontWeight: "bold" }}>
        Items:
      </Text>

      {order.items?.map((item: any, index: number) => (
        <Text key={index} style={{ marginLeft: 10 }}>
          • {item.quantity}x {item.name} - ${item.price}
        </Text>
      ))}

      <TouchableOpacity
        style={[
          styles.button,
          isDelivered ? styles.buttonDelivered : styles.buttonPending
        ]}
        disabled={isDelivered}
        onPress={async () => {
          await updateOrderStatus(order.id, "delivered");
          loadData();
        }}
      >
        <Text style={styles.buttonText}>
          {isDelivered ? "Delivered ✓" : "Mark Delivered"}
        </Text>
      </TouchableOpacity>
    </View>
  );
})}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={onLogout}
      >
        <Text style={styles.buttonText}>
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  statsRow: {
    flexDirection: "row",
    marginBottom: 20,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    margin: 5,
    borderRadius: 10,
    alignItems: "center",
  },

  number: {
    fontSize: 24,
    fontWeight: "bold",
  },

  section: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  deleteBtn: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },

  orderCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  logoutBtn: {
    backgroundColor: "#dc2626",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 50,
    alignItems: "center",
  },
  buttonDelivered: {
  backgroundColor: "yellow",
},

buttonPending: {
  backgroundColor: "#007AFF",
},
productCard: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#fff",
  padding: 12,
  borderRadius: 10,
  marginBottom: 10,
  borderLeftWidth: 4,
  borderLeftColor: "#22c55e",
},

productName: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#111",
},

productPrice: {
  fontSize: 14,
  color: "#666",
  marginTop: 2,
},

productStatus: {
  fontSize: 12,
  color: "#22c55e",
  marginTop: 4,
  fontWeight: "600",
},
stockBtn: {
  backgroundColor: "#22c55e",
  padding: 8,
  borderRadius: 6,
  marginRight: 5,
},
});