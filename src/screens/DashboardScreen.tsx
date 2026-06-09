import { getOrders } from "../services/firebase";

import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { User } from "firebase/auth";

interface Order {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  createdAt: string;
  status?: string;
}

interface DashboardScreenProps {
  user: User | null;
  onLogout: () => void;
}

export default function DashboardScreen({ user, onLogout }: DashboardScreenProps) {
 const [orders, setOrders] = useState<Order[]>([]);
useEffect(() => {
  const loadOrders = async () => {
    if (!user?.uid) return;

    const data = await getOrders(user.uid);
    setOrders(data);
  };

  loadOrders();
}, [user]);
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* User Profile Section */}
        <View style={styles.profileCard}>
          <Text style={styles.sectionTitle}>Your Profile</Text>
          <View style={styles.profileInfo}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.label}>User ID:</Text>
            <Text style={styles.value}>{user?.uid?.substring(0, 12)}...</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.label}>Member Since:</Text>
            <Text style={styles.value}>
              {user?.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{orders.length}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>${totalSpent.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
          </View>
        </View>

        {/* Orders Section */}
        <View style={styles.ordersCard}>
          <Text style={styles.sectionTitle}>Order History</Text>
          {orders.length === 0 ? (
            <Text style={styles.emptyText}>No orders yet</Text>
          ) : (
            orders.map((order) => (
              <View key={order.id} style={styles.orderItem}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text
                    style={[
                      styles.orderStatus,
                      order.status === "Delivered" && styles.statusDelivered,
                    ]}
                  >
                    {order.status || "Pending"}
                  </Text>
                </View>
                <Text style={styles.orderDate}>{order.createdAt}</Text>
                {order.items.map((item, idx) => (
                  <Text key={idx} style={styles.orderItem2}>
                    {item.quantity}x {item.name} - ${item.price.toFixed(2)}
                  </Text>
                ))}
                <View style={styles.orderTotal}>
                  <Text style={styles.orderTotalText}>
                    Total: ${order.total.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  logoutBtn: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
  },
  profileCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  profileInfo: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 3,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  statsCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  ordersCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
    marginBottom: 12,
  },
  orderItem2: {
    fontSize: 12,
    color: "#666",
    marginLeft: 10,
    marginTop: 4,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  orderStatus: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FF6B6B",
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusDelivered: {
    color: "#27AE60",
    backgroundColor: "#E8F8F5",
  },
  orderDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  orderTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  orderTotalText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    paddingVertical: 20,
  },
});
