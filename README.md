# Detetive Online

Jogo multiplayer de investigação e matemática, feito com Node.js, Express e Socket.IO.

## Recursos
- Criação de sala e entrada por código.
- Até 8 jogadores por sala.
- Personalização de apelido e cor do personagem.
- Mapa de cidade com delegacia, mercado, casas e caverna.
- Movimento sincronizado entre jogadores e carros que podem ser dirigidos.
- Desafio matemático compartilhado para concluir a missão.

## Publicar na internet (GitHub + Render)

1. Extraia o ZIP no celular ou computador.
2. No GitHub, abra o repositório `detetive-online`.
3. Toque em **Add file / Adicionar arquivo** e depois **Upload files / Enviar arquivos**.
4. Envie os itens de dentro da pasta do projeto, preservando a estrutura: `package.json`, `server.js`, `README.md` e a pasta `public` com `index.html` dentro dela. Não envie o ZIP fechado.
5. Faça o commit dos arquivos.
6. No Render, crie um **New + → Web Service** e conecte o repositório `detetive-online`.
7. Configure: Runtime **Node**, Build Command `npm install`, Start Command `npm start`.
8. Crie o serviço e aguarde a publicação. O Render fornecerá um endereço `https://...onrender.com`.
9. Abra o endereço em dois aparelhos/navegadores, crie uma sala e entre usando o código para testar o multiplayer.

## Rodar localmente
Requer Node.js 20 ou superior:

```bash
npm install
npm start
```
Abra `http://localhost:3000`.

## Observações
- Salas e progresso ficam na memória do servidor; reiniciar o serviço apaga as salas ativas.
- Esta versão não tem banco de dados nem chat de texto.
- Para jogar, use apelidos. Não publique telefone, endereço, escola ou outras informações pessoais.
- O servidor deve permanecer ligado para o multiplayer funcionar.
