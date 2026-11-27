# PiBoss Language

Aplicativo móvel educacional voltado para a promoção do aprendizado lúdico de vocabulário em língua inglesa na primeira infância (3 a 6 anos), combinando jogos digitais sérios (*Serious Games*) e um agente pedagógico adaptativo baseado em **Lógica Fuzzy**.

Projeto desenvolvido no âmbito da pesquisa apresentada no **17º CONICT (Congresso de Inovação, Ciência e Tecnologia)** — IFSP Campus Guarulhos.

---

## Visão Geral

Aplicativos infantis tradicionais costumam adotar avaliações estritamente binárias (*acertou / errou*), o que pode gerar frustração ou estimular respostas por tentativa e erro sem real assimilação fonética.

O **Pibo's Language** propõe uma abordagem acolhedora, multissensorial e adaptativa:

* **Dois Mundos Integrados:**
  * **Mundo dos Animais:** foco em vocabulário, grafia e reconhecimento auditivo em inglês.
  * **Mundo dos Habitats:** associação ecológica entre os animais e seus respectivos ambientes naturais.
* **6 Biomas Progressivos:** Fazenda (*Farm*), Doméstico (*Home*), Floresta (*Forest*), Jardim (*Garden*), Savana (*Savannah*) e Oceano (*Ocean*).
* **4 Módulos Pedagógicos por Nível:**
  1. **Apresentação:** primeiro contato visual e sonoro, sem pressão avaliativa.
  2. **Fixação:** exploração guiada com reforço auditivo.
  3. **Retenção:** fila dinâmica em que erros retornam ao final da sequência para revisão, sem punição.
  4. **Desafio Final:** avaliação conduzida pelo **Agente PIBO**.
* **Operação 100% Offline:** todos os áudios de animais estão embutidos no aplicativo, a pronúncia utiliza o sintetizador nativo do dispositivo e o progresso é salvo localmente, garantindo privacidade infantil e funcionamento sem internet.

---

## Agente PIBO (Lógica Fuzzy)

O motor de inferência implementado em [`src/ai/piboAgent.ts`](src/ai/piboAgent.ts) avalia cada resposta da criança de forma contínua, considerando:

* **Tempo de resposta (`responseTimeMs`):** fuzzificado em três conjuntos de pertinência — **Rápido**, **Médio** e **Lento** — calibrados para o tempo de reação motora infantil.
* **Modificadores pedagógicos:** acerto/erro e utilização de dicas de apoio.

A partir da inferência, o agente calcula um índice de qualidade entre `0.0` e `1.0` e executa ajustes dinâmicos em tempo real (*Dynamic Difficulty Adjustment*):

| Faixa de Qualidade | Ação do PIBO | Adaptação no Aplicativo |
| :--- | :--- | :--- |
| `>= 0.75` | `advance` | Mantém ritmo fluido (`0.95x`) e celebra a autonomia |
| `0.45` a `0.74` | `maintain` | Mantém velocidade padrão (`0.90x`) para consolidação |
| `< 0.45` | `support` | Reduz a velocidade da fala (`0.75x`) e reforça pistas sonoras |

Ao final da sessão, a aprovação ocorre quando a qualidade média atinge pelo menos **60%**, desbloqueando o próximo bioma e novos avatares no perfil. Abaixo desse limiar, o nível permanece em modo de treino para prática livre, sem rebaixamento punitivo.

---

## Usabilidade e Segurança Infantil

* **Orientação horizontal (paisagem)** otimizada para telas de celulares e tablets.
* **Bloqueio de gestos laterais** para evitar saídas acidentais durante o toque infantil.
* **Trava Parental com tabuada** para proteger a edição de informações do perfil.
* **Feedback visual por estrelas** proporcional ao número de animais de cada nível.

---

## Tecnologias Utilizadas

* **React Native** + **Expo** (SDK 58)
* **TypeScript**
* **Expo Router** (navegação baseada em arquivos)
* **Expo Audio** e **Expo Speech** (áudios locais e síntese de voz)
* **AsyncStorage** (persistência local de progresso e perfil)
* **EAS Build** (geração de build Android APK)

---

## Estrutura do Projeto

```text
piboss-language/
├── assets/
│   ├── icons/          # Ilustrações dos biomas e controles
│   ├── images/         # Identidade visual do aplicativo
│   └── sounds/         # Efeitos sonoros e sons reais de animais (.mp3)
├── src/
│   ├── ai/             # Motor de inferência Fuzzy do Agente PIBO
│   ├── app/
│   │   ├── animal-game/   # Módulos do Mundo dos Animais
│   │   └── habitat-game/  # Módulos do Mundo dos Habitats
│   ├── components/     # Componentes visuais reutilizáveis
│   ├── data/           # Catálogo de biomas, habitats e espécies
│   ├── services/       # Serviços de áudio e armazenamento local
│   ├── styles/         # Estilos das telas e módulos
│   └── utils/          # Utilitários de responsividade
├── app.json            # Configurações do aplicativo Expo
├── eas.json            # Perfis de build (APK)
└── qrcode_download_apk.png
```

---

## Como Executar Localmente

### Pré-requisitos
* Node.js (versão LTS recomendada)
* Aplicativo **Expo Go** instalado no celular (Android ou iOS) ou emulador configurado

### Passo a passo

```bash
# 1. Instale as dependências
npm install

# 2. Inicie o servidor de desenvolvimento
npx expo start
```

Escaneie o QR Code exibido no terminal com o **Expo Go** (Android) ou com a câmera nativa (iOS). Caso esteja em uma rede com restrições de firewall, utilize:

```bash
npx expo start --tunnel
```

---

## Testar no Android (APK)

Para instalar diretamente em um dispositivo Android sem necessidade de ambiente de desenvolvimento, escaneie o QR Code abaixo:

<p align="center">
  <img src="./qrcode_download_apk.png" alt="QR Code para download do APK do PiBoss Language" width="240" />
</p>

---

## Referências Bibliográficas

* MARTINS, Giovana Maria Carvalho; LIMA, Thereza Cristina de Souza. **Inglês na primeira infância: educação bilíngue no Brasil**. *Revista Linguíʃtica*, Rio de Janeiro, v. 17, n. 2, p. 367-380, maio/ago. 2021. DOI: https://doi.org/10.31513/linguistica.2021.v17n2a41517.
* PAPANASTASIOU, George P.; DRIGAS, Athanasios S.; SKIANIS, Charalabos. **Serious Games in Preschool and Primary Education: Benefits and Impacts on Curriculum Course Syllabus**. *International Journal of Emerging Technologies in Learning (iJET)*, v. 12, n. 1, p. 44-56, 2017. DOI: https://doi.org/10.3991/ijet.v12i01.6065.
* SOUZA, Átila de *et al*. **Inteligência artificial e aprendizado adaptativo, no contexto educacional**. *Revista Ilustração*, Cruz Alta, v. 5, n. 9, p. 73-90, 2024.

---

