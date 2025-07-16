// Middleware to make Socket.io instance and connected users available to routes

export const socketMiddleware = (io, connectedUsers) => {
  return (req, res, next) => {
    req.io = io;
    req.connectedUsers = connectedUsers;
    next();
  };
};