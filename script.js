require('dotenv').config()
const { Sequelize } = require('sequelize');
const { 
  findFifoUsers, 
  countFifoUsers, 
  insertUserInAuth, 
  insertUserClientInAuth,
  insertGatewayIdInFifo,
  findOneByPhoneInAuth,
  updateUserByPhoneInAuth
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

    console.log(`Total Users -> ${count}`);

    for (let i = 0; i < count; i=i+100) {
      const [users, metadata] = await fifoDB.query(findFifoUsers(100, i));

      await Promise.all(
        users.map(async (user) => {
          const [foundUser, foundMetadata] = await authDB.query(findOneByPhoneInAuth, {
            bind: {
              phone: user.phone_number
            }
          })

          if (foundUser.length > 0) {
            let bio = foundUser[0].bio;
            let profileImage = foundUser[0].profile_image;
            let coverImage = foundUser[0].cover_image;
            let unconfirmedEmail = foundUser[0].email;
            if (!foundUser[0].bio) {
              bio = user.description;
            }

            if (!foundUser[0].profile_image) {
              profileImage = user.profile_image_url;
            }

            if (!foundUser[0].cover_image) {
              coverImage = user.cover_image_url;
            }

            if (!foundUser[0].email) {
              unconfirmedEmail = user.email
            }

            let createdUser = await authDB.query(updateUserByPhoneInAuth,
              {
                bind: {
                  phone: foundUser[0].phone,
                  bio,
                  profileImage,
                  coverImage,
                  unconfirmedEmail,
                }
              })

            await authDB.query(insertUserClientInAuth,
            {
              bind: {
                client: getClients(process.env.NODE_ENV),
                user: createdUser[0][0].id
              }
            })

            await fifoDB.query(insertGatewayIdInFifo, 
              {
                bind: {
                  gatewayId: createdUser[0][0].id,
                  phoneNumber: createdUser[0][0].phone
                }
              })
            
          } else {
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

          await fifoDB.query(insertGatewayIdInFifo, 
            {
              bind: {
                gatewayId: createdUser[0][0].id,
                phoneNumber: createdUser[0][0].phone
              }
            })
          }
        })
      )
    }

    console.log(`Migration completed for ${count} users.`)
  } catch (error) {
    console.error(error);
    throw error;
  }
}

migrateData();