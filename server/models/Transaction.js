import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, 
  date: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);