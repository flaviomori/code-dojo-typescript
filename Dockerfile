# Imagem de dev: Node dentro do container para que o único pré-requisito local seja Docker.
# Node 22 LTS (bookworm-slim) — multi-arch (amd64 + arm64).
# Pin: tag legível + digest do índice multi-arch para builds reprodutíveis ao longo do tempo.
FROM node:22.22.3-bookworm-slim@sha256:7af03b14a13c8cdd38e45058fd957bf00a72bbe17feac43b1c15a689c029c732

# curl para o smoke test do app.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependências em camada cacheável. Em runtime, um volume nomeado preserva o node_modules
# (ver docker-compose.yml), sem ser sombreado pelo bind-mount do código.
COPY package.json package-lock.json ./
RUN npm ci

# O código é bind-mountado em runtime; o app roda com hot-reload via `tsx watch`.
