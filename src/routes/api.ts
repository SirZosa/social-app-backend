import { Router } from "express";
import { UserController } from "../controller/userController.js";
import { authenticate } from "../middlewares/token_validation.js";
import type { UserModel } from "../controller/interfaces.js";

export const createRouter = ({ UserModel }: { UserModel: UserModel }) => {
    const apiRouter = Router();
    const userController = new UserController({ UserModel });

    apiRouter.post("/login", userController.logIn);
    apiRouter.post("/signup", userController.signUp);
    apiRouter.get("/profile/:user_id", userController.getProfile);
    apiRouter.get("/posts", userController.getPosts);
    apiRouter.get("/followeePosts", authenticate, userController.getFolloweePosts);
    apiRouter.post("/uploadpost", authenticate, userController.uploadPost);
    apiRouter.post("/like", authenticate, userController.postLike);
    apiRouter.delete("/like", authenticate, userController.removeLike);
    apiRouter.post("/comment", authenticate, userController.postComment);
    apiRouter.delete("/comment", authenticate, userController.deleteComment);
    apiRouter.get("/comments", userController.getComments);

    return apiRouter;
};