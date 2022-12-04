const checkLoggedInUser = (ctx, next) => {
  if (!ctx.state.user && process.env.NODE_ENV != 'development') {
    ctx.status = 401; // Unauthorized
    return;
  }
  return next();
};

export default checkLoggedInUser;
