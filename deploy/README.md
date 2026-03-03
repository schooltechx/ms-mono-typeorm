# Demo

## Demo1
เรียกใช้ app_services เป็นโปรแกรมเสริมที่ใช้ใน demo
- traefik เป็น API Gateway
- registry ที่เก็บ Docker Image(container registry)
- watchtower โปรแกรมที่คอยอัปเดต Image ล่าสุดจาก container registry มาแทนที่ใช้งานอยู่

```bash
docker network create demo
cd deploy/demo/services
mkdir data_registry
docker compose up -d traefik watchtower registry
cd ../../..
act --workflows .github/workflows/build-deploy-services.yaml --input TAG=1.1

```

[nickfedor/watchtower](https://watchtower.nickfedor.com/)
[WUD (aka What's up Docker?)](https://github.com/getwud/wud/tree/main/docs)
[dockcheck](https://github.com/mag37/dockcheck)
[Diun](https://crazymax.dev/diun/)