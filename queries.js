const countFifoUsers = `select count(*) from users where podcast_id is null and user_type is null and id not like 'BOT%';`;

const findFifoUsers = (limit = 100, offset = 0) => {
  return `select * from users where podcast_id is null and user_type is null and id not like 'BOT%' and is_number_verified=true and username is not null and deleted_at is null limit ${limit} offset ${offset};`
};

const insertUserInAuth = `insert into public.user (phone, first_name, last_name, password, username, email, bio, profile_image, cover_image, user_time_zone, unconfirmed_email) values ($phone, $first, $last, $password, $username, $email, $bio, $profileImage, $coverImage, $userTimeZone, $unconfirmedEmail) returning id`

const insertUserClientInAuth = `insert into public.user_clients (client_id, user_id) values ($client, $user)`
module.exports = { 
  countFifoUsers,
  findFifoUsers ,
  insertUserInAuth,
  insertUserClientInAuth
};