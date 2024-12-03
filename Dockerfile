# Usa a imagem oficial do Node.js como base
FROM node:20.11.1-alpine

# Instala o Git (caso precise de funcionalidades específicas com Git no contêiner)
RUN apk update && apk add git

# Define o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Copia os arquivos do diretório atual para o diretório de trabalho do contêiner
COPY . .

# Instala as dependências
RUN npm install

# Builda os arquivos
RUN npm run build

# Expõe a porta 3000 para a aplicação
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
