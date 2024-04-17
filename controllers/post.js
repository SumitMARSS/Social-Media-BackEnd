const Post = require("../models/post");
const User = require("../models/user");

//create post

exports.createPost = async (req, resp) => {
    try {
        const newPostData = {
            caption: req.body.caption,
            image: {
            public_id: "req.body.public_id",
            url: "req.body.url",
            },
            owner: req.user._id,
        };
    
        const newpost = await Post.create(newPostData);
    
        const user = await User.findById(req.user._id);
        if(!user){
            resp.status(401).json({
                message:'User does not exists, please login first',
                success:false,
            })
        }

        user.posts.push(newpost._id);
    
        await user.save();
        resp.status(200).json({
            success: true,
            newpost,
            message:'Post created successfully',
        });
    } catch (error) {
        resp.status(500).json({
                success: false,
                error: error.message,
                message:"Error while creating post"
        });
    }
};


//delete post

exports.deletePost = async (req, resp) => {
    try {
        const detectpost = await Post.findById(req.params.id);
        if (!detectpost) {
            resp.status(404).json({
            success: false,
            message: "Post Not Found",
            });
        }
    
        if (detectpost.owner.toString() !== req.user._id.toString()) {
            resp.status(401).json({
                success: false,
                message: "Unauthorized access",
            });
        }
    
        await Post.remove();
    
        const user = await User.findById(req.user._id);
        // //if no user exists no nnedd we already ceck owner
        // if(!user){
        //     resp.status(401).json({
        //         success: false,
        //         message: "No user exists",
        //     });
        // }

        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index, 1);
    
        await user.save();
    
        resp.status(200).json({
            success: true,
            message: "Post Deleted successfully",
        });
    } catch (error) {
        resp.status(200).json({
            success: false,
            message: error.message,
        });
    }
};

//likes and dislikes on posts

exports.likeAndDislikePost = async (req, resp) => {
    try {
        //find the post
        const detectpost = await Post.findById(req.params.id);
        //if not their then 
        if (!detectpost) {
            resp.status(404).json({
                success: false,
                message: "Post Not Found",
            });
        }
        // if likes already includes then dislike the post
        if (detectpost.likes.includes(req.user._id)) {
            const index = detectpost.likes.indexOf(req.user._id);
            detectpost.likes.splice(index, 1);
            await detectpost.save();
    
            return resp.status(200).json({
                success: true,
                message: "Post disliked successfully",
            });
            
        } else {    //else like the post
            detectpost.likes.push(req.user._id);
            await detectpost.save();
    
            return resp.status(200).json({
                success: true,
                message: "Post liked successfully",
            });
        }
    } catch (error) {
        resp.status(500).json({
            success: false,
            error: error.message,
            message:'Error while perfroming like and unlike operations'
        });
    }
};

//get following of posts

exports.getPostofFollowing = async (req, resp) => {
    try {
        const user = await User.findById(req.user._id);
    
        const posts = await Post.find({
            owner: {
                $in: user.following,
            },
        });
    
        resp.status(200).json({
            success: true,
            posts,
            message:'All posts are fetched successfully',
        });
    } catch (error) {
        resp.status(500).json({
            success: false,
            error: error.message,
            message:'Error while perfroming get post of following'
        });
    }
};

//update captions

exports.updateCaption = async (req, resp) => {
    try {
        //find post
        const post = await Post.findById(req.params.id);
        //if post not founded
        if (!post) {
            resp.status(404).json({
            success: false,
            message: "Post Not Found",
            });
        } else {
            //check owner authorization
            if (post.owner.toString() !== req.user._id.toString()) {
                resp.status(401).json({
                    success: false,
                    message: "Unauthorized to update caption",
                });
            }
            //save post caption in db
            post.caption = req.body.caption;
    
            await post.save();
    
            resp.status(200).json({
                success: true,
                message: "Caption Updated Successfully",
                post
            });
            
        }
    } catch (error) {
        resp.status(500).json({
            success: false,
            error: error.message,
            message:'Error while perfroming caption update'
        });
    }
};

//comment on post

exports.commentOnPost = async (req, resp) => {
    try {
        //find post
        const post = await Post.findById(req.params.id);
        if (!post) {
            return resp.status(404).json({
            success: false,
            message: "Post Not found",
            });
        }
    
        //finding comment index
        let commentIndex = -1;
        post.comments.forEach((item, index) => {
            if (item.user.toString() === req.user._id.toString()) {
                commentIndex = index;
            }
        });
    
        //if comment is present, then updating
        if (commentIndex !== -1) {
            post.comments[commentIndex].comment = req.body.comment;
            await post.save();
            resp.status(200).json({
                success: true,
                message: "Comment updated successfully",
            });
        }
        //else adding comment
        else {
            post.comments.push({ user: req.user._id, comment: req.body.comment });
            await post.save();
            resp.status(200).json({
                success: true,
                message: "Comment added successfully",
            });
        }
    } catch (error) {
        resp.status(500).json({
            success: false,
            error: error.message,
            message:'Error while commenting/updating on post'
        });
    }
};
  

//delete comment

exports.deleteComment = async (req, resp) => {
    try {
        const post = await Post.findById(req.params.id);
    
        if (!post) {
            return resp.status(404).json({
                succes: false,
                message: "Post Not Found",
            });
        } else {
            //if owner is same
            if (post.owner.toString() === req.user._id.toString()) {
                //if no comment id then we can't delete comment
                if (req.body.commentId == undefined) {
                    return resp.status(400).json({
                        success: false,
                        message: "Comment Id is missing",
                    });
                }
    
                post.comments.forEach((item, index) => {
                    if (item._id.toString() === req.body.commentId.toString()) {
                    return post.comments.splice(index, 1);
                    }
                });
    
                await post.save();
        
                resp.staus(200).json({
                    success: true,
                    message: "Selected comment has deleted",
                });
            } else {
                //delete user random comment
                post.comments.forEach((item, index) => {
                    if (item.user.toString() === req.user._id.toString()) {
                        return post.comments.splice(index, 1);
                    }
                });
    
                await post.save();
    
                resp.staus(200).json({
                    success: true,
                    message: "Your comment has deleted successfully",
                });
            }
        }
    } catch (error) {
        resp.status(500).json({
            success: false,
            error: error.message,
            message:'Error while deleting comments'
        });
    }
};