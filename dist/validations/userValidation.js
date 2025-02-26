import z from 'zod';
const userSchema = z.object({
    name: z.string({
        required_error: 'A name is required'
    }).max(20),
    lastname: z.string({
        required_error: 'A last name is required'
    }).max(20),
    username: z.string({
        required_error: 'A username is required'
    }).max(20),
    email: z.string({
        required_error: 'An email adreess is required'
    }).email(),
    password: z.string().min(5)
});
const postSchema = z.object({
    user_id: z.string({
        required_error: 'A name is required'
    }).max(20),
    post_id: z.string({
        required_error: 'A name is required'
    }).max(20),
    content: z.string({
        required_error: 'A last name is required'
    }).max(500),
    media_url: z.string().max(250).optional()
});
const commentSchema = z.object({
    user_id: z.string({
        required_error: 'A user is required'
    }).max(20),
    post_id: z.string({
        required_error: 'A post is required'
    }).max(20),
    content: z.string({
        required_error: 'Content is required'
    }).max(500),
});
export function validateUser(object) {
    return userSchema.safeParse(object);
}
export function validatePartialUser(object) {
    return userSchema.partial().safeParse(object);
}
export function validatePost(object) {
    return postSchema.safeParse(object);
}
export function validateComment(object) {
    return commentSchema.safeParse(object);
}
//# sourceMappingURL=userValidation.js.map