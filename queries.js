const countFifoUsers = `select count(*) from users where podcast_id is null and user_type is null and id not like 'BOT%';`;

const findFifoUsers = (limit = 100, offset = 0) => {
  return `select * from users where podcast_id is null and user_type is null and id not like 'BOT%' limit ${limit} offset ${offset};`
};

const insertUserInAuth = `insert into public.user (phone, first_name, last_name, password, username, email, bio, profile_image, cover_image) values ($phone, $first, $last, $password, $username, $email, $bio, $profileImage, $coverImage) returning id`

const insertUserClientInAuth = `insert into public.user_clients (client_id, user_id) values ($client, $user)`
module.exports = { 
  countFifoUsers,
  findFifoUsers ,
  insertUserInAuth,
  insertUserClientInAuth
};