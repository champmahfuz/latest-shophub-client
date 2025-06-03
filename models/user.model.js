// import mongoose from "mongoose";

// const userSechmea = new mongoose.Schema({
//     username: {
//         type: String,
//         required: true
//     },

//     password: {
//         type: String,
//         required: true
//     },
//     shops: {
//         type: [String], // Array of strings
//         required: true,
//         validate: {
//             validator: function (v) {
//                 return v.length >= 3; // At least 3 shops required
//             },
//             message: props => `Please provide at least 3 shop names, you provided ${props.value.length}`
//         }
//     }
// }, { timestamps: true })


// const UserModel = mongoose.model('users', userSechmea)


// export default UserModel

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                const trimmed = v.trim();
                return (
                    trimmed.length >= 8 &&              // Minimum 8 chars
                    /[0-9]/.test(trimmed) &&            // Contains at least 1 number
                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(trimmed)  // Contains at least 1 special char
                );
            },
            message: () => `Password must:
    - Be at least 8 characters long
    - Contain at least 1 number (0-9)
    - Contain at least 1 special character (!@#$%^&* etc.)`
        }
    },
    shops: {
        type: [String],
        required: true,
        validate: {
            validator: function (v) {
                return v.length >= 3;
            },
            message: props => `Please provide at least 3 shop names`
        }
    }
}, { timestamps: true });

// Add index to ensure shop names are unique across all users
userSchema.index({ shops: 1 }, { unique: true, sparse: true });

const UserModel = mongoose.model('users', userSchema);

export default UserModel;