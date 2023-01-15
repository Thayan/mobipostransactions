"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/** source/routes/posts.ts */
const express_1 = __importDefault(require("express"));
const posts_1 = __importDefault(require("../controllers/posts"));
const router = express_1.default.Router();
router.get('/transactions', posts_1.default.getTransactions);
module.exports = router;
