import { UserModel } from "./interfaces.js"
import { validatePartialUser, validateUser, validateComment, validatePost } from "../validations/userValidation.js"
import { Request, Response } from "express"

export class UserController{
    private UserModel:UserModel
    constructor({UserModel:UserModel}:{UserModel:UserModel}){
        this.UserModel = UserModel
    }

    logIn = async(req:Request, res:Response)=>{
        const result = validatePartialUser(req.body)
        if(result.error){
            res.status(400).json(JSON.parse(result.error.message))
            return
        }
        const isLogged = await this.UserModel.logIn({input:result.data})
        if(!isLogged){
            res.status(401).json({message:'Incorrect user and/or password.'})
            return
        }
        res.status(200).json(isLogged)
    }

    signUp = async(req:Request, res:Response)=>{
        const result = validateUser(req.body)
        if(result.error){
            res.status(400).json(JSON.parse(result.error.message))
            return
        }
        const userCreated = await this.UserModel.signUp({input:result.data})
        if(userCreated.error){
            res.status(409).json({message:'User already exists'})
            return
        }
        res.status(201).json(userCreated)
    }

    getProfile = async(req:Request, res:Response)=>{
        const user_id = req.params.user_id
        if(!user_id){
            res.status(400).json({message:'User id is required'})
            return
        }
        const userData = await this.UserModel.getProfile({input:user_id})
        if(userData.error){
            res.status(404).json({message:'User not found'})
            return
        }
        res.status(200).json(userData)
    }

    uploadPost = async(req:Request, res:Response)=>{
        const result = validatePost(req.body)
        const user_id = req.body.user.id
        if(!user_id){
            res.status(400).json({message:'User id is required'})
            return
        }
        if(result.error){
            res.status(400).json(JSON.parse(result.error.message))
            return
        }
        const data = {...result.data, user_id}
        const post = await this.UserModel.uploadPost({input:data})
        if(post.error){
            res.status(409).json({message:'Error creating post'})
            return
        }
        res.status(201).json({message:'Post created'})
    }

    deletePost = async(req:Request, res:Response)=>{
        const {post_id} = req.body
        const user_id = req.body.user.id
        if(!post_id){
            res.status(400).json({message:'Post id is required'})
            return
        }
        if(!user_id){
            res.status(400).json({message:'User id is required'})
            return
        }
        const post = await this.UserModel.deletePost({input:{post_id, user_id}})
        if(post.error){
            res.status(409).json({message:'Error deleting post'})
            return
        }
        res.status(200).json({message:'Post deleted'})
    }


    postLike = async(req:Request, res:Response)=>{
        const {post_id} = req.body
        const user_id = req.body.user.id
        if(!post_id){
            res.status(400).json({message:'Post id is required'})
            return
        }
        if(!user_id){
            res.status(400).json({message:'User id is required'})
            return
        }
        const like = await this.UserModel.postLike({input:{post_id, user_id}})
        if(like.error){
            res.status(409).json({message:'Error liking post'})
            return
        }
        res.status(201).json({message:'Post liked'})
    }

    removeLike = async(req:Request, res:Response)=>{
        const {post_id} = req.body
        const user_id = req.body.user.id
        if(!post_id){
            res.status(400).json({message:'Post id is required'})
            return
        }
        if(!user_id){
            res.status(400).json({message:'User id is required'})
            return
        }
        const like = await this.UserModel.removeLike({input:{post_id, user_id}})
        if(like.error){
            res.status(409).json({message:'Error removing like'})
            return
        }
        res.status(200).json({message:'Like removed'})
    }

    getPosts = async(req:Request, res:Response)=>{
        if(!req.body.page){
            res.status(400).json({message:'Page is required'})
            return
        }
        const posts = await this.UserModel.getPosts({input:req.body.page})
        if(posts.error){
            res.status(404).json({message:'Posts not found'})
            return
        }
        res.status(200).json(posts)
    }

    follow = async(req:Request, res:Response)=>{
        const {followee_id} = req.body
        const user_id = req.body.user.id
        if(!followee_id){
            res.status(400).json({message:'Followee id is required'})
            return
        }
        if(!user_id){
            res.status(400).json({message:'User id is required'})
            return
        }
        const follow = await this.UserModel.follow({input:{followee_id, user_id}})
        if(follow.error){
            res.status(409).json({message:'Error following user'})
            return
        }
        res.status(201).json({message:'User followed'})
    }

    unfollow = async(req:Request, res:Response)=>{
        const {followee_id} = req.body
        const user_id = req.body.user.id
        if(!followee_id){
            res.status(400).json({message:'Followee id is required'})
            return
        }
        if(!user_id){
            res.status(400).json({message:'User id is required'})
            return
        }
        const unfollow = await this.UserModel.unfollow({input:{followee_id, user_id}})
        if(unfollow.error){
            res.status(409).json({message:'Error following user'})
            return
        }
        res.status(201).json({message:'User unfollowed'})
    }

    getFolloweePosts = async(req:Request, res:Response)=>{
        const {user_id, page} = req.body
        const posts = await this.UserModel.getFolloweePosts({input:{user_id, page}})
        if(posts.error){
            res.status(404).json({message:'Posts not found'})
            return
        }
        res.status(200).json(posts)
    }

    postComment = async(req:Request, res:Response)=>{
        const result = validateComment(req.body)
        const user_id = req.body.user.id
        if(!user_id){
            res.status(400).json({message:'User id is required'})
            return
        }
        if(result.error){
            res.status(400).json(JSON.parse(result.error.message))
            return
        }
        const data = {...result.data, user_id}
        const comment = await this.UserModel.postComment({input:data})
        if(comment.error){
            res.status(409).json({message:'Error creating comment'})
            return
        }
        res.status(201).json({message:'Comment created'})
    }

    deleteComment = async(req:Request, res:Response)=>{
        const {comment_id} = req.body
        const user_id = req.body.user.id
        if(!comment_id){
            res.status(400).json({message:'Comment id is required'})
            return
        }
        if(!user_id){
            res.status(400).json({message:'User id is required'})
            return
        }
        const comment = await this.UserModel.deleteComment({input:{comment_id}})
        if(comment.error){
            res.status(409).json({message:'Error deleting comment'})
            return
        }
        res.status(200).json({message:'Comment deleted'})
    }

    getComments = async(req:Request, res:Response)=>{
        const {post_id, page} = req.body
        if(!post_id){
            res.status(400).json({message:'Post id is required'})
            return
        }
        if(!page){
            res.status(400).json({message:'Page is required'})
            return
        }
        const comments = await this.UserModel.getComments({input:{post_id, page}})
        if(comments.error){
            res.status(404).json({message:'Comments not found'})
            return
        }
        res.status(200).json(comments)
    }

}