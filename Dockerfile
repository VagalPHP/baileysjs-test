# Usa a imagem oficial do Node.js como base
FROM node:18

# Define o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Copia os arquivos package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código para o contêiner
COPY . .

# Expõe a porta 3000 para a aplicação
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
