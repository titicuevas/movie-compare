# Usamos una imagen base con PHP y Node.js para Laravel
FROM php:8.2-fpm

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    curl \
    pkg-config \
    libsqlite3-dev \
    nodejs \
    npm \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_sqlite gd

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copiar los archivos del proyecto al contenedor
WORKDIR /var/www/html
COPY . .

# Instalar dependencias de Laravel y React
RUN composer install && npm install && npm run build

# Asegurar permisos correctos para SQLite
RUN chmod -R 777 storage bootstrap/cache database/database.sqlite

# Exponer el puerto de Laravel
EXPOSE 9000

# Comando para iniciar PHP-FPM
CMD ["php-fpm"]
