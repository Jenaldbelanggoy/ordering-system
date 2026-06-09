import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}
interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.description}>{product.description}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        <TouchableOpacity style={styles.button} onPress={() => onAdd(product)}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  name: {
    fontSize: 18,
    fontWeight: "700"
  },
  description: {
    color: "#606060",
    marginTop: 4
  },
  footer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  price: {
    fontSize: 16,
    fontWeight: "700"
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#2563eb",
    borderRadius: 8
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700"
  }
});
