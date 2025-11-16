FROM node:20-slim

# ติดตั้ง g++ สำหรับ compile C++
RUN apt-get update && apt-get install -y g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1) ติดตั้ง dependency ใน container (จะ resolve ตาม linux-x64)
COPY package*.json ./
RUN npm install

# 2) คัดลอกซอร์สที่เหลือ แล้ว build
COPY . .
RUN npm run build

# 3) ตัด devDependencies ทิ้ง เหลือแต่ของ production
RUN npm prune --production

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "build/index.js"]
