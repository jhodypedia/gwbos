const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { sendTransactionEVM, sendTransactionSolana } = require('./blockchain');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Menggunakan folder public untuk file statis
app.set('view engine', 'ejs'); // Mengatur EJS sebagai view engine

// Endpoint untuk merender halaman utama
app.get('/', (req, res) => {
  res.render('index');
});

// Endpoint untuk mengirim transaksi
app.post('/send-transaction', async (req, res) => {
  const { mnemonic, network, toAddress } = req.body;

  if (!mnemonic || !network || !toAddress) {
    return res.status(400).json({ error: 'Mnemonic, network, and recipient address are required.' });
  }

  try {
    let result;

    if (network === 'solana') {
      result = await sendTransactionSolana(mnemonic, toAddress);
    } else {
      result = await sendTransactionEVM(mnemonic, network, toAddress);
    }

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: 'Error sending transaction: ' + error.message });
  }
});

// Mulai server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
