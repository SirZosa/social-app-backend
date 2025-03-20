import { Router } from "express";
import { UserController } from "../controller/userController.js";
import { authenticate } from "../middlewares/token_validation.js";
import { partialAuthenticate } from "../middlewares/partial_token_validation.js";
import type { UserModel } from "../controller/interfaces.js";

export const createRouter = ({ UserModel }: { UserModel: UserModel }) => {
    const apiRouter = Router();
    const userController = new UserController({ UserModel });
    
    apiRouter.post("/login", userController.logIn);
    apiRouter.post("/logout", authenticate, userController.logOut);
    apiRouter.post("/signup", userController.signUp);
    apiRouter.get("/profile/:user_id", userController.getProfile);
    apiRouter.get("/posts", partialAuthenticate,userController.getPosts);
    apiRouter.post("/posts", authenticate, userController.uploadPost);
    apiRouter.delete("/posts", authenticate, userController.deletePost);
    apiRouter.get("/post/:post_id", partialAuthenticate, userController.getPostById);
    apiRouter.get("/posts/following", authenticate, userController.getFolloweePosts);
    apiRouter.get("/posts/saved", authenticate, userController.getSavedPosts);
    apiRouter.post("/like", authenticate, userController.postLike);
    apiRouter.delete("/like", authenticate, userController.removeLike);
    apiRouter.post("/comment", authenticate, userController.postComment);
    apiRouter.delete("/comment", authenticate, userController.deleteComment);
    apiRouter.get("/comment/:post_id", userController.getComments);
    apiRouter.post("/follow", authenticate, userController.follow);
    apiRouter.delete("/follow", authenticate, userController.unfollow);
    apiRouter.post("/savepost", authenticate, userController.savePost);
    apiRouter.delete("/savepost", authenticate, userController.unsavePost);
    apiRouter.get("/following/:user_id", userController.getFollowing);
    apiRouter.get("/followers/:user_id", userController.getFollowers);
    apiRouter.get("/user", authenticate, userController.getUserInfo);
    return apiRouter;
};