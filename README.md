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
npm init -y --scope @ms-mono-share -w packages/database
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
npm i @ms-mono-share/database-entities -w @ms-mono-share/database
npm i @ms-mono-share/database-entities -w services/migration-service
npm i @ms-mono-share/database-entities -w services/product-service
npm i @ms-mono-share/database-entities -w services/order-service

```
ติดตั้ง Dependencies ที่แต่ละตัวใช้
```sh
## database-entities
npm i typeorm -w @ms-mono-share/database-entities
npm i -D typescript rimraf -w @ms-mono-share/database-entities
## database
npm i typeorm sqlite3 dotenv -w @ms-mono-share/database
npm i -D typescript -w @ms-mono-share/database
## all services
npm i dotenv typeorm express -w services/migration-service \
  -w services/product-service -w services/order-service
npm i -D typescript @types/express -w services/migration-service \
  -w services/product-service -w services/order-service
npm remove ts-node-dev -w services/migration-service

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
npm run build -w @ms-mono-share/database
npm run build -w services/migration-service
npm run build -w services/product-service 
npm run build -w services/order-service
## Clean
npm run clean -w @ms-mono-share/database-entities
npm run clean -w @ms-mono-share/database
npm run clean -w services/migration-service
npm run clean -w services/product-service 
npm run clean -w services/order-service
```
เราสามารถใช้แบบนี้ได้ มีผลทุก workspace
```sh
npm run build --workspaces --if-present
npm run clean --workspaces --if-present
```
*แต่ npm ไม่สามารถจัดการ build sequence หรือ build dependency ได้ 
ควร build ใน packages ใน services ก่อน ตอนนี้ได้ทำ script สำหรับการนี้แล้วใน [package.json](package.json)
```
npm run build-all
npm run clean-all
```

## Migration

จะทำ migrate จากศูนย์กลางโดยใช้ services/migration-service 
โค้ดจาก migration:generate เก็บที่ services/migration-service/src/migrations/*.ts

```sh
npm run migration:generate -w services/migration-service -- src/migrations/InitTable
npm run migration:create -w services/migration-service -- src/migrations/SeedData
npm run migration:run -w services/migration-service
npm run migrate -w services/migration-service
```
- ทุก services มีการใช้ฐานข้อมูลควรตั้งค่าตัวแปรแวดล้อม DB_DATABASE ใน .env ให้ดูตัวอย่างในไฟล์ [.env.example](services/migration-service/.env.example)
- ตำแหน่งของการเรียกใช้โค้ดสำหรับ Migration ตอนพัฒนาเช่นผ่าน scripts ใน package.json อยู่ที่ src/migrations/**/*.ts 
- ตำแหน่งของการเรียกใช้โค้ดสำหรับ Migration ตอนเรียกใช้โปรแกรม(เช่นใน docker) ใช้งานจะเรียกใน dist จะอยู่ที่ __dirname + "/migrations/**/*.{ts,js}"


## Start Services
เรียกใช้งาน 
```sh
npm start -w services/migration-service
npm start -w services/product-service
npm start -w services/order-service
```
ทดสอบด้วย [test.http](test.http)(Rest Client) หรือ curl เนื่องจากไม่มีข้อมูลจะส่ง Empty Array กลับมา
```sh
curl -i http://localhost:3002/products 
curl -i http://localhost:3003/orders
```

## Docker
ทุก service มี Dockerfile สำหรับสร้างอิมเมจ มี [docker-compose.yml](docker-compose.yml) ที่พร้อมใช้งาน

```sh
docker compose build
docker compose up -d
docker compose down
```
ทุก services มีการใช้ฐานข้อมูลควรตั้งค่าตัวแปรแวดล้อม DB_DATABASE ใน .env ให้ดูตัวอย่างในไฟล์ [.env.example](.env.example)



## Homework
- ลองสร้างอีก workspace ชื่อ services/user-service ใช้ port 3001 
มี Entities [User.ts](packages/database-entities/src/User.ts) เตรียมไว้แล้ว
อาจจะใช้ Framework ที่ต่างออกไปก็ได้เช่น Elysia.js, TSOA
- เพิ่มข้อมูล แล้วสร้าง API CRUD ให้สมบูรณ์


## Sparc checkout
TODO: complete this section
```sh
# Add another directory to your sparse checkout
git sparse-checkout add src/config

# Or give up and get everything
git sparse-checkout disable
```

## Misc
- [How to Structure a Monorepo with Docker](https://oneuptime.com/blog/post/2026-02-08-how-to-structure-a-monorepo-with-docker/view)
