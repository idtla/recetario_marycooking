CREATE DATABASE IF NOT EXISTS recetario;
USE recetario;

CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  rol ENUM('Admin', 'Editor', 'Usuario') NOT NULL DEFAULT 'Usuario',
  estado VARCHAR(255) NOT NULL DEFAULT 'Activo',
  imagen_url VARCHAR(255) DEFAULT '/assets/img/default-avatar.webp'
);

CREATE TABLE IF NOT EXISTS Categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) NOT NULL UNIQUE,
  parentId INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parentId) REFERENCES Categories(id)
);

CREATE TABLE IF NOT EXISTS Recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  ingredientes TEXT NOT NULL,
  instrucciones LONGTEXT NOT NULL,
  imagen VARCHAR(255),
  imagenesAdicionales TEXT,
  tiempoPreparacion INT NOT NULL DEFAULT 0,
  tiempoCoccion INT NOT NULL DEFAULT 0,
  porciones INT NOT NULL DEFAULT 4,
  dificultad ENUM('Fácil', 'Moderada', 'Difícil', 'Extra Difícil') NOT NULL DEFAULT 'Moderada',
  slug VARCHAR(255) NOT NULL UNIQUE,
  CategoryId INT,
  UserId INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (CategoryId) REFERENCES Categories(id),
  FOREIGN KEY (UserId) REFERENCES Users(id)
);