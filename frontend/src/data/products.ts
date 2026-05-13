import tomato from "@/assets/p-tomato.jpg";
import spinach from "@/assets/p-spinach.jpg";
import carrot from "@/assets/p-carrot.jpg";
import strawberry from "@/assets/p-strawberry.jpg";
import banana from "@/assets/p-banana.jpg";
import milk from "@/assets/p-milk.jpg";
import apple from "@/assets/p-apple.jpg";
import { Product } from "@/context/CartContext";

export const products: Product[] = [
  { id: "1", name: "Heirloom Tomatoes", price: 45, oldPrice: 60, unit: "500 g", image: tomato, tag: "Organic", category: "Vegetables" },
  { id: "2", name: "Baby Spinach", price: 30, oldPrice: 40, unit: "250 g", image: spinach, tag: "Fresh Today", category: "Vegetables" },
  { id: "3", name: "Country Carrots", price: 35, unit: "500 g", image: carrot, tag: "Farm Fresh", category: "Vegetables" },
  { id: "4", name: "Hill Strawberries", price: 120, oldPrice: 150, unit: "250 g", image: strawberry, tag: "Fresh Today", category: "Fruits" },
  { id: "5", name: "Yelakki Bananas", price: 55, unit: "1 dozen", image: banana, tag: "Organic", category: "Fruits" },
  { id: "6", name: "Farm Cow Milk", price: 70, unit: "1 L", image: milk, tag: "Farm Fresh", category: "Dairy" },
  { id: "7", name: "Shimla Apples", price: 180, oldPrice: 220, unit: "1 kg", image: apple, tag: "Organic", category: "Fruits" },
  { id: "8", name: "Fresh Tomatoes Mix", price: 40, unit: "1 kg", image: tomato, tag: "Farm Fresh", category: "Vegetables" },
];

export const freshToday = products.filter((p) => p.tag === "Fresh Today" || p.id === "3");
