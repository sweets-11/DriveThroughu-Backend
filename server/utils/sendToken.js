export const sendToken = (res, user, statusCode, message) => {
  const token = user.getJWTToken();

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    verified: user.verified,
    address: user.address,
  };

  const options = {
    httpOnly: true,
    expires: new Date(Date.now() + 100 * 24 * 60 * 60 * 300),
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, message, user: userData , token: token});
};
