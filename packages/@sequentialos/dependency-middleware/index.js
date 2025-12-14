export function createDependencyMiddleware(container) {
  return (req, res, next) => {
    req.container = container;
    next();
  };
}
export default { createDependencyMiddleware };
