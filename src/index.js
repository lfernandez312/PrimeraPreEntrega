const express = require('express');
const handlebars = require('express-handlebars');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const router = require('./router');
const FilesDao = require('./dao/files.dao');
const mongoConnect = require('./db')
const productController = require('./controllers/product.controller');


const app = express();

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(process.cwd() + '/src/public'));
app.engine('handlebars', handlebars.engine());
app.set('views', process.cwd() + '/src/views');

router(app);

app.get('/', (req, res) => {
  res.send('<h1>Haz clic para ir al destino necesario</h1><input type="button" onclick="window.location.href=\'/chat\';" value="Chat" /><input type="button" onclick="window.location.href=\'/products\';" value="Products" /><input type="button" onclick="window.location.href=\'/cart\';" value="Carts" />');
});

mongoConnect();

const connectedUsers = new Set();
const chatFile = new FilesDao('chats.json');

// Cargar mensajes desde el archivo al inicio
let chats = [];

async function loadChatsFromFile() {
  const data = await chatFile.getItems();
  chats = data.map((chat) => ({ ...chat, createdAt: new Date(chat.createdAt) }));
}

loadChatsFromFile();

const httpServer = app.listen(8080, () => {
  console.log('Server running at port 8080');
});

const io = new Server(httpServer);

io.on('connection', (socket) => {
  socket.on('newUser', (data) => {
    socket.username = data.username;
    connectedUsers.add(data.username);
    socket.emit('messageLogs', chats);
    io.emit('userConnected', { username: data.username, connectedUsers: Array.from(connectedUsers) });
  });

  socket.on('addProduct', (newProduct) => {
    // Lógica para agregar el nuevo producto
    productController.addProduct(newProduct);
    // Emitir evento de actualización a todos los clientes conectados
    io.emit('updateProducts', productController.getAllProducts());

  });

  socket.on('message', (data) => {
    const message = { ...data, createdAt: new Date() };
    chats.push(message);
    io.emit('messageLogs', chats);
    // Escribir los mensajes en el archivo chat.json
    chatFile.writeItems(chats);
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(socket.username);
    io.emit('userDisconnected', { username: socket.username, connectedUsers: Array.from(connectedUsers) });

    // Crear un nuevo array de chats con la información de desconexión
    const disconnectionMessage = {
      username: socket.username,
      message: 'se ha desconectado',
      createdAt: new Date(),
    };

    chats.push(disconnectionMessage);
    io.emit('messageLogs', chats);
    // Escribir los mensajes en el archivo chat.json
    chatFile.writeItems(chats);
  });
});
