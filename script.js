require('dotenv').config()
const { Sequelize } = require('sequelize');
const { 
  findFifoUsers, 
  countFifoUsers, 
  insertUserInAuth, 
  insertUserClientInAuth
} = require('./queries');
const { getClients } = require('./constants');

const fifoDB = new Sequelize(process.env.FIFO_DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres'
});

const authDB = new Sequelize(process.env.AUTH_SERVER_DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres'
});

const migrateData = async () => {
  try {
    const response = await fifoDB.query(countFifoUsers);
    let count = response[0][0].count;

    for (let i = 0; i < count; i=i+100) {
      const [users, metadata] = await fifoDB.query(findFifoUsers(100, i));

      await Promise.all(
        users.map(async (user) => {
          const userSlicedName = user.name.split(' ');
          if (!userSlicedName[1]) {
            userSlicedName[1] = userSlicedName[0];
          }

          user.unconfirmedEmail = null;

          if (!user.is_email_verified) {
            user.unconfirmedEmail = user.email;
            user.email = null;
          };

          let createdUser = await authDB.query(insertUserInAuth, 
          {
            bind: {
              phone: user.phone_number,
              first: userSlicedName[0],
              last: userSlicedName[1],
              password: user.hashed_password,
              username: user.username,
              email: user.email,
              unconfirmedEmail: user.unconfirmedEmail,
              bio: user.description,
              profileImage: user.profile_image_url,
              coverImage: user.cover_image_url,
              userTimeZone: user.user_time_zone,
            }
          })

          await authDB.query(insertUserClientInAuth,
            {
              bind: {
                client: getClients(process.env.NODE_ENV),
                user: createdUser[0][0].id
              }
            })
        })
      )
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

migrateData();