# code-dojo-typescript

Sistema interno de repasses a médicos credenciados.

## Convenções

- **Feature folders**: cada entidade (`earning`, `paymentsplit`, `practitioner`, `bankaccount`) em sua própria pasta com controller / service / repository / dtos / type.
- **Camadas estritas**:
  - **Controller** — HTTP only. Recebe request, chama Service, responde com `*Response` (DTO). Nunca expõe entidade direto.
  - **Service** — lógica de negócio. Sem HTTP, sem SQL.
  - **Repository** — acesso a banco via `pg.Pool`.
- **Auth**: header `X-Operator-Id` obrigatório. Extraído via `requireAuth(req)`.
- **Erros**: `NotFoundError`, `BadRequestError` → middleware global traduz para HTTP.
- **Testes**: Postgres real via compose (serviço `postgres-test`). Sem in-memory.
- **Money**: `decimal.js` (serializado como `string` nos DTOs).

## Rodando local

Pré-requisito: Docker (e Git). O Node roda dentro do container.

```bash
make app    # sobe Postgres + app em :8080 (hot-reload)
```

## Testes

```bash
make test   # roda a suíte (Vitest) contra o postgres-test
```
