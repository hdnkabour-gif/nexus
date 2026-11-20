# LOCAL TEST IMAGE ONLY (NEXUS pilot diagnostics). Mirrors PNEU CI: PHP 8.4 + pdo_pgsql pgsql intl zip gd bcmath + pg client 18.
FROM dunglas/frankenphp:1-php8.4-bookworm
ARG HTTPS_PROXY
ARG HTTP_PROXY
RUN install-php-extensions pdo_pgsql pgsql intl zip gd bcmath \
 && apt-get update && apt-get install -y --no-install-recommends ca-certificates curl gnupg unzip git \
 && install -d /usr/share/postgresql-common/pgdg \
 && curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc \
 && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
 && apt-get update && apt-get install -y --no-install-recommends postgresql-client-18 \
 && rm -rf /var/lib/apt/lists/*
