import tomato from "@/assets/p-tomato.jpg";
import spinach from "@/assets/p-spinach.jpg";
import carrot from "@/assets/p-carrot.jpg";
import apple from "@/assets/p-apple.jpg";
import banana from "@/assets/p-banana.jpg";
import milk from "@/assets/p-milk.jpg";
import rice from "@/assets/p-rice.jpg";
import strawberry from "@/assets/p-strawberry.jpg";
import farmer1 from "@/assets/farmer-1.jpg";
import farmer2 from "@/assets/farmer-2.jpg";
import farmer3 from "@/assets/farmer-3.jpg";

export type ProductVariant = {
  id: string;
  unit: string;
  price: number;
  mrp?: number;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  unit: string;
  price: number;
  mrp?: number;
  image: string;
  category: string;
  organic?: boolean;
  farmFresh?: boolean;
  farmerId: string;
  harvestDate: string;
  stock: number;
  description: string;
  benefits: string[];
  storage: string;
  variants?: ProductVariant[];
};

export type Farmer = {
  id: string;
  name: string;
  location: string;
  image: string;
  years: number;
  rating: number;
  speciality: string;
};

export const farmers: Farmer[] = [
  { id: "f1", name: "Lakshmi Devi", location: "Mysuru, Karnataka", image: farmer1, years: 18, rating: 4.9, speciality: "Leafy greens & herbs" },
  { id: "f2", name: "Ramesh Patil", location: "Nashik, Maharashtra", image: farmer2, years: 22, rating: 4.8, speciality: "Heirloom tomatoes" },
  { id: "f3", name: "Anita Sharma", location: "Mahabaleshwar, MH", image: farmer3, years: 9, rating: 4.9, speciality: "Berries & soft fruit" },
];

export const categories = [
  { id: "fruits", name: "Fruits", emoji: "🍎" },
  { id: "vegetables", name: "Vegetables", emoji: "🥕" },
  { id: "dairy", name: "Dairy", emoji: "🥛" },
  { id: "grains", name: "Grains", emoji: "🌾" },
  { id: "organic", name: "Organic", emoji: "🌿" },
  { id: "herbs", name: "Herbs", emoji: "🌱" },
];

export const products: Product[] = [
  { id: "p1", name: "Vine Tomatoes", unit: "500 g", price: 45, mrp: 60, image: tomato, category: "vegetables", organic: true, farmFresh: true, farmerId: "f2", harvestDate: "Today, 5:30 AM", stock: 8, description: "Sun-ripened heirloom tomatoes picked at peak flavour from Ramesh's farm.", benefits: ["Rich in lycopene", "Boosts immunity", "Heart-healthy"], storage: "Store at room temperature for 3 days." },
  { id: "p2", name: "Baby Spinach", unit: "250 g", price: 35, image: spinach, category: "vegetables", organic: true, farmFresh: true, farmerId: "f1", harvestDate: "Today, 6:00 AM", stock: 14, description: "Tender baby spinach leaves grown without pesticides.", benefits: ["High in iron", "Loaded with antioxidants"], storage: "Refrigerate up to 4 days." },
  { id: "p3", name: "Organic Carrots", unit: "500 g", price: 40, mrp: 55, image: carrot, category: "vegetables", organic: true, farmerId: "f1", harvestDate: "Yesterday", stock: 22, description: "Crisp, naturally sweet carrots harvested at sunrise.", benefits: ["Vitamin A", "Improves vision"], storage: "Refrigerate up to 2 weeks." },
  { id: "p4", name: "Royal Gala Apples", unit: "1 kg", price: 180, mrp: 220, image: apple, category: "fruits", organic: true, farmerId: "f3", harvestDate: "2 days ago", stock: 30, description: "Crisp, juicy apples from highland orchards.", benefits: ["Fibre rich", "Supports digestion"], storage: "Refrigerate up to 3 weeks." },
  { id: "p5", name: "Hill Bananas", unit: "1 dozen", price: 60, image: banana, category: "fruits", farmFresh: true, farmerId: "f3", harvestDate: "Today", stock: 40, description: "Naturally ripened hill bananas, no chemicals used.", benefits: ["Potassium boost", "Quick energy"], storage: "Room temperature, 5 days." },
  { id: "p6", name: "Farm Fresh Milk", unit: "1 L", price: 72, image: milk, category: "dairy", farmerId: "f2", harvestDate: "Today, 4:00 AM", stock: 18, description: "A2 milk from grass-fed cows, delivered within hours.", benefits: ["Calcium", "Easy to digest"], storage: "Refrigerate, use within 2 days." },
  { id: "p7", name: "Brown Basmati Rice", unit: "1 kg", price: 165, image: rice, category: "grains", organic: true, farmerId: "f2", harvestDate: "Last week", stock: 50, description: "Long grain brown basmati grown organically.", benefits: ["Whole grain", "Low GI"], storage: "Cool, dry place." },
  { id: "p8", name: "Wild Strawberries", unit: "250 g", price: 220, mrp: 260, image: strawberry, category: "fruits", organic: true, farmFresh: true, farmerId: "f3", harvestDate: "Today, 7:00 AM", stock: 5, description: "Hand-picked wild strawberries bursting with flavour.", benefits: ["Vitamin C", "Antioxidants"], storage: "Refrigerate, 2 days." },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const getFarmer = (id: string) => farmers.find((f) => f.id === id);
export const getProductsByFarmer = (id: string) => products.filter((p) => p.farmerId === id);
export const getRelated = (p: Product) => products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
