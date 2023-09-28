require('dotenv').config()
const { Sequelize } = require('sequelize');
const { countAuthUsers, findAuthUsers, insertGatewayIdInFifo } = require('./queries');

const authDB = new Sequelize(process.env.AUTH_SERVER_DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: process.env.DB_PORT
});

const fifoDB = new Sequelize(process.env.FIFO_DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: process.env.DB_PORT
});

const migrateData = async () => {
  try {
    const response = await authDB.query(countAuthUsers);
    let count = response[0][0].count;

    console.log(`Total Users -> ${count}`);

    let users = [];

    for (let i = 0; i < count; i=i+100) {
      const [foundUsers, metadata] = await authDB.query(findAuthUsers(100, i));

      users.push(...foundUsers)
    }

    await fifoDB.transaction(async (t) => {
      await Promise.all(
        users.map(async (user) => {
          await fifoDB.query(insertGatewayIdInFifo,
            {
              bind: {
                gatewayId: user.id,
                phoneNumber: user.phone
              }
            }, { transaction: t })
        })
      )
    })

    console.log(`Migrated Users -> ${count}`)
  } catch (error) {
    console.error(error);
    throw error;
  }
}

migrateData();