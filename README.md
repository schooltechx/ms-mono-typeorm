# ms-mono-typeorm
The example project shows how to do centralized migration in Microservice, use Mono Repo and TypeORM. This situation you can't use Database Per Service Pattern for some reason.

ในระบบ Microservice ที่ไม่สามารใช้ Database Per Service Pattern ได้
โดยที่แต่ละ service มีการใช้ ORM และใช้ฐานข้อมูลเดียวกัน(Datasource) จะมีความซับซ้อนในการ Migration 

โค้ดตัวอย่างนี้ออกแบบไว้สำหรับสำหรับทำ workshop 
เพื่อทำความเข้าใจ Mono Repo และ การจัดการ Migration แบบรวมศูนย์
ไม่แนะนำให้ clone repo ออกมา ให้ทำตามขั้นตอนในเอกสารนี้ 
ก็อปโค้ดจาก repo ทีละไฟล์มาใช้ เพื่อให้เข้าใจหลักการทำงานอย่างแท้จริง
- ทำ Migration ที่ service เดียว 
- แชร์โค้ดใน packages ใน scope ชื่อ @ms-mono-share เพื่อให้ services ใช้และไม่เกิดการซ้ำซ้อน
- มีการแชร์ entities(Object) ของฐานข้อมูลให้แต่ละ service ใช้งาน จะทำให้แต่ละ service เข้าถึงฐานข้อมูลได้โดยตรงผ่าน TypeORM จะใช้ SQLite เพื่อง่ายในการทดสอบ
- มีตัวอย่างการสร้าง Docker Image ให้พร้อมใช้งานกับ Microservice
- Mono repo จะแสดงการใช้ sparc checkout เพื่อแยก clone เฉพาะที่จำเป็นต้องใช้ เหมาะกับโครงการขนาดใหญ่ เพื่อลดเวลาทำงานและเนื้อที่ที่ใช้
- มีตัวอย่างสำหรับ Github Action เพื่อสร้าง docker image
- มีตัวอย่าง Database Cache
- demo สำหรับการ deploy แบบ GitOps. เมื่อมีการอัปเดตไฟล์ compose.yaml บน git มีเครื่องมือคอยตรวจการเปลี่ยนแปลงแล้วนำไปอัปเดตทันที เหมาะกับ production ที่ไม่สามารถเข้าถึงได้ด้วย ssh

## Project Structure
โครงสร้างนี้จะเป็น Mono Repo มีสอง Workspace (packages,services) โดยตัวอย่างใช้ Typescript 
สามารถปรับใช้กับภาษาอื่นได้ พวก 
- data จะเป็น volume สำหรับเก็บฐานข้อมูล SQLite
- deploy ไฟล์ compose.yaml และ demo แสดงการใช้งาน doco-cd คอนฟิกอยู่ในไฟล์ doco-cd.yaml
- node_modules จะแชร์ node package ให้กับทุก packages และ services
- tsconfig.base.json จะแชร์การตั้งค่า tsconfig.json
- packages/database-entities แชร์ entities ของ database 
ถ้า Workspace มีการสร้างตารางใหม่ก็ควรมาอัปเดตโค้ดตรงนี้
- packages/database ตัวอย่างการแชร์โค้ดให้แต่ละ service ในที่นี้จะแชร์ DataSource
- services/migration-service สำหรับทำ migration เพียงตัวเดียว
- services/product-service จัดการเกี่ยวกับ Product
- services/order-service จัดการเกี่ยวกับ Order
- จะข้าม services/user-service ไปเพื่อไม่ให้ขั้นตอนยาวเกินไป
```
Repo
├─ data
├─ deploy
├─ node_modules
├─ doco-cd.yaml
├─ package.json
├─ tsconfig.base.json
├─ packages
│  ├─ database-entities
│  │  ├─ src
│  │  │  └─ index.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  └─ database
│     ├─ src
│     │  └─ index.ts
│     ├─ package.json
│     └─ tsconfig.json
└─ services
   ├─ migration-service
   │  ├─ src
   │  │  ├─ migrations   
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
## Mono Repo
ใช้ repo เดียวสำหรับจัดการหลาย service พร้อมกันได้ การแชร์โค้ดทำได้ง่ายขึ้น นักพัฒนาสามารถดึงโค้ดเฉพาะส่วนที่ตัวเองใช้งาน ทำให้ลดเวลาในการ clone install และ build ไปได้มากสำหรับโครงการขนาดใหญ่

จะสร้าง workspace ขื่อ packages และ services โดยที่มี scope เป็น @ms-mono-share 
ใน node_modules/@ms-mono-share เป็น symbolic link มาที่ packages แต่ละตัว
```sh
cd <mono-repo-folder>
npm init -y
npm init -y --scope @ms-mono-share -w packages/database-entities
npm init -y --scope @ms-mono-share -w packages/database
npm init -y -w services/migration-service
npm init -y -w services/order-service
npm init -y -w services/product-service
```

## Install Dependencies
ทั้งโปรเจ็กจะใช้ node_modules ร่วมกัน
@ms-mono-share/database-entities จะติดถูกตั้งบนทุก service และ packages/database 
```sh
npm i @ms-mono-share/database-entities -w @ms-mono-share/database \
-w services/migration-service -w services/product-service -w services/order-service

