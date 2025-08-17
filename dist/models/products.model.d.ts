import mongoose from "mongoose";
import type { Document } from "mongoose";
export interface IProduct extends Document {
    id: number;
    foodType: string;
    name: string;
    desc: string;
    rating: string;
    price: number;
    img?: string;
    category: string;
    amount: number;
    isFav?: boolean;
    isFresh?: boolean;
    isPopular?: boolean;
}
declare const _default: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, {}> & IProduct & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=products.model.d.ts.map