
const User = require("../models/user");
const Post = require("../models/post");


//update profile

exports.updateProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      const { name, email } = req.body;
  
      if (name) user.name = name;
      if (email) user.email = email;
  
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Profile Updated",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
};

//followed and unfollowed user

exports.followandUnfollowUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const loggedInUser = await User.findById(req.user._id);
    
        if (!userToFollow) {
            return res.status(404).json({
            success: false,
            message: "User Not Found",
            });
        }
    
        if (loggedInUser.following.includes(userToFollow._id)) {
            const indexfollowing = loggedInUser.following.indexOf(userToFollow._id);
            loggedInUser.following.splice(indexfollowing, 1);
    
            const indexfollowers = userToFollow.followers.indexOf(loggedInUser._id);
            userToFollow.followers.splice(indexfollowers, 1);
    
            await loggedInUser.save();
            await userToFollow.save();
    
            res.status(200).json({
            success: true,
            message: "User Unfollowed",
            });
        } else {
            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);
    
            await loggedInUser.save();
            await userToFollow.save();
    
            res.status(200).json({
            success: true,
            message: "User Followed",
            });
        }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
};
  
//delete my profile

exports.deleteMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const posts = user.posts;
        const followers = user.followers;
        const following = user.following;
        const userId = user._id;
    
        await user.remove();
    
        //log out user
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        });
    
        //delete all posts of user
        for (let i = 0; i < posts.length; ++i) {
            const post = await Post.findById(posts[i]);
            await post.remove();
        }
    
        //removing user from follower's following
        for (let i = 0; i < followers.length; ++i) {
            const follower = await User.findById(followers[i]);
            const index = follower.following.indexOf(userId);
            follower.following.splice(index, 1);
            await follower.save();
        }
    
        //removing user from following's follower
        for (let i = 0; i < following.length; ++i) {
            const followed = await User.findById(following[i]);
            const index = followed.followers.indexOf(userId);
            followed.followers.splice(index, 1);
            await followed.save();
        }
    
        res.status(200).json({
            success: true,
            message: "Profile Deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//get profile details

exports.myProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("posts");
    
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//get user profile

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("posts");
        if (!user) {
            return res.status(404).json({
            success: false,
            message: "User Not found",
            });
        }
  
        res.status(200).json({
            success: true,
            message:"User profile fetched successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//get all users

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
    
        res.status(200).json({
            success: true,
            users,
            message:"All users fetched successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message:"Error while fetching all users",
        });
    }
};

