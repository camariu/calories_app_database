
const User = require("./schemas/schemaUsers.js")

const createUser = async ({ email, password }) => {
  const userExistent = await User.findOne({ email });

  if (userExistent) {
    throw new Error("Email already in use!");
  }

  const newUser = new User({ email, password });
  newUser.setPassword(password);
  return await newUser.save();
};

const loginUser = async ({ email, password, token }) => {
  const user = await User.findOne({ email });

  if (!user || !user.validPassword(password)) {
    throw new Error("Wrong email or password");
  }

  user.setToken(token);
  await user.save();
  return user;
};

const findUser = async (user) => {
  const result = await User.findOne({ email: user.email });
  return result;
};

module.exports = {
  createUser,
  loginUser,
  findUser,
};
