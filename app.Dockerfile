FROM php:7.2-fpm-alpine

COPY backend /var/www/html/scripts
COPY dictionaries /var/www/html/dictionaries

RUN mkdir -p /var/www/html/logs && chown www-data:www-data /var/www/html/logs
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
