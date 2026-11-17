# Clínica Sorriso – versão final acessível (SCC0580)

Site estático (HTML, CSS e JavaScript puros, sem bibliotecas). Abra `index.html` no navegador ou publique a pasta inteira no GitHub Pages.

## Caminhos felizes

**Marina (23 anos, TEA nível 1) – agendar consulta presencial**
Início → Agendar consulta → 1. O quê (para mim, avaliação e limpeza, na clínica) → 2. Quando (Dra. Ana Lima, dia e horário com as setas) → 3. Conforto (sala silenciosa, avisar antes de cada etapa…) → 4. Seus dados (ou “Entrar sem senha”) → 5. Revisar → Confirmar → Consulta marcada (baixar lembrete .ics, ver como é a consulta).

**Marina – teleconsulta de retorno**
Minhas consultas → Preparar e entrar na teleconsulta → escolher “Só mensagens” (câmera desligada) → Entrar na sala → responder às 3 perguntas → Sair da sala.

**Lucas (9 anos, TEA nível 2) com a mãe**
Início → “Quem está usando”: Lucas → Ver como é a consulta (4 pictogramas, vídeo sem som com legendas, sala e kit sensorial) → Escovar os dentes (5 passos com temporizador visual e fim previsível). A mãe pode ligar o Modo bloqueado em Preferências (PIN de teste: 1234).

## Os 7 problemas e onde a solução aparece

| Problema | Solução no site |
|---|---|
| 1. Páginas densas, carrosséis e banners | Início com 3 ações, nada se move, Modo calmo ligado por padrão |
| 2. Autoplay, sons e pop-ups | Vídeo sem autoplay e sem som, legendas e transcrição; leitura em voz só ao tocar; nenhum pop-up |
| 3. Teleconsulta com câmera obrigatória | Escolha de canal (vídeo, áudio, mensagens), câmera e autoimagem desligadas, roteiro do que vai acontecer |
| 4. Chatbots, URAs e telefone | Ajuda humana por mensagem, linguagem literal, resumo completo antes e depois de confirmar |
| 5. Formulários longos, tempo-limite e CAPTCHA | 5 etapas com progresso, salvamento automático, sem tempo-limite, máscaras, erros que explicam como corrigir, entrar por link no e-mail |
| 6. Atualizações que mudam o layout | Página Novidades com data, prévia e opção de manter o visual; menu sempre igual; modo bloqueado |
| 7. Jogos com recompensas variáveis | Escovação com início, meio e fim, temporizador silencioso, sem compras nem prêmio-surpresa |

## Recursos de acessibilidade obrigatórios

- Botões A−, A e A+ (87,5% a 200%, sem zoom do navegador) e Alto contraste no topo de todas as páginas.
- VLibras (widget oficial) e botão “Libras” no topo.
- WAI-ARIA em mais de 10 componentes (switch, radiogroup, tablist, aria-expanded, aria-current, log, timer, progressbar, aria-invalid, alert/status, aria-pressed). A tabela completa está na página Acessibilidade.
- Atalhos Alt+1 (conteúdo), Alt+2 (menu) e Alt+3 (rodapé).

## Testes realizados (17/11/2026)

- axe-core 4 (regras WCAG 2.0/2.1/2.2 A e AA + boas práticas): 0 violações nas 15 telas, nos temas claro, escuro e alto contraste, incluindo etapas do formulário, erros, diálogos e sala de teleconsulta.
- Caminho feliz automatizado (Playwright): 64 verificações, incluindo teclado (setas, Tab, Espaço, Esc), máscaras, mensagens de erro, recarregar sem perder dados, download do .ics e modo bloqueado.
- Sem rolagem horizontal em celular (390 px), tablet (820 px) e computador (1440 px), inclusive com texto a 200%.

## Imagens

Todas as ilustrações (pasta `img/`) e o vídeo (`media/`) foram gerados por IA (Claude Opus 5.5, Anthropic) como código SVG original. Os créditos aparecem no canto superior direito de cada imagem, no rodapé e na página Créditos.

## Publicar no GitHub Pages

1. Crie um repositório público e envie o conteúdo desta pasta (com `index.html` na raiz).
2. Em Settings → Pages, escolha a branch `main` e a pasta `/ (root)`.
3. O link fica no formato `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.
