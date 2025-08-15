exports.deductWalletAmount = async (userId, amount, User) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (user.wallet < amount) {
    throw new Error("Insufficient balance");
  }

  user.wallet -= amount;
  await user.save();
  return user.wallet;
};
