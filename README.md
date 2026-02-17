# ms-mono-typeorm
The example project shows how to do migration in Microservice, use Mono Repo and TypeORM. 

Microservice ที่มีการใช้ ORM และใช้ฐานข้อมูลเดียวกัน
จำเป็นต้องสร้าง service 
เฉพาะสำหรับการทำ Migration และทำการแชร์ entities(Object) 
ของฐานข้อมูลให้แต่ละ service ใช้งาน ตัวอย่างนี้ใช้ SQLite เพื่อง่ายในการทดสอบ

ตัวอย่างนี้สำหรับทำ workshop เพื่อทำความเข้าใจ Mono Repo และ 
การจัดการ Migration แบบรวมศูนย์
ไม่แนะนำ clone repo ออกมา ให้ทำตามขั้นตอนในเอกสารนี้ 
แล้วใช้ repo นี้เพื่ออ้างอิงโค้ดและคอนฟิก เพื่อการเรียนรู้

## Project Structure
โครงสร้างนี้จะเป็น Mono Repo มีสอง Workspace (packages,services) โดยตัวอย่างใช้ Typescript 
สามารถปรับใช้กับภาษาอื่นได้ พวก โค้ดที่ใช้ร่วมกันควรเอามาใส่ใน packages
- packages/database-entities แชร์ entities ของ database 
ถ้า Workspace มีการสร้างตารางใหม่ก็ควรมาอัปเดตโค้ดตรงนี้
- services/migration-service สำหรับทำ migration เพียงตัวเดียว
- services/product-service จัดการเกี่ยวกับ Product
- services/order-service จัดการเกี่ยวกับ Order
- จะข้าม services/user-service ไปเพื่อไม่ให้ขั้นตอนยาวเกินไป
```
Repo
├─ data
│  └─ ms_db.sqlite
├─ node_modules
├─ package.json
├─ tsconfig.json
├─ tsconfig.base.json
├─ packages
│  └─ database-entities
│     ├─ src
│     │  └─ index.ts
│     ├─ package.json
│     └─ tsconfig.json
└─ services
   ├─ migration-service
   │  ├─ src
   │  │  └─ index.ts
   │  ├─ package.json
   │  └─ tsconfig.json
   ├─ product-service
   │  ├─ src
   │  │  └─ index.ts
   │  ├─ package.json
   │  └─ tsconfig.json
   └─ order-service
      ├─ src
      │  └─ index.ts
      ├─ package.json
      └─ tsconfig.json
```
## Create Mono Repo
database-entities ให้ scope เป็น @ms-mono-share 
```sh
cd <mono-repo-folder>
npm init -y
npm init -y --scope @ms-mono-share -w packages/database-entities 
npm init -y -w services/migration-service
npm init -y -w services/order-service
npm init -y -w services/product-service
npm i @ms-mono-share/database-entities -w services/migration-service
npm i @ms-mono-share/database-entities -w services/product-service
npm i @ms-mono-share/database-entities -w services/order-service
```

## Install Dependencies
database-entities จะติดถูกตั้งบนทุก service 
```sh
npm i @ms-mono-share/database-entities -w services/migration-service
npm i @ms-mono-share/database-entities -w services/product-service
npm i @ms-mono-share/database-entities -w services/order-service
```
ติดตั้ง Dependencies ที่แต่ละตัวใช้
```sh
## database-entities
npm i typeorm -w @ms-mono-share/database-entities
npm i -D typescript -w @ms-mono-share/database-entities

## all services
npm i dotenv typeorm express sqlite3 -w services/migration-service \
  -w services/product-service -w services/order-service
npm i -D typescript @types/express -w services/migration-service \
  -w services/product-service -w services/order-service
npm i ts-node-dev -w services/migration-service

```
## Code
ดูโครงสร้างใน git ที่ตรงกับโค้ดตอนนี้
- ใน root ของ Repo นำไฟล์ [tsconfig.json](tsconfig.json), 
[ttsconfig.base.jsont](tsconfig.base.json) 
และ [text.http](test.http) มาใส่
- ใน root ของ Repo แก้ส่วน scripts ของ [package.json](package.json)
- ก้อปโค้ด ใน src, .env, tsconfig.json ของแต่ละ workspace มาใส่
- ดูส่วน main, scripts ใน package.json ของแต่ละ workspace มาใส่ 
(แพ็กเกจ database-entities จำเป็นต้องระบุตำแหน่งของ script ที่ทำงานใน main)

## Build & Clean
```sh
## Build
npm run build -w @ms-mono-share/database-entities
npm run build -w services/migration-service
npm run build -w services/product-service 
npm run build -w services/order-service
## Clean
npm run clean -w @ms-mono-share/database-entities
npm run clean -w services/migration-service
npm run clean -w services/product-service 
npm run clean -w services/order-service
```
เราสามารถใช้แบบนี้ได้ มีผลทุก workspace
```sh
npm run build --workspaces --if-present
npm run clean --workspaces --if-present
```

## Migration
จะทำ migrate จากศูนย์กลางโดยใช้ services/migration-service 
โค้ดสำหรับ migration เก็บที่ services/migration-service/src/migrations/*.ts
หลังจากรัน npm run migrate จะเกิดไฟล์ data/ms_db.sqlite

```sh
npx typeorm migration:generate services/migration-service/src/migrations/Init \
  -d services/migration-service/src/data-source.ts 
npm run migrate -w services/migration-service
```
## Start Services
เรียกใช้งานทดสองด้วย [test.http](test.http)(Rest Client) เนื่องจากไม่มีข้อมูลจะส่ง Empty Array กลับมา
```sh
npm start -w services/migration-service
npm start -w services/product-service
npm start -w services/order-service
```
## Homework
- ลองสร้างอีก workspace ชื่อ services/user-service ใช้ port 3001 
มี Entities [User.ts](packages/database-entities/src/User.ts) เตรียมไว้แล้ว
- เพิ่มข้อมูล แล้วสร้าง API CRUD ให้สมบูรณ์
