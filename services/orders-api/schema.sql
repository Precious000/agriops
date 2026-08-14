CREATE TABLE IF NOT EXISTS produce_listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plot_id INT NOT NULL,
  crop VARCHAR(255) NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  available BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  listing_id INT NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  status ENUM('placed','confirmed','fulfilled','cancelled') DEFAULT 'placed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES produce_listings(id)
);

CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('unpaid','paid') DEFAULT 'unpaid',
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
