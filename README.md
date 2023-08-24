# ITifico_Server

> Серверная часть проекта (Backend)

---

# Технологии в этом части:
- **Node.js** — основная технология;
- **Express** — для оброботки **I/O** запросов на сервер;
- **multer** - загрузка картинки для блогов и курсов.
- **MongoDB** — использован в качестве базы данных;
- **mongoose** (ODM) — создание ***Модели(Schema)*** для базы данных **MongoDB**;

---

# Для запуска коды:
1. Скачайте или клонируйте исходники — [здесь(ITifico_Server)](https://github.com/ITifico/ITifico_Server);
```bash
$ git clone https://github.com/ITifico/ITifico_Server.git
$ cd ITifico_Server/server
```

2. Установите пакеты с помощью ***npm***:
```bash
$ npm install 
```

3. Создайте новый файл с названием `.env` и добавьте нужные переменные(***Environment Variables***);
```env
PORT=<порт для запуска сервера, например "5000|8080">
CLIENT_URLS=<можно добавить несколько URL от UI части для разрешение доступа CORS, в формате "http://example.com,http://another.com" 
MONGOURI=<mongodb подключение URI>
// Вы сможете использовать тестовую базу данных,подключая этот URI "mongodb+srv://Dilrozbek_Raximov:931897318Rd@cluster0.e9gps.mongodb.net/maximal-demo"
```

4. Запускайте проект локально:
```bash
$ npm start
```

---

# Требования
- Node.js v16.0.0 или новее (предпочтительно v18).
