CREATE TABLE IF NOT EXISTS farms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farm_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  crop VARCHAR(255),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  status ENUM('idle','planted','growing','ready','harvested') DEFAULT 'idle',
  FOREIGN KEY (farm_id) REFERENCES farms(id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plot_id INT NOT NULL,
  assigned_to INT NOT NULL,
  task_type ENUM('planting','irrigation','spraying','harvesting','inspection') NOT NULL,
  status ENUM('pending','in_progress','done') DEFAULT 'pending',
  due_date DATE,
  FOREIGN KEY (plot_id) REFERENCES plots(id)
);

CREATE TABLE IF NOT EXISTS field_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  worker_id INT NOT NULL,
  photo_url VARCHAR(500),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  notes TEXT,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
