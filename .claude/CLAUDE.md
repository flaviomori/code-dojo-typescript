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
- **Testes**: Testcontainers (Postgres real). Sem in-memory.
- **Money**: `decimal.js` (serializado como `string` nos DTOs).

## Rodando local

```bash
docker compose up -d
npm run dev
```

## Testes

```bash
npm test
```
