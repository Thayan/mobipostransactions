/** source/routes/posts.ts */
import express from 'express';
import controller from '../controllers/posts';
const router = express.Router();

router.get('/transactions', controller.getTransactions);

export = router;
