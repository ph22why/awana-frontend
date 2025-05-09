FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x ./node_modules/.bin/tsc

RUN npm run build

EXPOSE 3002

# 서비스 시작 시 교회 데이터 초기화 후 서버 실행
CMD sh -c "node dist/scripts/importChurchData.js && npm start" 