import { db } from "../firebase/config";
import { collection, getDocs, query, limit } from "firebase/firestore";

export const productService = {
  getAll: async (pageSize = 10) => {
    const q = query(
      collection(db, "products"),
      limit(pageSize)
    );

    const snap = await getDocs(q);

    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  }
};
