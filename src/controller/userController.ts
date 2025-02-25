import { UserModel } from "./interfaces"
import { validatePartialUser, validateUser, validateComment, validatePost } from "../validations/userValidation"
import { Request, Response } from "express"

export class UserController{
    private UserModel:UserModel
    constructor({UserModel:UserModel}:{UserModel:UserModel}){
        this.UserModel = UserModel
    }

    logIn = async(req:Request, res:Response)=>{
        const result = validatePartialUser(req.body)
        if(result.error){
            return res.status(400).json(JSON.parse(result.error.message))
        }
        const isLogged = await this.UserModel.logIn({input:result.data})
        if(!isLogged){
            return res.status(401).json({message:'Incorrect user and/or password.'})
        }
        return res.status(200).json(isLogged)
    }

    signUp = async(req:Request, res:Response)=>{
        const result = validateUser(req.body)
        if(result.error){
            return res.status(400).json(JSON.parse(result.error.message))
        }
        const userCreated = await this.UserModel.signUp({input:result.data})
        if(userCreated.error){
            return res.status(409).json({message:'User already exists'})
        }
        return res.status(201).json(userCreated)
    }

    getProfile = async(req:Request, res:Response)=>{
        const userData = await this.UserModel.getProfile({input:req.body.user})
        if(userData.error){
            return res.status(404).json({message:'User not found'})
        }
        return res.status(200).json(userData)
    }

    uploadPost = async(req:Request, res:Response)=>{
        const result = validatePost(req.body)
        if(result.error){
            return res.status(400).json(JSON.parse(result.error.message))
        }
        const post = await this.UserModel.uploadPost({input:result.data})
        if(post.error){
            return res.status(409).json({message:'Error creating post'})
        }
        return res.status(201).json({message:'Post created'})
    }

    postLike = async(req:Request, res:Response)=>{
        const {post_id, user_id} = req.body
        const like = await this.UserModel.postLike({input:{post_id, user_id}})
        if(like.error){
            return res.status(409).json({message:'Error liking post'})
        }
        return res.status(201).json({message:'Post liked'})
    }

    removeLike = async(req:Request, res:Response)=>{
        const {post_id, user_id} = req.body
        const like = await this.UserModel.removeLike({input:{post_id, user_id}})
        if(like.error){
            return res.status(409).json({message:'Error removing like'})
        }
        return res.status(200).json({message:'Like removed'})
    }

    getPosts = async(req:Request, res:Response)=>{
        const posts = await this.UserModel.getPosts({input:req.body.page})
        if(posts.error){
            return res.status(404).json({message:'Posts not found'})
        }
        return res.status(200).json(posts)
    }

    getFolloweePosts = async(req:Request, res:Response)=>{
        const {user_id, page} = req.body
        const posts = await this.UserModel.getFolloweePosts({input:{user_id, page}})
        if(posts.error){
            return res.status(404).json({message:'Posts not found'})
        }
        return res.status(200).json(posts)
    }

    postComment = async(req:Request, res:Response)=>{
        const result = validateComment(req.body)
        if(result.error){
            return res.status(400).json(JSON.parse(result.error.message))
        }
        const comment = await this.UserModel.postComment({input:result.data})
        if(comment.error){
            return res.status(409).json({message:'Error creating comment'})
        }
        return res.status(201).json({message:'Comment created'})
    }

    deleteComment = async(req:Request, res:Response)=>{
        const {comment_id} = req.body
        const comment = await this.UserModel.deleteComment({input:{comment_id}})
        if(comment.error){
            return res.status(409).json({message:'Error deleting comment'})
        }
        return res.status(200).json({message:'Comment deleted'})
    }

    getComments = async(req:Request, res:Response)=>{
        const {post_id, page} = req.body
        const comments = await this.UserModel.getComments({input:{post_id, page}})
        if(comments.error){
            return res.status(404).json({message:'Comments not found'})
        }
        return res.status(200).json(comments)
    }

}