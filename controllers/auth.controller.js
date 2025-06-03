// import UserModel from "../models/user.model.js";
// import bcryptjs from 'bcryptjs'

// const register = async (req, res) => {
//     try {
//         const { username, password, shops } = req.body;

//         // Validate input
//         if (!username || !password || !shops || shops.length < 3) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Shop least 3 shop names are required"
//             });
//         }

//         const existUser = await UserModel.findOne({ username })
//         if (existUser) {
//             return res.status(401).json({ success: false, message: "User already exists" })
//         }
//         const hasepassword = await bcryptjs.hashSync(password, 10)
//         const newUser = new UserModel({
//             username, password: hasepassword, shops
//         })

//         await newUser.save()

//         res.status(200).json({ newUser })

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Internal Server Error" })
//         console.log(error);
//     }
// }

// export { register }

import UserModel from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken'

const register = async (req, res) => {
    try {
        const { username, password, shops } = req.body;
        // Pre-validate password before hashing
        if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/.test(password.trim())) {
            return res.status(400).json({
                success: false,
                message: "Password must be 8+ chars with 1 number and 1 special character"
            });
        }
        const trimmedPassword = password.trim(); // Trim whitespace

        // Validate input
        if (!username || !password || !shops || shops.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Username, password and at least 3 shop names are required"
            });
        }

        // Check if username exists
        const existUser = await UserModel.findOne({ username });
        if (existUser) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        // Check if any shop names already exist in the system
        const existingShops = await UserModel.findOne({
            shops: { $in: shops }
        });

        if (existingShops) {
            return res.status(409).json({
                success: false,
                message: "One or more shop names already exist in the system"
            });
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(trimmedPassword, 10);
        const newUser = new UserModel({
            username,
            password: hashedPassword,
            shops
        });

        await newUser.save();

        // Return user data without password
        const userToReturn = { ...newUser.toObject() };
        delete userToReturn.password;

        res.status(201).json({
            success: true,
            user: userToReturn
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === 11000) {
            // MongoDB duplicate key error (for shops)
            return res.status(409).json({
                success: false,
                message: "One or more shop names already exist in the system"
            });
        } else if (error.name === 'ValidationError') {
            // Handle password validation errors
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body

        const user = await UserModel.findOne({ username })

        if (!user) {
            return res.status(404).json({ success: false, message: "Invalid credentials" })
        }

        const ispassaowrdValid = await bcryptjs.compare(password, user.password)
        if (!ispassaowrdValid) {
            return res.status(404).json({ success: false, message: "Invalid credentials" })

        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRETE)

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 3600000,
            sameSite: "lax",
            path: "/"


        })

        res.status(200).json({ success: true, message: "Login successfully", user, token })
    } catch (error) {
        res.status(500).json({ success: false, message: "interanl server error" })
        console.log(error)
    }
}



const logout = async (req, res) => {
    try {
        res.clearCookie('token')
        res.status(200).json({ message: "user Logout successfully" })
    } catch (error) {
        res.status(500).json({ success: false, message: "interanl server error" })
        console.log(error)
    }
}

const getMe = async (req, res) => {
    try {
        // Get user ID from JWT
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRETE);

        // Fetch user without password
        const user = await UserModel.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(401).json({ success: false, message: "Not authorized" });
    }
};

export { register, login, logout, getMe };