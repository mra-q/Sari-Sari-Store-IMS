-- SQLite Schema for Offline-First Inventory System

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    barcode TEXT UNIQUE,
    category TEXT,
    unit TEXT,
    reorder_level INTEGER DEFAULT 0,
    price REAL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending',
    is_deleted INTEGER DEFAULT 0
);

CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_sync_status ON products(sync_status);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    location TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending',
    is_deleted INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_sync_status ON inventory(sync_status);

-- Stock Movements Table
CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    movement_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    reason TEXT,
    notes TEXT,
    performed_by TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending',
    is_deleted INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_sync_status ON stock_movements(sync_status);

-- Restock Requests Table
CREATE TABLE IF NOT EXISTS restock_requests (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    requested_quantity INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    requested_by TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending',
    is_deleted INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_restock_requests_product ON restock_requests(product_id);
CREATE INDEX idx_restock_requests_status ON restock_requests(status);
CREATE INDEX idx_restock_requests_sync_status ON restock_requests(sync_status);

-- Cycle Counts Table
CREATE TABLE IF NOT EXISTS cycle_counts (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    expected_quantity INTEGER NOT NULL,
    actual_quantity INTEGER NOT NULL,
    variance INTEGER NOT NULL,
    counted_by TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending',
    is_deleted INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_cycle_counts_product ON cycle_counts(product_id);
CREATE INDEX idx_cycle_counts_sync_status ON cycle_counts(sync_status);

-- Sync Queue Table
CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    payload TEXT NOT NULL,
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
CREATE INDEX idx_sync_queue_created ON sync_queue(created_at);
