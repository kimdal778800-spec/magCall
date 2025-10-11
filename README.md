# Next.js + MySQL + Tailwind (WebStorm Ready)

## ⚙️ Setup
1. Install dependencies  
   ```bash
   npm install
   ```

2. Create `.env.local`
   ```bash
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=1234
   DB_NAME=testdb
   ```

3. Start MySQL and create table:
   ```sql
   CREATE DATABASE testdb;
   USE testdb;
   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100),
     email VARCHAR(100)
   );
   ```

4. Run server
   ```bash
   npm run dev
   ```

Then open **http://localhost:3000**
