const router = require("express").Router();
const categoryCtrl = require("../controller/categoryCtrl");
const authAdmin = require("../middleware/authAdmin");
const auth = require("../middleware/auth");
router
  .route("/category")
  .get(categoryCtrl.getCategories)
  .post(categoryCtrl.createCategory);

router
  .route("/category/:id")
  .delete(auth, authAdmin, categoryCtrl.deleteCategory)
  .put(auth, authAdmin, categoryCtrl.updateCategory);

module.exports = router;
