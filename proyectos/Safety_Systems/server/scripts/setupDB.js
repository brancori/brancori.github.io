use safety_systems

db.createUser({
  user: "safety_admin",
  pwd: "tu_contraseña_segura",
  roles: ["readWrite", "dbAdmin"]
})
