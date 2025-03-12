import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { ConnectionOptions } from 'mysql2/promise'
import { logInInput, signUpInput, getProfileInput, uploadPostInput, postLikeInput, getFolloweesPostsInput, postCommmentInput, getCommentsInput, deletePostInput, followInput, savePostInput, getSavedPostsInput } from './interfaces'

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
        try{
            const [user] = await connection.query<mysql.RowDataPacket[]>(
                `SELECT user_id, BIN_TO_UUID(user_id) as user_hex_id, first_name, last_name, username, email, password_hash, profile_pic_url, profile_background_url, date_created FROM users WHERE email = ?`,
                [email]
            )
            if(user.length === 0){
                return {error: 'User not found'}
            }
            const validatePassword = await bcrypt.compare(password, user[0].password_hash)
            if(validatePassword == false){
                return validatePassword
            }
            const user_info = {
                user_id: user[0].user_hex_id, 
                first_name: user[0].first_name, 
                last_name: user[0].last_name,
                username: user[0].username,
                email: user[0].email,
                profile_pic: user[0].profile_pic_url,
                profile_background_pic: user[0].profile_background_url,
                date_created: user[0].date_created
            }
            const auth_token = jwt.sign({id:user[0].user_id, email:user[0].email}, JWT_SECRET, {expiresIn:'12h'})
            return {user_info, auth_token}
        }
        catch(error){
            return {error: 'Error logging in'}
        }
    }

    static async signUp({input}:signUpInput){
        const {name, lastname, username, email, password} = input
        try{
            const [emailExists] = await connection.query<mysql.RowDataPacket[]>(
                'SELECT * FROM users WHERE email = ?',
                [email]
            )
            if(emailExists.length > 0){
                return {error: 'Email already in use'}
            }
            const [userExists] = await connection.query<mysql.RowDataPacket[]>(
                'SELECT * FROM users WHERE username = ?',
                [username]
            )
            if(userExists.length > 0){
                return {error: 'Username already in use'}
            }
        }
        catch(error){
            return {error: 'Error checking for user'}
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
            `SELECT 
                BIN_TO_UUID(users.user_id) user_id, 
                users.first_name, 
                users.last_name, 
                users.username, 
                users.profile_pic_url, 
                users.profile_background_url, 
                users.date_created,
                (SELECT COUNT(*) FROM followers WHERE followers.followee_id = users.user_id) AS followerCount,
                (SELECT COUNT(*) FROM followers WHERE followers.follower_id = users.user_id) AS followingCount
                FROM users 
                WHERE BIN_TO_UUID(users.user_id) = ?`,
            [input]
        )
        if(user[0]) return JSON.parse(JSON.stringify(user[0]))
        return {error: 'User not found'}
    }

    static async uploadPost({input}:uploadPostInput){
        const {user_id, content, media_url} = input
        const hexString = Buffer.from(user_id.data).toString('hex');
        const post_id = crypto.randomUUID()
        try{
            await connection.query(
                'INSERT INTO posts (post_id, user_id, content, media_url) VALUES (UUID_TO_BIN(?),UNHEX(?), ?, ?)',
                [post_id, hexString, content, media_url]
            )
            return {post_id}
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

    static async getPostById(input: { post_id: string, user_id: { "type": "Buffer", "data": Array<number> } | undefined }) {
        const { post_id, user_id } = input;
        if(user_id){
            const hexString = Buffer.from(user_id.data).toString('hex');
            try{
                const [post] = await connection.query<mysql.RowDataPacket[]>(
                    `SELECT 
                        BIN_TO_UUID(posts.post_id) AS post_id, 
                        BIN_TO_UUID(posts.user_id) AS user_id, 
                        posts.content, 
                        posts.media_url, 
                        posts.date_created,
                        users.username,
                        users.profile_pic_url,
                        COUNT(DISTINCT likes.like_id) AS like_count,
                        COUNT(DISTINCT comments.comment_id) AS comment_count,
                        EXISTS (
                            SELECT 1 
                            FROM likes 
                            WHERE likes.post_id = posts.post_id 
                            AND likes.user_id = UUID_TO_BIN(?)
                        ) AS is_liked,
                        EXISTS (
                            SELECT 1 
                            FROM saved_posts 
                            WHERE saved_posts.post_id = posts.post_id 
                            AND saved_posts.user_id = UUID_TO_BIN(?)
                        ) AS is_saved,
                        EXISTS (
                            SELECT 1 
                            FROM followers 
                            WHERE followers.follower_id = UUID_TO_BIN(?) 
                            AND followers.followee_id = posts.user_id
                        ) AS is_following
                    FROM posts
                    JOIN users ON posts.user_id = users.user_id
                    LEFT JOIN likes ON posts.post_id = likes.post_id
                    LEFT JOIN comments ON posts.post_id = comments.post_id
                    WHERE BIN_TO_UUID(posts.post_id) = ?
                    GROUP BY posts.post_id`,
                    [hexString, hexString, hexString, post_id]
                )
                if(post[0]) return JSON.parse(JSON.stringify(post[0]))
                return {error: 'Post not found'}
            }
            catch(error){
                console.error(error)
                return {error: 'Error getting post'}
            }
        }
        else{
            try {
                const [posts] = await connection.query<mysql.RowDataPacket[]>(
                    `SELECT 
                        BIN_TO_UUID(posts.post_id) AS post_id, 
                        BIN_TO_UUID(posts.user_id) AS user_id, 
                        posts.content, 
                        posts.media_url, 
                        posts.date_created,
                        users.username,
                        users.profile_pic_url,
                        COUNT(DISTINCT likes.like_id) AS like_count,
                        COUNT(DISTINCT comments.comment_id) AS comment_count
                    FROM posts 
                    JOIN users ON posts.user_id = users.user_id
                    LEFT JOIN likes ON posts.post_id = likes.post_id
                    LEFT JOIN comments ON posts.post_id = comments.post_id
                    WHERE BIN_TO_UUID(posts.post_id) = ?
                    GROUP BY posts.post_id`,
                    [post_id]
                );
                if (posts.length > 0) {
                    return JSON.parse(JSON.stringify(posts));
                }
                return [];
            } catch (error) {
                return { error: 'Error fetching posts' };
            }
        }
    }

    static async getPosts(input: { pageNum: number, user_id: { "type": "Buffer", "data": Array<number> } | undefined }) {
        const { pageNum, user_id } = input;
        const offset = (pageNum - 1) * 10;
    
        if (user_id) {
            const hexString = Buffer.from(user_id.data).toString('hex');
            try {
                const [posts] = await connection.query<mysql.RowDataPacket[]>(
                    `SELECT 
                        BIN_TO_UUID(posts.post_id) AS post_id, 
                        BIN_TO_UUID(posts.user_id) AS user_id, 
                        posts.content, 
                        posts.media_url, 
                        posts.date_created,
                        users.username,
                        users.profile_pic_url,
                        COUNT(DISTINCT likes.like_id) AS like_count,
                        COUNT(DISTINCT comments.comment_id) AS comment_count,
                        EXISTS (
                            SELECT 1 
                            FROM likes 
                            WHERE likes.post_id = posts.post_id 
                            AND likes.user_id = UUID_TO_BIN(?)
                        ) AS is_liked,
                        EXISTS (
                            SELECT 1 
                            FROM saved_posts 
                            WHERE saved_posts.post_id = posts.post_id 
                            AND saved_posts.user_id = UUID_TO_BIN(?)
                        ) AS is_saved,
                        EXISTS (
                            SELECT 1 
                            FROM followers 
                            WHERE followers.follower_id = UUID_TO_BIN(?) 
                            AND followers.followee_id = posts.user_id
                        ) AS is_following
                    FROM posts
                    JOIN users ON posts.user_id = users.user_id
                    LEFT JOIN likes ON posts.post_id = likes.post_id
                    LEFT JOIN comments ON posts.post_id = comments.post_id
                    GROUP BY posts.post_id
                    ORDER BY posts.date_created DESC
                    LIMIT ? OFFSET ?`,
                    [hexString, hexString, hexString, 10, offset]
                );
    
                if (posts.length > 0) {
                    return { posts: JSON.parse(JSON.stringify(posts)), hasMore: true }; // Indicate that more posts are available
                }
                return { posts: [], hasMore: false }; // No more posts available
            } catch (error) {
                return { error: 'Error fetching posts' };
            }
        } else {
            try {
                const [posts] = await connection.query<mysql.RowDataPacket[]>(
                    `SELECT 
                        BIN_TO_UUID(posts.post_id) AS post_id, 
                        BIN_TO_UUID(posts.user_id) AS user_id, 
                        posts.content, 
                        posts.media_url, 
                        posts.date_created,
                        users.username,
                        users.profile_pic_url,
                        COUNT(DISTINCT likes.like_id) AS like_count,
                        COUNT(DISTINCT comments.comment_id) AS comment_count
                    FROM posts
                    JOIN users ON posts.user_id = users.user_id
                    LEFT JOIN likes ON posts.post_id = likes.post_id
                    LEFT JOIN comments ON posts.post_id = comments.post_id
                    GROUP BY posts.post_id
                    ORDER BY posts.date_created DESC
                    LIMIT ? OFFSET ?`,
                    [10, offset]
                );
    
                if (posts.length > 0) {
                    return { posts: JSON.parse(JSON.stringify(posts)), hasMore: true }; // Indicate that more posts are available
                }
                return { posts: [], hasMore: false }; // No more posts available
            } catch (error) {
                return { error: 'Error fetching posts' };
            }
        }
    }

    static async getFolloweePosts({input}:getFolloweesPostsInput){
        const {user_id, page} = input
        const offset = (page-1) * 10
        const hexString = Buffer.from(user_id.data).toString('hex');
        try{
            const [posts] = await connection.query<mysql.RowDataPacket[]>(
                `SELECT BIN_TO_UUID(posts.post_id) post_id, BIN_TO_UUID(posts.user_id) user_id, posts.content, posts.media_url, posts.date_created, users.username, users.profile_pic_url
                 FROM posts
                 JOIN followers ON posts.user_id = followers.followee_id
                 JOIN users ON posts.user_id = users.user_id
                 WHERE followers.follower_id = UNHEX(?)
                 ORDER BY posts.date_created DESC
                 LIMIT ? OFFSET ?`,
                [hexString, 10, offset]
            )
            if(posts) return JSON.parse(JSON.stringify(posts))
            return {error: 'No posts found'}
        }
        catch(error){
            console.error(error)
            return {error: 'Error fetching posts'}
        }
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

    static async getFollowing({input}:{input:string}){
        const [following] = await connection.query<mysql.RowDataPacket[]>(
            `SELECT BIN_TO_UUID(followee_id) followee_id, users.username, users.profile_pic_url
             FROM followers
             JOIN users ON followers.followee_id = users.user_id
             WHERE followers.follower_id = UUID_TO_BIN(?)`,
            [input]
        )
        if(following) return JSON.parse(JSON.stringify(following))
        return {error: 'No following found'}
    }

    static async getFollowers({input}:{input:string}){
        const [followers] = await connection.query<mysql.RowDataPacket[]>(
            `SELECT BIN_TO_UUID(follower_id) follower_id, users.username, users.profile_pic_url
             FROM followers
             JOIN users ON followers.follower_id = users.user_id
             WHERE followers.followee_id = UUID_TO_BIN(?)`,
            [input]
        )
        if(followers) return JSON.parse(JSON.stringify(followers))
        return {error: 'No followers found'}
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
            return {error: 'Error creating comment'}
        }
    }

    static async deleteComment({input}:{input:{comment_id:string}}){
        const {comment_id} = input
        try{
            await connection.query(
                'DELETE FROM comments WHERE BIN_TO_UUID(comment_id) = ?',
                [comment_id]
            )
            return {message:'Comment deleted'}
        }
        catch(error){
            return {error: 'Error deleting comment'}
        }
    }

    static async getComments({input}:getCommentsInput){
        const {post_id, page} = input
        const offset = (page-1) * 10
        const comments = await connection.query<mysql.RowDataPacket[]>(
            `SELECT BIN_TO_UUID(comments.comment_id) comment_id, BIN_TO_UUID(comments.user_id) user_id, BIN_TO_UUID(comments.post_id) post_id, comments.content, users.username, users.profile_pic_url, comments.date_created
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

    static async savePost({input}:savePostInput){
        const {post_id, user_id} = input
        const hexString = Buffer.from(user_id.data).toString('hex');
        try{
            await connection.query(
                'INSERT INTO saved_posts (post_id, user_id) VALUES (UUID_TO_BIN(?), UNHEX(?))',
                [post_id, hexString]
            )
            return {message:'Post saved'}
        }
        catch(error){
            console.error(error)
            return {error: 'Error saving post'}
        }
    }

    static async unsavePost({input}:savePostInput){
        const {post_id, user_id} = input
        const hexString = Buffer.from(user_id.data).toString('hex');
        try{
            await connection.query(
                'DELETE FROM saved_posts WHERE post_id = UUID_TO_BIN(?) AND user_id = UNHEX(?)',
                [post_id, hexString]
            )
            return {message:'Post unsaved'}
        }
        catch(error){
            console.error(error)
            return {error: 'Error unsaving post'}
        }
    }

    static async getSavedPosts({input}:getSavedPostsInput){
        const {user_id, page} = input
        const offset = (page-1) * 10
        const hexString = Buffer.from(user_id.data).toString('hex');
        try{
            const [posts] = await connection.query<mysql.RowDataPacket[]>(
                `SELECT BIN_TO_UUID(saved_posts.post_id) post_id, BIN_TO_UUID(posts.user_id) user_id, posts.content, posts.media_url, posts.date_created, users.username, users.profile_pic_url
                 FROM saved_posts
                 JOIN posts ON saved_posts.post_id = posts.post_id
                 JOIN users ON posts.user_id = users.user_id
                 WHERE saved_posts.user_id = UNHEX(?)
                 ORDER BY posts.date_created DESC
                 LIMIT ? OFFSET ?`,
                 [hexString, 10, offset]
            )
            if(posts) return JSON.parse(JSON.stringify(posts))
            return {error: 'No saved posts found'}
        }
        catch(error){
            console.error(error)
            return {error: 'Error fetching saved posts'}
        }
    }

    static async getUserInfo({input}:{input: {type:"Buffer",data:Array<number>}}){
        const hexString = Buffer.from(input.data).toString('hex');
        try{
            const [user] = await connection.query<mysql.RowDataPacket[]>(
                `SELECT BIN_TO_UUID(user_id) as user_hex_id, first_name, last_name, username, email, profile_pic_url, profile_background_url, date_created FROM users WHERE user_id = UNHEX(?)`,
                [hexString]
            )
            if(user.length === 0){
                return {error: 'User not found'}
            }
            return user[0]
        }
        catch(error){
            return {error: 'Error fetching user info'}
        }
    }
}