```
ติดตั้ง Dependencies ที่แต่ละตัวใช้ (จริงๆแล้วถ้าติดตั้งที่ root โปรเจ็กก็จะมองเห็นทั้งหมด แต่จะแยกเพื่อให้เข้าใจว่าตัวไหนใช้อะไรบ้าง)
```sh
## database-entities
npm i typeorm -w @ms-mono-share/database-entities
npm i -D typescript rimraf -w @ms-mono-share/database-entities
## database
npm i typeorm sqlite3 dotenv -w @ms-mono-share/database
npm i -D typescript -w @ms-mono-share/database
## all services
npm i typeorm express -w services/migration-service \
  -w services/product-service -w services/order-service
npm i -D typescript @types/express -w services/migration-service \
  -w services/product-service -w services/order-service
```
## Code
ดูโครงสร้างใน repo [schooltechx/ms-mono-typeorm](https://github.com/schooltechx/ms-mono-typeorm) เปรียบเทียบกับที่ได้ตอนนี้แล้วเติมส่วนที่ขาด
- ใน root ของ Repo นำไฟล์
[docker-compose.yml](docker-compose.yml) 
[tsconfig.json](tsconfig.json), 
[tsconfig.base.json](tsconfig.base.json) 
และ [text.http](test.http) มาใส่
- ใน root ของ Repo แก้ส่วน scripts ของ [package.json](package.json),แก้ [.env.example](.env.example) เป็น .env
- ก้อปโค้ด ใน src, tsconfig.json ของแต่ละ workspace มาใส่ แก้ .env.example เป็น .env
- ดูส่วน main, scripts ใน package.json ของแต่ละ workspace มาใส่

## Build & Clean
รันคำสั่งจาก root ของ Repo ได้เลย
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
*แต่ npm ไม่สามารถจัดการ build sequence หรือ build dependency ได้ ควร build ใน packages เป็นอันดับแรก ตอนนี้ได้ทำ script สำหรับการนี้แล้วใน [package.json](package.json)*
```
npm run build-all
npm run clean-all
```

## Migration

จะทำ migrate จากศูนย์กลางโดยใช้ services/migration-service 
โค้ดจาก migration:generate เก็บที่ services/migration-service/src/migrations/*.ts

```sh
# Create Migration form database-entities
npm run migration:generate -w services/migration-service -- src/migrations/InitTable
npm run migration:generate -w services/migration-service -- src/migrations/AddCache
# Empty migration. Add seed data here
npm run migration:create -w services/migration-service -- src/migrations/SeedData
npm run migration:run -w services/migration-service
```
- ทุก services มีการใช้ฐานข้อมูลควรตั้งค่าตัวแปรแวดล้อม DB_DATABASE ใน .env ให้ดูตัวอย่างในไฟล์ [.env.example](services/migration-service/.env.example)
- ตำแหน่งของการเรียกใช้โค้ดสำหรับ Migration ตอนพัฒนาเช่นผ่าน scripts ใน package.json อยู่ที่ src/migrations/**/*.ts 
- ตำแหน่งของการเรียกใช้โค้ดสำหรับ Migration ตอนเรียกใช้โปรแกรม(เช่นใน docker) จะเรียกใน dist จะอยู่ที่ __dirname + "/migrations/**/*.{ts,js}"
- ถ้ากำหนดตำแหน่งโค้ดไม่ถูกต้อง Migration จะทำให้ไม่ทำงาน


## Start Services
เรียกใช้งาน 
```sh
npm start -w services/migration-service
npm start -w services/product-service
npm start -w services/order-service
```
ทดสอบด้วย [test.http](test.http)(Rest Client) หรือ curl เนื่องจากไม่มีข้อมูลจะส่ง Empty Array กลับมา
```sh
curl -i http://localhost:3000/migrate 
curl -i http://localhost:3002/products 
curl -i http://localhost:3003/orders
```

## Docker
จะมี [docker-compose.yml](docker-compose.yml) เตรียมไว้
ทุก service มี 
[Dockerfile](services/migration-service/Dockerfile) 
ให้ 
ทุก services มีการใช้ฐานข้อมูลควรตั้งค่าตัวแปรแวดล้อม DB_DATABASE ใน .env ให้ดูตัวอย่างในไฟล์ [.env.example](.env.example)
```sh
docker compose build
docker compose up -d
docker compose down
```
สำหรับการ build จาก root repo เพื่อขึ้น registry 
เพิ่มบรรทัดนี้ใน /etc/hosts ของเครื่อง desktop แก้ ip address เป็นเครื่องของเราไม่ควรใช้ิ 127.0.0.1
```
192.168.2.49 ms-mono-typeorm.local
```
สำหรับการทดสอบ จะใช้ insecure-registries(HTTP) แก้คอนฟิกของ Docker
- Linux: /etc/docker/daemon.json
- Windows Server: C:\ProgramData\docker\config\daemon.json
- Docker Desktop (Mac/Windows): Configure via the Docker icon -> Settings -> Daemon/Insecure registries UI.

daemon.json มีค่าดังนี้
```
{
  "insecure-registries": ["http://ms-mono-typeorm.local"]
}
```
restart docker service, เริ่มใช้ container registry, ลอง build/push image
```bash
sudo systemctl daemon-reload && sudo systemctl restart docker
cd deploy/demo_services
docker compose up -d registry
cd ../..
docker build -t ms-mono-typeorm.local/demo/migration-service:latest -f services/migration-service/Dockerfile .
docker push ms-mono-typeorm.local/demo/migration-service:latest
curl http://ms-mono-typeorm.local/v2/_catalog

