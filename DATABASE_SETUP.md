# Настройка базы данных

## Формат URL для PostgreSQL

Стандартный формат URL для PostgreSQL:
```
postgresql://username:password@host:port/database_name
```

## Примеры URL для различных сервисов

### 1. Локальная PostgreSQL база данных
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/my_rest_api"
```

### 2. PostgreSQL с Docker
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/my_rest_api"
```

### 3. Supabase
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### 4. Railway
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@containers-us-west-[ID].railway.app:5432/railway"
```

### 5. Neon
```bash
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/[DB_NAME]?sslmode=require"
```

### 6. PlanetScale
```bash
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/[DB_NAME]?sslmode=require"
```

### 7. AWS RDS
```bash
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:5432/[DB_NAME]"
```

## Настройка локальной базы данных

### 1. Установка PostgreSQL

**macOS (с Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Создание базы данных
```bash
# Подключение к PostgreSQL
psql -U postgres

# Создание базы данных
CREATE DATABASE my_rest_api;

# Создание пользователя (опционально)
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE my_rest_api TO myuser;

# Выход
\q
```

### 3. Настройка .env файла
Создайте файл `.env` в корне проекта:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/my_rest_api"
```

## Запуск миграций

После настройки URL базы данных, запустите миграции:
```bash
# Генерация миграций
npm run db:generate

# Применение миграций
npm run db:migrate
```

## Проверка подключения

Для проверки подключения к базе данных используйте:
```bash
psql "postgresql://postgres:password@localhost:5432/my_rest_api"
```

## Безопасность

- Никогда не коммитьте файл `.env` в репозиторий
- Используйте сильные пароли
- Ограничьте доступ к базе данных только необходимыми IP-адресами
- Используйте SSL для облачных баз данных
