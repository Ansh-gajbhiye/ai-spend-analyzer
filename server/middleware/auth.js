import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {

  const token = req.header("Authorization");

  
  if (!token) {
    return res.status(401).json({ error: "Access Denied. No token provided." });
  }

  try {
    
    const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    
  
    req.user = verified;
    
    next(); 
  } catch (error) {
    console.log("JWT Error Reason:", error.message);
    res.status(400).json({ error: "Invalid token." });
  }
};

export default authMiddleware;