```
คำสั่งสำหรับ build services ต่างๆ
```sh
docker build -t ms-mono-typeorm.local/demo/migration-service:latest -f services/migration-service/Dockerfile .
docker build -t ms-mono-typeorm.local/demo/product-service:latest -f services/product-service/Dockerfile .
docker build -t ms-mono-typeorm.local/demo/order-service:latest -f services/order-service/Dockerfile .
```


## Homework
- ลองสร้างอีก workspace ชื่อ services/user-service ใช้ port 3001 
มี Entities [User.ts](packages/database-entities/src/User.ts) เตรียมไว้แล้ว
อาจจะใช้ Framework ที่ต่างออกไปก็ได้เช่น Elysia.js, TSOA
- เพิ่มข้อมูล แล้วสร้าง API CRUD ให้สมบูรณ์

## Sparse checkout
Git 2.25+ ทำการ clone โค้ดแค่บางส่วนรวมถึงไฟล์ที่อยู่ใน root repo ด้วย เร็วและใช้เนื้อที่น้อยกว่า clone ทั้ง repo
- cone mode ในคำสั่งเดียวใช้ --sparse
- ใช้ร่วมกับ partial clone ใช้ --filter=blob:none 

```sh
# Sparc checkout. Get only files in root repo
git clone --filter=blob:none --sparse https://github.com/schooltechx/ms-mono-typeorm.git
cd ms-mono-typeorm
git sparse-checkout set packages/database-entities packages/database 
git sparse-checkout list
# Switch to feature branch, Still only database-entities, database,migration-service  checked out
git checkout feature-branch
# If feature branch has new directories you need:
git sparse-checkout add services/migration-service
git sparse-checkout add services/product-service
# If working directory gets out of sync
git sparse-checkout reapply
# Restore full working directory
git sparse-checkout disable
```
## Github Actions
[nektos/act](https://github.com/nektos/act) 
ใช้เพื่อทดสอบ workflow ของ Github Action  แบบ lcal ติดตั้งดังนี้
```bash
curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
# หรือผ่าน brew
brew install act

```
สร้าง personal access token สำหรับใช้กับ Workflow ของ Github Action
- ไปที่การตั้งค่า profile ของ GitHub, 
- คลิ้กที่ “Developer settings”
- คลิ้กที่ “Personal access tokens/Fine-grained personal access tokens”
- เลือกสิทธิ์ที่จะให้ กรณีนี้เป็น public repo อยู่แล้วไม่ต้องให้สิทธิ์อะไรเพิ่ม
- คลิ้กที่ “Generate new token” ให้เก็บค่านี้ไว้

ค่า token ควรเก็บไว้ที่ [secret](https://nektosact.com/usage/#secrets) 
ถ้าใช้กับ act สามารถใช้ผ่านพารามิเตอรื "--secret TOKEN=XXX" หรือไฟล์ [.secrets](.secrets.example)

เรียใช้ [build-a-service.yaml](.github/workflows/build-a-service.yaml),
job build-docker และใช้ input เพื่อรับค่า service ที่ต้องการ ตัวอย่างใช้ migration-service
```bash
act --workflows .github/workflows/build-a-service.yaml -j build-docker --input NAME=migration-service 
```



## Misc
- [How to Structure a Monorepo with Docker](https://oneuptime.com/blog/post/2026-02-08-how-to-structure-a-monorepo-with-docker/view)
- [TypeORM Caching queries](https://typeorm.io/docs/query-builder/caching/)
- [Node js Microservices Series](https://medium.com/@afdulrohmat03/node-js-microservices-series-bookstore-project-part-1-introduction-tech-stack-and-setup-829744408745)
- [How to Configure Git Sparse Checkout](https://oneuptime.com/blog/post/2026-01-24-git-sparse-checkout/view)
- [Skip the Push: How to Debug GitHub Actions Locally Using Nektos/Act](https://levelup.gitconnected.com/skip-the-push-how-to-debug-github-actions-locally-using-nektos-act-fe518e53f1ed)
- [CI/CD Made Easy: GitHub Actions, Docker Compose, and Watchtower](https://medium.com/@avash700/ci-cd-made-easy-github-actions-docker-compose-and-watchtower-60a698d24f27)
