const router = require("express").Router();
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");
const productsCtrl = require("../controller/productCtrl");

router
  .route("/products")
  .get(productsCtrl.getProducts)
  .post(productsCtrl.createProduct);

router
  .route("/products/:id")
  .delete(productsCtrl.deleteProduct)
  .put(productsCtrl.updateProduct);

module.exports = router;
