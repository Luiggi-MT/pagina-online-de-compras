# Dockerfile

# Imagen base de Node.js
FROM node:18

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Variables de entorno
ENV IN=production
ENV USER_DB=root
ENV PASS=example
ENV SECRET_KEY="EsTa MisMa:i8775tyjk,"

# Configuración para conectar a la base de datos
ENV DB_NAME=myProject
# Usar el nombre del servicio mongo como el host para la base de datos
ENV DB_HOST=mongo 
# Exponer el puerto en el que corre la aplicación
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["node", "tienda.js"]
