import React, { useState } from "react";
import * as XLSX from "xlsx";

/* ================= HELPERS ================= */


const normalize = (v) =>
  String(v || "")
    .toLowerCase()
    .replace(/\u00a0/g, "")
    .replace(/[^a-z0-9]/g, "");

const cleanValue = (v) => {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    const t = v.trim();
    if (!t || t === "-" || t.toLowerCase() === "n/a") return null;
    return t;
  }
  return v;
};

/* 🔥 REMOVE EMPTY KEYS RECURSIVELY */
const removeEmptyFields = (obj) => {
  if (Array.isArray(obj)) {
    return obj
      .map(removeEmptyFields)
      .filter(
        (v) =>
          v !== null &&
          v !== undefined &&
          v !== "" &&
          !(Array.isArray(v) && v.length === 0) &&
          !(typeof v === "object" && Object.keys(v).length === 0)
      );
  }

  if (obj && typeof obj === "object") {
    const cleaned = {};
    Object.keys(obj).forEach((key) => {
      const value = removeEmptyFields(obj[key]);
      const isEmpty =
        value === "" ||
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "object" && Object.keys(value).length === 0);

      if (!isEmpty) cleaned[key] = value;
    });
    return cleaned;
  }

  return obj;
};

/* ================= UNIT KEYS (KEEP EXACT) ================= */

const UNIT_KEYS = ["weight(g)", "length(cm)", "width(cm)", "height(cm)"];

/* ================= EXCEL → MODEL MAP ================= */

const EXCEL_TO_MODEL_MAP = {
  "seller id": "sellerId",
  sellerid: "sellerId",
  "base sku": "basesku",
  sku: "sku",
  "hsn code": "hsncode",
  totalstock: "stock",
  offerprice: "offerprice",
  "mfg.date": "mfgdate",
  material: "material",
  pattern: "pattern",
  "product type": "producttype",
  "highlight 1-2": "highlight",
  "other highlights": "otherhighlights",
  size: "size"
};

/* ================= COMPONENT ================= */

export default function ExcelProductUploader() {
  const [file, setFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => setFile(e.target.files[0]);

  const parseFile = async () => {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws, { defval: "" });
  };

  const processFile = async () => {
    if (!file) return alert("Please select Excel file");

    setLoading(true);
    const rows = await parseFile();
    const output = [];

    rows.forEach((rawRow) => {
      const row = {};

      /* ===== NORMALIZE HEADERS ===== */
      Object.keys(rawRow).forEach((k) => {
        const rawKey = k.trim();
        const value = cleanValue(rawRow[k]);

        if (value === null) return;

        if (UNIT_KEYS.includes(rawKey)) {
          row[rawKey] = value;
        } else {
          const norm = normalize(k);
          const mapped = EXCEL_TO_MODEL_MAP[norm] || norm;
          row[mapped] = value;
        }
      });

      if (!row.name || !row.category) return;

      /* ===== BASE PRODUCT (KEEP EVERYTHING) ===== */
      const product = {
        ...row,
        price: Number(row.price) || 0,
        offerprice: Number(row.offerprice) || 0,
        stock: Number(row.stock) || 0,
        name_lower: row.name.toLowerCase()
      };

      /* ===== IMAGES ===== */
      const images = [];
      ["imageurl1", "imageurl2", "imageurl3"].forEach((k) => {
        if (row[k]) images.push(row[k]);
      });
      if (images.length) product.images = images;

      /* ===== SIZE VARIANTS ===== */
      if (row.size || row.sku) {
        product.sizevariants = [
          {
            size: row.size || "Default",
            price: product.price,
            sku: row.sku || row.basesku,
            stock: product.stock
          }
        ];
      }

      /* ===== SEARCH KEYWORDS ===== */
      product.searchkeywords = [
        ...new Set(
          [
            row.name,
            row.brand,
            row.category,
            row.subcategory,
            row.color
          ]
            .join(" ")
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .split(/\s+/)
            .filter((w) => w.length > 2)
        )
      ];

      /* 🔥 FINAL CLEAN */
      output.push(removeEmptyFields(product));
    });

    setProducts(output);
    setLoading(false);
  };

  const downloadJSON = () => {
    if (!products.length) return alert("No data to download");
    const blob = new Blob([JSON.stringify(products, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Excel →  Product Import</h2>

        <input type="file" onChange={handleFile} />

        <button onClick={processFile} style={styles.primaryBtn}>
          {loading ? "Processing..." : "Convert"}
        </button>

        <button onClick={downloadJSON} style={styles.secondaryBtn}>
          Download JSON
        </button>

        {products.length > 0 && (
          <pre style={styles.preview}>
            {JSON.stringify(products[0], null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    width: "90%",
    maxWidth: 900,
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
  },
  title: {
    marginBottom: 16,
    textAlign: "center"
  },
  primaryBtn: {
    marginTop: 12,
    padding: "10px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    marginRight: 10
  },
  secondaryBtn: {
    padding: "10px 16px",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },
  preview: {
    marginTop: 20,
    maxHeight: 350,
    overflow: "auto",
    background: "#f3f4f6",
    padding: 12,
    fontSize: 12,
    borderRadius: 8
  }
};
