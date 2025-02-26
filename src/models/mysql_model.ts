import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { ConnectionOptions } from 'mysql2/promise'
import { logInInput, signUpInput, getProfileInput, uploadPostInput, postLikeInput, getFollowersPostsInput, postCommmentInput, getCommentsInput, deletePostInput, followInput } from './interfaces'

const config:ConnectionOptions ={
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
}

const JWT_SECRET= process.env.JWT_SECRET ?? "default_secret"
const salt = process.env.SALT ?? 10

const connection = await mysql.createConnection(config)

export class AppModel{
    static async logIn({input}:logInInput){
        const {email, password} = input
        const [user] = await connection.query<mysql.RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        )
        if(user.length === 0){
            return {error: 'User not found'}
        }
        const validatePassword = await bcrypt.compare(password, user[0].password_hash)
        if(!validatePassword){
            return {error: 'Invalid password'}
        }
        const token = jwt.sign({id:user[0].user_id, email:user[0].email}, JWT_SECRET, {expiresIn:'12h'})
        return token
    }

    static async signUp({input}:signUpInput){
        const {name, lastname, username, email, password} = input
        const [userExists] = await connection.query<mysql.RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        )
        if(userExists.length > 0){
            return {error: 'User already exists'}
        }

        const hashedPassword = await bcrypt.hash(password, salt)
        try{
            await connection.query(
                'INSERT INTO users (first_name, last_name, username, email, password_hash) VALUES (?, ?, ?, ?, ?)',
                [name, lastname, username, email, hashedPassword]
            )
            return {message:'User created'}
        }
        catch(error){
            return {error: 'Error creating user'}
        }
    }

    static async getProfile({input}:getProfileInput){
        const [user] = await connection.query<mysql.RowDataPacket[]>(
            'SELECT BIN_TO_UUID(user_id) user_id, first_name, last_name, username, profile_pic_url, profile_background_url, date_created FROM users WHERE BIN_TO_UUID(user_id) = ?',
            [input]
        )
        if(user[0]) return JSON.parse(JSON.stringify(user[0]))
        return {error: 'User not found'}
    }

    static async uploadPost({input}:uploadPostInput){
        const {user_id, content, media_url} = input
        const hexString = Buffer.from(user_id.data).toString('hex');
        try{
            await connection.query(
                'INSERT INTO posts (user_id, content, media_url) VALUES (UNHEX(?), ?, ?)',
                [hexString, content, media_url]
            )
            return {message:'Post created'}
        }
        catch(error){
            return {error: 'Error creating post'}
        }
    }

    static async deletePost({input}:deletePostInput){
        const {post_id, user_id} = input
        const hexString = Buffer.from(user_id.data).toString('hex');
        try{
            await connection.query(
                'DELETE FROM posts WHERE BIN_TO_UUID(post_id) = ? AND user_id = UNHEX(?)',
                [post_id, hexString]
            )
            return {message:'Post deleted'}
        }
        catch(error){
            return {error: 'Error deleting post'}
        }
    }

    static async postLike({input}:postLikeInput){
        const {post_id, user_id} = input
        const hexString = Buffer.from(user_id.data).toString('hex');
        try{
            await connection.query(
                'INSERT INTO likes (post_id, user_id) VALUES (UUID_TO_BIN(?), UNHEX(?))',
                [post_id, hexString]
            )
            return {message:'Post liked'}
        }
        catch(error){
            return {error: 'Error liking post'}
        }
    }

    static async removeLike({input}:postLikeInput){
        const {post_id, user_id} = input
        const hexString = Buffer.from(user_id.data).toString('hex');
        try{
            await connection.query(
                'DELETE FROM likes WHERE BIN_TO_UUID(post_id) = ? AND user_id = UNHEX(?)',
                [post_id, hexString]
            )
            return {message:'Like removed'}
        }
        catch(error){
            console.error(error)
            return {error: 'Error removing like'}
        }
    }

    static async getPosts({input}:{input:number}){
        const offset = (input-1) * 10
        try{
            const posts = await connection.query<mysql.RowDataPacket[]>(
                'SELECT BIN_TO_UUID(post_id) post_id, BIN_TO_UUID(user_id) user_id, content, media_url, date_created FROM posts ORDER BY date_created DESC LIMIT ? OFFSET ?',
                [10, offset]
            )
            if(posts[0]) return JSON.parse(JSON.stringify(posts[0]))
            return {error: 'No posts found'}
        }
        catch(error){
            console.error(error)
            return {error: 'Error fetching posts'}
        }
    }

    static async getFolloweePosts({input}:getFollowersPostsInput){
        const {user_id, page} = input
        const offset = (page-1) * 10
        const [posts] = await connection.query<mysql.RowDataPacket[]>(
            `SELECT posts.*, users.username, users.profile_pic_url
             FROM posts
             JOIN followers ON posts.user_id = followers.followee_id
             JOIN users ON posts.user_id = users.user_id
             WHERE followers.follower_id = UUID_TO_BIN(?)
             ORDER BY posts.date_created DESC
             LIMIT ? OFFSET ?`,
            [user_id, 10, offset]
        )
        if(posts[0]) return JSON.parse(JSON.stringify(posts[0]))
        return {error: 'No posts found'}
    }

    static async follow({input}:followInput){
        const {followee_id, user_id} = input
        const hexString = Buffer.from(user_id.data).toString('hex');
        try{
            await connection.query(
                'INSERT INTO followers (follower_id, followee_id) VALUES (UNHEX(?), UUID_TO_BIN(?))',
                [hexString, followee_id]
            )
            return {message:'User followed'}
        }
        catch(error){
            console.error(error)
            return {error: 'Error following user'}
        }
    }

    static async unfollow({input}:followInput){
        const {followee_id, user_id} = input
        const hexString = Buffer.from(user_id.data).toString('hex');
        try{
            await connection.query(
                'DELETE FROM followers WHERE follower_id = UNHEX(?) AND followee_id = UUID_TO_BIN(?)',
                [hexString, followee_id]
            )
            return {message:'User unfollowed'}
        }
        catch(error){
            console.error(error)
            return {error: 'Error unfollowing user'}
        }
    }

    static async postComment({input}:postCommmentInput){
        const {post_id, user_id, content} = input
        const hexString = Buffer.from(user_id.data).toString('hex');
        try{
            await connection.query(
                'INSERT INTO comments (post_id, user_id, content) VALUES (UUID_TO_BIN(?), UNHEX(?), ?)',
                [post_id, hexString, content]
            )
            return {message:'Comment created'}
        }
        catch(error){
            console.log(error)
            return {error: 'Error creating comment'}
        }
    }

    static async deleteComment({input}:{input:string}){
        try{
            await connection.query(
                'DELETE FROM comments WHERE comment_id = ?',
                [input]
            )
        }
        catch(error){
            return {error: 'Error deleting comment'}
        }
    }

    static async getComments({input}:getCommentsInput){
        const {post_id, page} = input
        const offset = (page-1) * 10
        const comments = await connection.query<mysql.RowDataPacket[]>(
            `SELECT BIN_TO_UUID(comments.comment_id) comment_id, BIN_TO_UUID(comments.user_id) user_id, BIN_TO_UUID(comments.post_id) post_id, comments.content, users.username, users.profile_pic_url
             FROM comments
             JOIN users ON comments.user_id = users.user_id
             WHERE comments.post_id = UUID_TO_BIN(?)
             ORDER BY comments.date_created DESC
             LIMIT ? OFFSET ?`,
            [post_id, 10, offset]
        )
        if(comments[0]) return JSON.parse(JSON.stringify(comments[0]))
        return {error: 'No comments found'}
    }
}