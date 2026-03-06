import { db } from "../firebase/config";
import { collection, getDocs, query, limit, orderBy, startAfter } from "firebase/firestore";

export const productService = {
  // Fetch a specific page
  getPaginated: async (pageSize = 20, lastVisibleDoc = null) => {
    let q;
    if (lastVisibleDoc) {
      q = query(
        collection(db, "products"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisibleDoc),
        limit(pageSize)
      );
    } else {
      q = query(
        collection(db, "products"),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    }

    const snap = await getDocs(q);
    const lastDoc = snap.docs[snap.docs.length - 1];

    const products = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return { products, lastDoc };
  }
};