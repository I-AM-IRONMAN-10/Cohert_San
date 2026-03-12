# API Key Manager

## Overview

API Key Manager stores and manages API keys used for integrations.

The system encrypts API keys before storing them.

Participants must identify weaknesses in key management and security.

---

# Architecture

Frontend

↓

API Layer

↓

Controller

↓

Key Management Service

↓

Encryption Module

↓

File Storage

↓

JSON Database

---

# Folder Structure

```
frontend/
backend/
routes/
controllers/
services/
utils/
data/
```

---

# Features

• Create API key entry
• View keys
• Delete keys

---

# APIs

POST

```
/api/create
```

GET

```
/api/list
```

DELETE

```
/api/:id
```

---

# Bug Investigation Areas

Key Security

* Exposure of sensitive keys
* Improper encryption

Logic

* Duplicate key IDs
* Incorrect key deletion

Security

* Missing authentication
* Missing key masking

Reliability

* File storage race conditions

---

# Objective

Participants must redesign the system to securely manage API keys.

---

# Bonus Improvements

* Implement key rotation
* Add key expiration
* Implement authentication
* Mask API keys in responses
# Cohert_San
