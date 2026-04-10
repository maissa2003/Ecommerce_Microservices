# MS_Feedback — Microservice Feedback

Microservice de gestion des feedbacks/avis clients pour la plateforme e-commerce.

## 🔧 Stack technique

- **Spring Boot** 3.2.5 — Java 17
- **Spring Cloud** 2023.0.1 (Eureka Client)
- **Spring Data JPA** + MySQL
- **Lombok** + Validation

---

## 📁 Structure du projet

```
MS_Feedback/
├── Dockerfile
├── pom.xml
├── INTEGRATION/
│   ├── ApiGatewayWeb_application.properties   ← remplacer dans ApiGatewayWeb
│   └── docker-compose.yml                     ← remplacer à la racine du projet
└── src/
    └── main/java/tn/esprit/ms_feedback/
        ├── MsFeedbackApplication.java
        ├── entities/
        │   ├── Feedback.java
        │   ├── FeedbackDTO.java
        │   └── FeedbackStatus.java   (PENDING | APPROVED | REJECTED)
        ├── repositories/
        │   └── FeedbackRepository.java
        ├── services/
        │   └── FeedbackService.java
        └── controllers/
            ├── FeedbackController.java
            └── GlobalExceptionHandler.java
```

---

## 🌐 Endpoints REST — Port 8085 (via Gateway : 8080)

### CRUD

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/feedbacks` | Tous les feedbacks |
| GET | `/api/feedbacks/{id}` | Un feedback par ID |
| POST | `/api/feedbacks` | Créer un feedback |
| PUT | `/api/feedbacks/{id}` | Modifier un feedback |
| DELETE | `/api/feedbacks/{id}` | Supprimer un feedback |

### Par article

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/feedbacks/article/{articleId}` | Tous les feedbacks d'un article |
| GET | `/api/feedbacks/article/{articleId}/approved` | Feedbacks approuvés d'un article |
| GET | `/api/feedbacks/article/{articleId}/stats` | Moyenne et nombre d'avis |

### Par utilisateur

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/feedbacks/user/{userId}` | Feedbacks d'un utilisateur |

### Modération

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/feedbacks/pending` | Feedbacks en attente |
| PATCH | `/api/feedbacks/{id}/approve` | Approuver un feedback |
| PATCH | `/api/feedbacks/{id}/reject` | Rejeter un feedback |

---

## 📝 Exemple de body POST

```json
{
  "articleId": 1,
  "userId": 42,
  "comment": "Très bon produit, livraison rapide !",
  "rating": 5
}
```

---

## ⚙️ Intégration dans le projet existant

### 1. Copier le dossier `MS_Feedback/` à la racine du projet

```
Ecommerce_Microservices-integBack/
├── ApiGatewayWeb/
├── EurekaServerWeb/
├── MS_Category/
├── MS_Order/
├── ms-article/
├── MS_Feedback/          ← ajouter ici
└── docker-compose.yml
```

### 2. Remplacer les fichiers depuis `INTEGRATION/`

- `INTEGRATION/docker-compose.yml` → remplace `docker-compose.yml` à la racine
- `INTEGRATION/ApiGatewayWeb_application.properties` → remplace `ApiGatewayWeb/src/main/resources/application.properties`

### 3. Lancer

```bash
docker-compose up --build
```

---

## 🔄 Logique métier

- Un utilisateur **ne peut poster qu'un seul feedback** par article
- Tout feedback créé est en statut **PENDING** (en attente de modération)
- Après modification, un feedback repasse en **PENDING**
- Seuls les feedbacks **APPROVED** apparaissent dans les stats de rating
- La note moyenne est arrondie à 1 décimale
