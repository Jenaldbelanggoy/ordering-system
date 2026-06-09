import React, { useState, useEffect } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { StatusBar } from "expo-status-bar";
import { getProducts } from "./services/firebase";
import ProductCard from "./components/ProductCard";
import { placeOrder, getCurrentUser, logoutUser, getOrders } from "./services/firebase";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import DashboardScreen from "./screens/DashboardScreen";
import AdminDashboard from "./screens/AdminDashboard";

import { db } from "./services/firebase";


import { doc, updateDoc, increment } from "firebase/firestore";
export default function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<{id:string;name:string;price:number;quantity:number;}[]>([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(getCurrentUser());
  const [screen, setScreen] = useState<"login" | "register" | "home" | "dashboard" | "orders">("login");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
const [role, setRole] = useState<"user" | "admin">("user");
  useEffect(() => {
  const currentUser = getCurrentUser();

  if (currentUser) {
    setUser(currentUser);
    setRole("user");
    setScreen("home");
  }

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  loadProducts();
}, []); 
const handleLoginSuccess = (userData: any) => {
  setUser(getCurrentUser());

  if (userData?.role === "admin") {
    setRole("admin");
    setScreen("dashboard");
  } else {
    setRole("user");
    setScreen("home");
  }
};
  const handleRegisterSuccess = () => {
    setUser(getCurrentUser());
    setScreen("home");
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setScreen("login");
      setCart([]);
      setMessage("");
    } catch (error) {
      console.error(error);
    }
  };

  const addToCart = (product: {id:string;name:string;price:number;}) => {
    setCart(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        return current.map(item =>
          item.id === product.id ? {...item, quantity: item.quantity + 1} : item
        );
      }
      return [...current, {...product, quantity: 1}];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(current => current.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(current =>
        current.map(item =>
          item.id === productId ? {...item, quantity} : item
        )
      );
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const submitOrder = async () => {
    if (cart.length === 0) {
      setMessage("Add some products to your cart first.");
      return;
    }

    if (deliveryMethod === "delivery" && !deliveryAddress.trim()) {
      setMessage("Please enter a delivery address.");
      return;
    }

    try {
      await placeOrder({
        items: cart,
        total,
        createdAt: new Date().toISOString(),
        userId: user?.uid || "",
        deliveryMethod,
        address: deliveryAddress
      });
      for (const item of cart) {
  const productRef = doc(db, "products", item.id);

  const product = products.find((p) => p.id === item.id);

  if (!product) continue;

await updateDoc(productRef, {
  stock: increment(-item.quantity)
});
}
      setCart([]);
      setDeliveryAddress("");
      setMessage("✅ Order submitted successfully! Driver will arrive shortly.");
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Unable to place order. Check your backend config.");
    }
  };

  if (screen === "login") {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} onGoToRegister={() => setScreen("register")} />;
  }

  if (screen === "register") {
    return <RegisterScreen onRegisterSuccess={handleRegisterSuccess} onGoToLogin={() => setScreen("login")} />;
  }

if (screen === "dashboard") {
  return role === "admin" ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <DashboardScreen user={user} onLogout={handleLogout} />
  );
}

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Ordering System</Text>
          <Text style={styles.subtitle}>Select items and place your order</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => setScreen("dashboard")} style={styles.dashboardButton}>
            <Text style={styles.dashboardText}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

   <ScrollView contentContainerStyle={styles.content}>

  {products?.map((product) => (
    <ProductCard
      key={product.id}
      product={product}
      onAdd={() => addToCart(product)}
    />
  ))}

  <View style={styles.deliverySection}>
    <Text style={styles.deliveryTitle}>📦 Delivery Options</Text>

    <View style={styles.deliveryMethodContainer}>
      <TouchableOpacity
        style={[
          styles.deliveryMethod,
          deliveryMethod === "pickup" && styles.deliveryMethodActive,
        ]}
        onPress={() => setDeliveryMethod("pickup")}
      >
        <Text style={styles.deliveryMethodText}>🏪 Pickup</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.deliveryMethod,
          deliveryMethod === "delivery" && styles.deliveryMethodActive,
        ]}
        onPress={() => setDeliveryMethod("delivery")}
      >
        <Text style={styles.deliveryMethodText}>🚗 Delivery</Text>
      </TouchableOpacity>
    </View>

    {deliveryMethod === "delivery" && (
      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Delivery Address</Text>
        <TextInput
          style={styles.addressInput}
          placeholder="Enter your delivery address"
          placeholderTextColor="#999"
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          multiline
        />
      </View>
    )}
  </View>

  <View style={styles.cartSummary}>
    <Text style={styles.cartTitle}>🛒 Cart ({cart.length})</Text>

    {cart.length === 0 ? (
      <Text style={styles.cartEmpty}>Your cart is empty</Text>
    ) : (
      cart.map((item) => (
        <View key={item.id} style={styles.cartItem}>
          <View style={styles.cartItemInfo}>
            <Text style={styles.cartItemName}>{item.name}</Text>
            <Text style={styles.cartItemPrice}>
              ${item.price.toFixed(2)} x {item.quantity}
            </Text>
          </View>

          <View style={styles.cartItemActions}>
            <TouchableOpacity
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              style={styles.qtyButton}
            >
              <Text style={styles.qtyButtonText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qtyText}>{item.quantity}</Text>

            <TouchableOpacity
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              style={styles.qtyButton}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => removeFromCart(item.id)}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))
    )}

    <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>

    {message ? (
      <Text
        style={[
          styles.message,
          message.includes("✅")
            ? styles.messageSuccess
            : styles.messageError,
        ]}
      >
        {message}
      </Text>
    ) : null}

    <TouchableOpacity onPress={submitOrder} style={styles.orderButton}>
      <Text style={styles.orderButtonText}>🛍️ Place Order</Text>
    </TouchableOpacity>
  </View>

</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  header: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  headerContent: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "700"
  },
  subtitle: {
    color: "#555",
    marginTop: 4
  },
  content: {
    padding: 16
  },
  deliverySection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    marginBottom: 20
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12
  },
  deliveryMethodContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12
  },
  deliveryMethod: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
  },
  deliveryMethodActive: {
    borderColor: "#2563eb",
    backgroundColor: "#e0f2fe"
  },
  deliveryMethodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333"
  },
  addressContainer: {
    marginTop: 12
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333"
  },
  addressInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    minHeight: 80,
    fontSize: 14
  },
  cartSummary: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12
  },
  cartEmpty: {
    color: "#777"
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  cartItemInfo: {
    flex: 1
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333"
  },
  cartItemPrice: {
    fontSize: 14,
    color: "#666",
    marginTop: 4
  },
  cartItemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  qtyButton: {
    width: 28,
    height: 28,
    backgroundColor: "#ddd",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center"
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333"
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center"
  },
  removeButton: {
    width: 28,
    height: 28,
    backgroundColor: "#fee2e2",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center"
  },
  removeButtonText: {
    fontSize: 16,
    color: "#dc2626",
    fontWeight: "700"
  },
  total: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700"
  },
  orderButton: {
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    alignItems: "center",
    overflow: "hidden"
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700"
  },
  message: {
    marginTop: 12,
    padding: 8,
    textAlign: "center",
    borderRadius: 4,
    fontSize: 14
  },
  messageSuccess: {
    backgroundColor: "#dcfce7",
    color: "#166534"
  },
  messageError: {
    backgroundColor: "#fee2e2",
    color: "#991b1b"
  },
  dashboardButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#007AFF",
    borderRadius: 6,
  },
  dashboardText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ef4444",
    borderRadius: 6,
  },
  logoutText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  }
});
