const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
const {Web3} = require("web3");
const ABI = require("./ABI");


const web3 = new Web3("HTTP://127.0.0.1:7545");
const contractAddress = "0x9F5eFbE2B20171553E1E0ee9d114d82631D2F3E7";
//to create contract instance - abi and contract address
const contract = new web3.eth.Contract(ABI, contractAddress);
//console.log(contract);

const GenderVerification = (gender) => {
    gender = gender.toLowerCase();
    if(gender==="male" || gender==="female" || gender==="others") {
        return true;
    }
    return false;
}

const PartyClash = async(party) => {
    const candidateList = await contract.methods.candidateList().call();
    const exists = candidateList.some((candidate)=>candidate.party.toLowerCase()===party.toLowerCase());
    return exists;
}
app.post("/api/candidate-verify", async(req,res)=>{
    const {gender, party} = req.body;
    console.log(gender,party);
    const genderStatus = GenderVerification(gender);
    const partyClashStatus = await PartyClash(party);
    if(genderStatus===true) {
        if(partyClashStatus===false) {
            res.status(200).json({message: "Registration Successful!"});
        }else{
            res.status(409).json({message: "Party already exists!"});
        }
    }
    else{
        res.status(400).json({message: "Invalid Gender!"});
    }    
})


app.post("/api/time-verify", (req,res)=>{
    const {startInSeconds, endInSeconds}= req.body;
    if(endInSeconds-startInSeconds <86400) {
        res.status(200).json({message: "Time is less than 24 Hours"});
    }else{
        res.status(400).json({message: "Time is greater than 24 Hours"});
    }
})
app.post("/api/voter-verify", (req,res)=>{
    const {gender}= req.body;
    const genderStatus = GenderVerification(gender);
    if(genderStatus===true) {
        res.status(200).json({message: "Registration Successful!"});
    }else{
        res.status(400).json({message: "Invalid Gender!"});
    }
})
app.listen(3000, ()=>{
    console.log("Server is running");
})