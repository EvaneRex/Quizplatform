export function requireLogin(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Ikke logget ind" });
  }
  next();
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Ikke logget ind" });
    }
    if (req.session.user.role !== role) {
      return res.status(403).json({ message: "Adgang nægtet" });
    }
    next();
  };
}
