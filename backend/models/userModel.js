const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }], // Array of references
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
