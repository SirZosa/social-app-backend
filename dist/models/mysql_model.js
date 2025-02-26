import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
const config = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};
const JWT_SECRET = process.env.JWT_SECRET ?? "default_secret";
const salt = process.env.SALT ?? 10;
const connection = await mysql.createConnection(config);
export class AppModel {
    static async logIn({ input }) {
        const { email, password } = input;
        const [user] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            return { error: 'User not found' };
        }
        const validatePassword = await bcrypt.compare(password, user[0].password_hash);
        if (!validatePassword) {
            return { error: 'Invalid password' };
        }
        const token = jwt.sign({ id: user[0].user_id, email: user[0].email }, JWT_SECRET, { expiresIn: '1h' });
        return token;
    }
    static async signUp({ input }) {
        const { name, lastname, username, email, password } = input;
        const [userExists] = await connection.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (userExists.length > 0) {
            return { error: 'User already exists' };
        }
        const hashedPassword = await bcrypt.hash(password, salt);
        try {
            await connection.query('INSERT INTO users (first_name, last_name, username, email, password_hash) VALUES (?, ?, ?, ?, ?)', [name, lastname, username, email, hashedPassword]);
            return { message: 'User created' };
        }
        catch (error) {
            return { error: 'Error creating user' };
        }
    }
    static async getProfile({ input }) {
        const { user_id } = input;
        const [user] = await connection.query('SELECT * FROM users WHERE user_id = ?', [user_id]);
        if (user[0])
            return JSON.parse(JSON.stringify(user[0]));
        return { error: 'User not found' };
    }
    static async uploadPost({ input }) {
        const { user_id, content, media_url } = input;
        try {
            await connection.query('INSERT INTO posts (user_id, content, media_url) VALUES (?, ?, ?)', [user_id, content, media_url]);
        }
        catch (error) {
            return { error: 'Error creating post' };
        }
    }
    static async postLike({ input }) {
        const { post_id, user_id } = input;
        try {
            await connection.query('INSERT INTO likes (post_id, user_id) VALUES ?, ?)', [post_id, user_id]);
        }
        catch (error) {
            return { error: 'Error liking post' };
        }
    }
    static async removeLike({ input }) {
        const { post_id, user_id } = input;
        try {
            await connection.query('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [post_id, user_id]);
        }
        catch (error) {
            return { error: 'Error removing like' };
        }
    }
    static async getPosts({ input }) {
        const offset = (input - 1) * 10;
        const posts = await connection.query('SELECT * FROM posts ORDER BY date_created DESC LIMIT ? OFFSET ?', [10, offset]);
        if (posts[0])
            return JSON.parse(JSON.stringify(posts[0]));
        return { error: 'No posts found' };
    }
    static async getFolloweePosts({ input }) {
        const { user_id, page } = input;
        const offset = (page - 1) * 10;
        const [posts] = await connection.query(`SELECT posts.*, users.username, users.profile_pic_url
             FROM posts
             JOIN followers ON posts.user_id = followers.followee_id
             JOIN users ON posts.user_id = users.user_id
             WHERE followers.follower_id = UUID_TO_BIN(?)
             ORDER BY posts.date_created DESC
             LIMIT ? OFFSET ?`, [user_id, 10, offset]);
        if (posts[0])
            return JSON.parse(JSON.stringify(posts[0]));
        return { error: 'No posts found' };
    }
    static async postComment({ input }) {
        const { post_id, user_id, content } = input;
        try {
            await connection.query('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)', [post_id, user_id, content]);
        }
        catch (error) {
            return { error: 'Error creating comment' };
        }
    }
    static async deleteComment({ input }) {
        try {
            await connection.query('DELETE FROM comments WHERE comment_id = ?', [input]);
        }
        catch (error) {
            return { error: 'Error deleting comment' };
        }
    }
    static async getComments({ input }) {
        const { post_id, page } = input;
        const offset = (page - 1) * 10;
        const comments = await connection.query(`SELECT comments.*, users.username, users.profile_pic_url
             FROM comments
             JOIN users ON comments.user_id = users.user_id
             WHERE comments.post_id = UUID_TO_BIN(?)
             ORDER BY comments.date_created DESC
             LIMIT ? OFFSET ?`, [post_id, 10, offset]);
        if (comments[0])
            return JSON.parse(JSON.stringify(comments[0]));
        return { error: 'No comments found' };
    }
}
//# sourceMappingURL=mysql_model.js.map