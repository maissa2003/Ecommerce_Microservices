# 🛒 E-Commerce Microservices Platform (4SAE7)

## 📌 Overview
This project is a **scalable e-commerce platform** built using a **microservices architecture**.  
Developed as part of **SAE7**, it combines a robust **Spring Boot backend** with a modern **Angular frontend**.

The goal is to create a **modular, distributed system** where each service is independent and deployable.

---

## 🏗️ Architecture

The system is based on **Spring Cloud Microservices Architecture**:

- 🔹 **Eureka Server** → Service Discovery  
- 🔹 **API Gateway** → Central entry point  
- 🔹 **Microservices** → Business logic split into services  
- 🔹 **Angular Frontend** → User interface  

---

## ⚙️ Technologies Used

### 🔙 Backend
- Java 17  
- Spring Boot  
- Spring Cloud  
- Spring Data JPA  
- Hibernate  
- MySQL  
- Eureka Server  
- Spring Cloud Gateway  

### 🔜 Frontend
- Angular  
- TypeScript  
- HTML / CSS  

### 🛠️ Tools
- Maven  
- Docker  
- Git & GitHub  

---

## 📂 Project Structure

```bash
Microservices/
│
├── eureka-server/         # Service Registry
├── api-gateway/           # API Gateway
│
├── ms-order/              # Order Management
├── ms-category/           # Category Management
├── ms-article/            # Product/Article Management
├── ms-user/               # User Management
├── ms-paiement/           # Payment Service
│
└── frontend-angular/      # Angular Frontend
```

---

## 🚀 Features

- ✅ Microservices-based system  
- ✅ Service discovery with Eureka  
- ✅ API Gateway routing  
- ✅ Independent databases per service  
- ✅ RESTful APIs  
- ✅ Scalable & maintainable architecture  
- ✅ Full-stack implementation (Spring + Angular)  

---

## ⚡ Getting Started

### 🔧 Prerequisites

Make sure you have:

- Java 17  
- Maven  
- Node.js & Angular CLI  
- MySQL  
- Docker (optional)

---

### ▶️ Backend Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/your-repo.git
cd Microservices
```

2. Start services in this order:

```bash
1. eureka-server
2. api-gateway
3. microservices:
   - ms-user
   - ms-category
   - ms-article
   - ms-order
   - ms-paiement
```

3. Run each service:

```bash
mvn spring-boot:run
```

---

### 🌐 Frontend Setup

```bash
cd frontend-angular
npm install
ng serve
```

Open in browser:
```
http://localhost:4200
```

---

## 📡 API Gateway

All backend services are accessible via:

```
http://localhost:8080
```

---

## 👥 Team Members

- Mathlouthi Hamza  
- Loueti Mohamed Aziz  
- Khemir Ahmed Houssine  
- Kelibi Mayssa  
- Lekhlifi Souhe  

---

## 📚 Academic Context

This project is part of **SAE7**, focusing on:

- Microservices Architecture  
- Distributed Systems  
- Full-Stack Development  
- API Design & Integration  

---

## 📄 License

This project is developed for educational purposes.
