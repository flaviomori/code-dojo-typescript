import { defineConfig } from "vitest/config";

// Os dois arquivos de teste compartilham o mesmo Postgres (`postgres-test`), então
// rodam em série (sem paralelismo de arquivos) para não competir na limpeza das tabelas.
export default defineConfig({
  test: {
    fileParallelism: false,
    // Lista cada teste pelo nome na saída (em vez de só o arquivo + contagem).
    reporters: ["verbose"],
  },
});
