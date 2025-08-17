import type { Request, Response } from "express";
export declare const getAllProducts: (req: Request, res: Response) => void;
export declare const getProductById: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
export declare const createProduct: (req: Request, res: Response) => void;
export declare const updateProduct: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
export declare const deleteProduct: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=product.controller.d.ts.map