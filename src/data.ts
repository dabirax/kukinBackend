import type { IProduct } from "./models/products.model";

const products: Partial<IProduct>[] = [
  {
    id: 1,
    foodType: "Pizza",
    name: "Margherita",
    desc: "Classic cheese and tomato pizza",
    rating: "4.5",
    price: 12.99,
    img: "https://example.com/margherita.jpg",
    category: "Italian",
    amount: 1,
    isFav: true,
    isNew: false,
    isPopular: true,
  },
  {
    id: 2,
    foodType: "Burger",
    name: "Veggie Burger",
    desc: "Delicious vegetarian burger",
    rating: "4.2",
    price: 9.99,
    img: "https://example.com/veggieburger.jpg",
    category: "Fast Food",
    amount: 1,
    isFav: false,
    isNew: true,
    isPopular: false,
  },
  {
    id: 3,
    foodType: "Salad",
    name: "Caesar Salad",
    desc: "Fresh Caesar salad with croutons",
    rating: "4.7",
    price: 8.5,
    img: "https://example.com/caesarsalad.jpg",
    category: "Healthy",
    amount: 1,
    isFav: false,
    isNew: false,
    isPopular: true,
  },
];

export default products;