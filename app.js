require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.json({
    Devdoot:"Welcome"
  });
});
app.use('/users', userRoutes);

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: false });
    console.log('✅ Database connected and synced');
    
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log('Unable to connect to the database:', err);
  }
})();
