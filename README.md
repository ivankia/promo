# API

REST API для системы промокодов.
Стек: Node.js, TypeScript, NestJS, Fastify(адаптер), PostgreSQL(Prisma), Docker

## Установка в контейнере

```bash
docker-compose up -d
```

Это автоматически:

- Запустит контейнер PostgreSQL на порту 5432
- Выполнит миграции БД
- Запустит приложение на порту 3000

### Локальная установка

```bash
npm i
```

```env
PORT=3000
DATABASE_URL="postgres://promo:promo@127.0.0.1:5432/promo"
POSTGRES_DB=promo
POSTGRES_USER=promo
POSTGRES_PASSWORD=promo
POSTGRES_PORT=5432
POSTGRES_HOST=127.0.0.1
LOG_LEVEL=debug,error
```

```bash
npm run migrations
npm run start:dev
```

Приложение будет доступно на `http://localhost:3000`

### Swagger UI

После запуска приложения откройте: http://localhost:3000/api

### Endpoints

#### Управление промокодами

**Список промокодов**

```http
GET /promo/list?limit=50&cursor=<id>
```

**Получить промокод**

```http
GET /promo/:id
```

**Создать промокод**

```http
POST /promo/create
Content-Type: application/json

{
  "code": "SALES2026",
  "discountPercent": 15,
  "activationsLimit": 100,
  "expirationDate": "2026-12-31T23:59:59Z",
  "isActive": true
}
```

**Обновить промокод**

```http
PUT /promo/:id
Content-Type: application/json

{
  "discountPercent": 20,
  "isActive": true
}
```

**Удалить промокод**

```http
DELETE /promo/:id
```

#### Активация

**Активировать промокод**

```http
POST /activation/activate
Content-Type: application/json

{
  "promocode": "SALES2026",
  "email": "user@email.com"
}
```

Ответ (200 OK):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "promocodeId": "550e8400-e29b-41d4-a716-446655440001",
  "email": "user@email.com",
  "activatedAt": "2026-04-05T10:32:53Z"
}
```

#### Healthcheck

```http
GET /healthcheck
```

Ответ (200 OK):

```json
{
  "status": "OK",
  "database": "connected",
  "timestamp": "2026-04-05T10:52:45Z"
}
```
