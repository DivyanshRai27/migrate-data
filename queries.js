const countFifoUsers = `select count(*) from users where podcast_id is null and user_type is null and id not like 'BOT%';`;

const findFifoUsers = (limit = 100, offset = 0) => {
  return `select * from users where podcast_id is null and user_type is null and id not like 'BOT%' and is_number_verified=true and username is not null and deleted_at is null order by created_at asc limit ${limit} offset ${offset};`
};

const insertUserInAuth = `insert into public.user (phone, first_name, last_name, password, username, email, bio, profile_image, cover_image, user_time_zone, unconfirmed_email) values ($phone, $first, $last, $password, $username, $email, $bio, $profileImage, $coverImage, $userTimeZone, $unconfirmedEmail) returning id, phone`

const insertGatewayIdInFifo = `update users set gateway_id = $gatewayId where phone_number=$phoneNumber`;

const insertUserClientInAuth = `insert into public.user_clients (client_id, user_id) values ($client, $user)`;

const findOneByPhoneInAuth = `select * from public.user where phone=$phone`;

const updateUserByPhoneInAuth = `update public.user set bio = $bio, profile_image = $profileImage, cover_image = $coverImage, unconfirmed_email = $unconfirmedEmail where phone = $phone returning id, phone`;
module.exports = { 
  countFifoUsers,
  findFifoUsers ,
  insertUserInAuth,
  insertUserClientInAuth,
  insertGatewayIdInFifo,
  findOneByPhoneInAuth,
  updateUserByPhoneInAuth,
};