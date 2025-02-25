export interface logInInput{
    input:{
        "password":string,
        "email":string
    }
}

export interface signUpInput{
    input:{
        "name":string,
        "lastname":string,
        "username":string,
        "email":string,
        "password":string
    }
}

export interface getProfileInput{
    input:{
        "user_id":string
    }
}

export interface uploadPostInput{
    input:{
        "post_id":string,
        "user_id":string,
        "content":string,
        "media_url":string
    }
}

export interface postLikeInput{
    input:{
        "post_id":string,
        "user_id":string
    }
}

export interface getFollowersPostsInput{
    input:{
        "user_id":string
        "page":number
    }
}

export interface postCommmentInput{
    input:{
        "post_id":string,
        "user_id":string,
        "content":string
    }
}

export interface getCommentsInput{
    input:{
        "post_id":string
        "page":number
    }
}