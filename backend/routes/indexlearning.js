const learning = require("../controllers/learningController");

// Learning tab
router.get("/learning", learning.getLearning);