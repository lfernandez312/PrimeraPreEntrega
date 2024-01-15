const fs = require('fs');
const { Router } = require('express')
const Cart = require('../models/carts.model')
const prompt = require('prompt-sync')(); // Importa la librería prompt-sync
const FilesDao = require('../dao/files.dao');
const Messages = require('../models/messages.model');
const productController = require('./product.controller'); // Asegúrate de tener tu controlador de productos
const Products = require('../models/products.model');

const chatFile = new FilesDao('chats.json');

const router = Router()

router.get('/products', async (req, res) => {
    try {
        const productList = await productController.getAllProducts();
        res.render('products.handlebars', { products: productList, style: 'estilos.css' });
    } catch (error) {
        console.error('Error al obtener la lista de productos', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.post('/products/in', async (req, res) => {
    try {
      const { product, price } = req.body;
  
      const newProductInfo = {
        product,
        price
      };
  
      const newProduct = await Products.create(newProductInfo);
  
      res.json({ payload: newProduct });
    } catch (error) {
      console.error('Error al crear mensaje en MongoDB:', error);
      res.status(500).json({ error: error.message });
    }
  });

router.get('/cart', async (req, res) => {
  try {
    const carts = await Cart.find()
    res.json({ payload: carts })
  } catch (error) {
    res.json({ error })
  }
})

router.get('/cart/:id', async (req, res) => {
  try {
    const { id } = req.params

    const user = await Cart.findOne()
    res.json({ payload: user })
  } catch (error) {
    res.json({ error })
  }
})

router.post('/cart/', async (req, res) => {
  try {
    const { user, products, total} = req.body

    const newCartInfo = {
      user,
      products,
      total
    }

    const newCart = await Cart.create(newCartInfo)

    res.json({ payload: newCart })
  } catch (error) {
    res.json({ error: error.message })
  }
})

router.put('/cart/:id', async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body

    await Cart.updateOne({ _id: id}, body)

    res.json({ payload: 'Usuario actualizado' })
  } catch (error) {
    console.log(error)
    res.json({ error })
  }
})

router.delete('/cart/:id', async (req, res) => {
  try {
    const { id } = req.params

    await Cart.updateOne({ _id: id })

    res.json({ payload: 'Usuario eliminado' })
  } catch (error) {
    console.log(error)
    res.json({ error })
  }
})


//FileSystem
router.get('/chat', (req, res) => {
  res.render('chat.handlebars');
});

router.get('/chat/cargarChat', async (req, res) => {
  try {
    const messages = await chatFile.getItems();
    res.json({ status: 'success', messages });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

//Mongodb
router.post('/chat/in', async (req, res) => {
  try {
    const { user, message } = req.body;

    const newUserInfo = {
      user,
      message
    };

    const newUser = await Messages.create(newUserInfo);

    res.json({ payload: newUser });
  } catch (error) {
    console.error('Error al crear mensaje en MongoDB:', error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router
