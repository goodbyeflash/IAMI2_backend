const checkLoggedIn = (ctx, next) => {
  if (!ctx.state.teacher) {
    ctx.status = 401; // Unauthorized
    return;
  }
  return next();
};

export default checkLoggedIn;
