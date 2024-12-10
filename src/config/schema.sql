CREATE DATABASE IF NOT EXISTS recetario;
USE recetario;

CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100),
  created_at DATETIME NOT NULL,
  rol ENUM('Admin', 'Editor', 'Usuario') NOT NULL DEFAULT 'Usuario',
  estado ENUM('Activo', 'Inactivo', 'Pendiente') NOT NULL DEFAULT 'Pendiente'
);

CREATE TABLE IF NOT EXISTS Categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  slug VARCHAR(255) UNIQUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  ingredientes TEXT NOT NULL,
  instrucciones TEXT NOT NULL,
  imagen VARCHAR(255),
  imagenesAdicionales JSON,
  tiempoPreparacion INT,
  tiempoCoccion INT,
  tiempoTotal INT,
  porciones INT,
  dificultad JSON,
  slug VARCHAR(255) UNIQUE,
  CategoryId INT,
  UserId INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (CategoryId) REFERENCES Categories(id),
  FOREIGN KEY (UserId) REFERENCES Users(id)
);