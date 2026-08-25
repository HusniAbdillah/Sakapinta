import io
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Tuple, Dict, Any, List

# Column name mapping aliases to handle different user CSV formats gracefully
COLUMN_MAPPINGS = {
    'date': ['date', 'tanggal', 'trans_date', 'datetime', 'time', 'dt'],
    'product_id': ['product_id', 'productid', 'sku', 'sku_id', 'id_produk', 'kode_barang', 'item_id'],
    'product_name': ['product_name', 'productname', 'nama_produk', 'nama_barang', 'item_name', 'name', 'deskripsi'],
    'qty': ['qty', 'quantity', 'sales', 'jumlah', 'terjual', 'units_sold', 'volume'],
    'price': ['price', 'unit_price', 'selling_price', 'harga', 'harga_jual', 'harga_satuan'],
    'cost': ['cost', 'unit_cost', 'purchase_price', 'cogs', 'hpp', 'harga_beli', 'harga_modal'],
    'current_stock': ['current_stock', 'currentstock', 'stock', 'stok', 'inventory', 'stok_saat_ini', 'on_hand_qty', 'current_inventory', 'ending_stock']
}

# Major Indonesian seasonal markers (fixed and dynamic approximate dates)
INDONESIAN_HOLIDAYS_ANNUAL = [
    (8, 17, "Hari Kemerdekaan RI", 1.25),
    (1, 1, "Tahun Baru Masehi", 1.20),
    (12, 25, "Hari Raya Natal", 1.30),
    (11, 11, "Harbolnas 11.11", 1.50),
    (12, 12, "Harbolnas 12.12", 1.60),
    (9, 9, "Mega Sale 9.9", 1.35),
    (10, 10, "Mega Sale 10.10", 1.40),
]

# Simulated Ramadan / Eid window for the retail calendar
RAMADAN_PEAK_WINDOWS = [
    # Approximate Ramadan & Eid windows (Month, StartDay, EndDay, SurgeMultiplier)
    (3, 10, 31, 1.45), # Ramadan season
    (4, 1, 15, 1.85),  # Eid al-Fitr peak
]


def normalize_column_name(col_name: str) -> str:
    """Standardizes input column name against known aliases."""
    clean_col = col_name.strip().lower().replace(" ", "_").replace("-", "_")
    for standard_name, aliases in COLUMN_MAPPINGS.items():
        if clean_col in aliases:
            return standard_name
    return clean_col


def parse_and_validate_csv(csv_content: bytes | str) -> pd.DataFrame:
    """
    Parses raw CSV bytes or string into a validated, normalized pandas DataFrame.
    """
    if isinstance(csv_content, bytes):
        try:
            df = pd.read_csv(io.BytesIO(csv_content), encoding='utf-8')
        except UnicodeDecodeError:
            df = pd.read_csv(io.BytesIO(csv_content), encoding='latin-1')
    else:
        df = pd.read_csv(io.StringIO(csv_content))

    # Normalize column names
    df.columns = [normalize_column_name(c) for c in df.columns]

    # Validate essential columns
    if 'date' not in df.columns:
        raise ValueError("Missing required column 'Date' in CSV.")
    if 'product_id' not in df.columns and 'sku' not in df.columns:
        raise ValueError("Missing required column 'ProductID' or 'SKU' in CSV.")
    if 'qty' not in df.columns:
        raise ValueError("Missing required column 'Qty' or 'Quantity' in CSV.")

    # Standardize data types
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date'])
    df['qty'] = pd.to_numeric(df['qty'], errors='coerce').fillna(0).astype(float)

    if 'product_name' not in df.columns:
        df['product_name'] = df['product_id'].astype(str)

    if 'price' not in df.columns:
        df['price'] = 50000.0  # Reasonable default IDR price
    else:
        df['price'] = pd.to_numeric(df['price'], errors='coerce').fillna(50000.0).astype(float)

    if 'cost' not in df.columns:
        df['cost'] = df['price'] * 0.85  # Default 15% margin
    else:
        df['cost'] = pd.to_numeric(df['cost'], errors='coerce').fillna(df['price'] * 0.85).astype(float)

    if 'current_stock' not in df.columns:
        df['current_stock'] = 15.0  # Default baseline stock
    else:
        df['current_stock'] = pd.to_numeric(df['current_stock'], errors='coerce').fillna(15.0).astype(float)

    # Sort sequentially
    df = df.sort_values(by=['product_id', 'date']).reset_index(drop=True)
    return df


def calculate_indonesian_seasonality_index(dt: datetime) -> Tuple[float, str]:
    """
    Computes an Indonesian cultural demand multiplier and event name for a given date.
    Considers Ramadan/Eid season, Harbolnas, Payday (Gajian 25th-1st), and weekends.
    """
    month = dt.month
    day = dt.day
    multiplier = 1.0
    active_events = []

    # 1. Payday / Gajian cycle (25th to 1st)
    if day >= 25 or day <= 2:
        multiplier *= 1.22
        active_events.append("Siklus Gajian (Payday)")

    # 2. Weekend multiplier (Saturday / Sunday)
    if dt.weekday() in [5, 6]:
        multiplier *= 1.15

    # 3. Fixed Indonesian holidays & Harbolnas
    for h_month, h_day, name, surge in INDONESIAN_HOLIDAYS_ANNUAL:
        if month == h_month and abs(day - h_day) <= 2:
            multiplier = max(multiplier, surge)
            active_events.append(name)

    # 4. Ramadan / Eid season
    for r_month, r_start, r_end, r_surge in RAMADAN_PEAK_WINDOWS:
        if month == r_month and r_start <= day <= r_end:
            multiplier = max(multiplier, r_surge)
            active_events.append("Musim Ramadan / Lebaran")

    event_label = " + ".join(active_events) if active_events else "Regular Trading Day"
    return round(multiplier, 2), event_label
