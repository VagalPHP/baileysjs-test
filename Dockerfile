# Usa a imagem oficial do Node.js como base
FROM node:20.11.1-alpine

# Define o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Clona o repositório da aplicação
RUN git clone https://github.com/VagalPHP/baileysjs-test.git .

# Instala as dependências
RUN npm install

# Copia o restante do código para o contêiner
COPY . .

# Builda os arquivos
RUN npm run build

# Expõe a porta 3000 para a aplicação
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
