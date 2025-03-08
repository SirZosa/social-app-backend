import z, { object } from 'zod'

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
        required_error:'An email adreess is required'
    }).email(),
    password: z.string().min(5)
})

const postSchema = z.object({
    content: z.string({
        required_error: 'A last name is required'
    }).max(400).nonempty(),
    media_url: z.string().max(250).optional()
})

const commentSchema = z.object({
    post_id: z.string({
        required_error: 'A post is required'
    }),
    content: z.string({
        required_error: 'Content is required'
    }).max(300),
})
    

export function validateUser(object:object){
    return userSchema.safeParse(object)
}

export function validatePartialUser(object:object){
    return userSchema.partial().safeParse(object)
}

export function validatePost(object:object){
    return postSchema.safeParse(object)
}

export function validateComment(object:object){
    return commentSchema.safeParse(object)
}