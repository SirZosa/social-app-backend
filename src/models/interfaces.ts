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
        "profile_id":string,
        "user_id":{"type":"Buffer","data":Array<number>}
    }
}

export interface uploadPostInput{
    input:{
        "user_id":{"type":"Buffer","data":Array<number>},
        "content":string,
        "media_url":string
    }
}

export interface deletePostInput{
    input:{
        "user_id":{"type":"Buffer","data":Array<number>},
        "post_id":string
    }
}

export interface postLikeInput{
    input:{
        "user_id":{"type":"Buffer","data":Array<number>},
        "post_id":string
    }
}

export interface getFolloweesPostsInput{
    input:{
        "user_id":{"type":"Buffer","data":Array<number>},
        "page":number
    }
}

export interface postCommmentInput{
    input:{
        "post_id":string,
        "user_id":{"type":"Buffer","data":Array<number>},
        "content":string
    }
}

export interface getCommentsInput{
    input:{
        "post_id":string
        "page":number
    }
}

export interface followInput{
    input:{
        "user_id":{"type":"Buffer","data":Array<number>},
        "followee_id":string
    }
}

export interface savePostInput{
    input:{
        "user_id":{"type":"Buffer","data":Array<number>},
        "post_id":string
    }
}

export interface getSavedPostsInput{
    input:{
        "user_id":{"type":"Buffer","data":Array<number>},
        "page":number
    }
}

export interface getFollowersInput{
    input:{
        "profile_id":string,
        "user_id":{"type":"Buffer","data":Array<number>},
        "page":number
    }
}