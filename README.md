# Enterprise Inventory & Order Management System


## 🚀 Live Deployments
* **Frontend Application:** [Vercel Deployment](https://order-management-system-liard.vercel.app/)
* **Backend API (Swagger UI):** [Render Deployment](https://order-management-system-ffda.onrender.com/docs)
* **Backend Docker Image:** [Docker Hub](https://hub.docker.com/r/sumit00000/erp-backend)

## 🛠️ Technology Stack
* **Frontend:** React.js, Recharts (Data Visualization), CSS3
* **Backend:** Python, FastAPI, SQLAlchemy
* **Database:** PostgreSQL
* **Containerization:** Docker, Docker Compose

## ⚙️ Core Business Logic Implemented
* Strict adherence to unique constraints (Product SKUs, Customer Emails).
* Prevention of negative inventory levels.
* Automated calculation of total order amounts.
* Database row-level locking (`with_for_update()`) to prevent race conditions during inventory deduction.

## 🐳 Local Development Setup (Docker Compose)

### Prerequisites
* [Docker](https://www.docker.com/products/docker-desktop/) installed and running.
* Git installed.

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone [https://github.com/MohdAasiff/Order-Management-System.git](https://github.com/MohdAasiff/Order-Management-System.git)
   cd Order-Management-System