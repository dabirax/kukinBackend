import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  foodType: string;
  name: string;
  desc: string;
  rating: string;
  price: number;
  img?: string;
  category: string;
  amount: number;
  isFav?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    foodType: { type: String, required: true },
    name: { type: String, required: true },
    desc: { type: String, required: true },
    rating: { type: String, required: true },
    price: { type: Number, required: true },
    img: { type: String, required: true },
    amount: { type: Number, default: 1 },

    // homepage 
    isFav: { type: Boolean, default: false },      // favorites
    isNew: { type: Boolean, default: false },    // Today’s special
    isPopular: { type: Boolean, default: false }, // Top selling
  },
  { timestamps: true }
);


export default mongoose.model<IProduct>("Product", productSchema);
