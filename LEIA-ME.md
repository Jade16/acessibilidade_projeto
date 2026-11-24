# Clínica Sorriso - versão revisada

Site estático em HTML, CSS e JavaScript. Abra index.html para explorar. Para reproduzir legendas VTT e evitar restrições de arquivos locais, sirva a pasta por HTTP (por exemplo: python3 -m http.server 8000) e acesse http://localhost:8000.

## Conteúdo da revisão

- 25 imagens geradas com GPT/OpenAI: 24 ilustrações JPG em img/ e uma capa JPG em media/. Os SVG ilustrativos antigos foram substituídos; logo.svg foi simplificado e ícones funcionais continuam vetoriais.
- Vídeo de quatro cenas, 63 segundos, narração descritiva opcional, legendas e transcrição. Som desligado por padrão.
- Ajustes de refluxo até 320 px e texto até 200%; foco, controles, modo calmo, estados ARIA e salvamento com aviso de falha.
- Atividade com avanço voluntário entre passos, tempo efetivamente medido, sem recompensas variáveis.
- Serviços fictícios identificados como simulação. Botão para apagar os dados locais. O PIN limita rotas da aplicação, não é uma barreira de segurança do dispositivo.
- VLibras carregado sem bloquear o funcionamento do site; exige conexão.

## Fluxos

Marina: Início → Agendar → Para mim / Avaliação e limpeza / Na clínica → Dra. Ana / dia / horário → Conforto → Dados fictícios → Revisar → Confirmar.

Dados de teste: Marina Oliveira; 14/03/2003; CPF 123.456.789-09; celular (16) 99123-4567; marina@example.com.

Lucas com a mãe: escolher perfil Lucas → Como é a consulta → quatro passos, vídeo opcional → Escovar os dentes → começar, pausar e avançar → fim. O responsável pode criar um PIN de quatro números em Preferências. Não há PIN padrão nesta versão.

Teleconsulta: usar o retorno demonstrativo → Só mensagens → entrar → responder às três perguntas → sair. Nenhum áudio ou vídeo real é transmitido.

## Documentação

- docs/relatorio-acessibilidade.pdf: documento complementar para avaliação.
- docs/relatorio.html: conteúdo textual equivalente, incluindo matriz dos 146 itens da ABNT.
- docs/prompts-imagens.json: prompts exatos usados no gerador integrado de imagens GPT.
- docs/matriz-abnt.json: requisitos e recomendações com evidências e pendências.
- docs/testes-*.json: evidências dos testes desta revisão.

## Verificação e limites

Os testes produzidos nesta revisão substituem as declarações de testes anteriores que não vieram acompanhadas de evidências. A bateria abrange 42 varreduras axe-core em 14 rotas e três temas, nove varreduras de estados de fluxo e 112 combinações de largura e tamanho de fonte. Consulte os JSONs para os resultados, inclusive itens inconclusivos.

Não há certificação integral ABNT/WCAG. Ainda são necessárias avaliação com público-alvo, leitores de tela e Libras, revisão clínica das instruções e publicação aberta. O widget externo não participa da bateria automatizada com rede bloqueada. Não inserir dados reais em demonstrações.

## Publicação

O repositório encontrado no projeto original é https://github.com/Jade16/acessibilidade_projeto. A revisão local não foi enviada ao repositório nem publicada automaticamente. Envie os arquivos revisados e confirme o GitHub Pages antes da avaliação. Inclua o endereço público no PDF após publicar.

Figma informado no anexo: https://www.figma.com/design/M61oM5j5VmStUJZvlkaivN?node-id=1-16. Confirme que o compartilhamento está aberto.
