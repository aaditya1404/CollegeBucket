const express = require("express");
const router = new express.Router();
const Products = require("../models/productsSchema");
const USER = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");
const Sell = require("../models/sellSchema");


//get productdata api
router.get("/getproducts", async (req, res) => {
    try {
        const productsdata = await Products.find()
        // console.log("console the data" + productsdata);
        res.status(201).json(productsdata);
    } catch (error) {
        console.log("error" + error.message);
    }
});


// get individual data
router.get("/getproductsone/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // console.log(id);
        const individualdata = await Products.findOne({ id: id });
        // console.log(individualdata + "ind mila hai");
        res.status(201).json(individualdata);
    } catch (error) {
        res.status(400).json(indivdualdata);
        console.log("error" + error.message);
    }
});


//register data
router.post("/register", async (req, res) => {
    // console.log(req.body);
    const { fname, email, mobile, password, cpassword } = req.body;
    if (!fname || !email || !mobile || !password || !cpassword) {
        res.status(422).json({ error: "fill the all data" });
        console.log("No data available");
    };
    try {
        const preuser = await USER.findOne({ email: email });
        if (preuser) {
            res.status(422).json({ error: "This user is already present" })
        }
        else if (password !== cpassword) {
            res.status(422).json({ error: "password and cpassword does not match" })
        }
        else {
            const finalUser = new USER({
                fname, email, mobile, password, cpassword
            });

            // password hashing process

            const storedata = await finalUser.save();
            console.log(storedata);
            res.status(201).json(storedata);
        }
    } catch (error) {

    }
});



// login user api
router.post("/login", async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "Fill all the details" });
    };
    try {

        const userlogin = await USER.findOne({ email: email });
        console.log(userlogin + "uservalue");

        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);
            console.log(isMatch);

            // token generate

            const token = await userlogin.generateAuthtoken();
            // console.log(token);

            // coookies
            
            res.cookie("CollegeBucket", token, {
                expires: new Date(Date.now() + 900000),
                httpOnly: true
            });

            if (!isMatch) {
                res.status(400).json({ error: "invalid" });
            } else {
                res.status(201).json(userlogin);
            }

        } else {
            res.status(400).json({ error: "user not exist" });
        }

    } catch (error) {
        res.status(400).json({ error: "invalid credentials" });
    }
});



// adding the data into cart
router.post("/addcart/:id",authenticate, async (req, res) => {
    try {
        // console.log("perfect 6");
        const { id } = req.params;
        const cart = await Products.findOne({ id: id });
        console.log(cart + "cart value");

        const UserContact = await USER.findOne({ _id: req.userID });
        console.log(UserContact );

        if (UserContact) {
            const cartData = await UserContact.addcartdata(cart);
            await UserContact.save();

            console.log(cartData);
            // console.log(UserContact + "userjode save");
            res.status(201).json(UserContact);
        }else{
            res.status(401).json({error: "invalid user"});
        }
    } catch (error) {
        res.status(401).json({error: "invalid user"});
    }
});

// get data into the cart
router.get("/cartdetails", authenticate, async (req, res) => {
    try {
        const buyuser = await USER.findOne({ _id: req.userID });
        console.log(buyuser + "user hain buy pr");
        res.status(201).json(buyuser);
    } catch (error) {
        console.log(error + "error for buy now");
    }
});


// logout user api
router.get("/logout", authenticate, async (req, res) => {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
            return curelem.token !== req.token
        });

        res.clearCookie("CollegeBucket", { path: "/" });
        req.rootUser.save();
        res.status(201).json(req.rootUser.tokens);
        console.log("user logout");

    } catch (error) {
        console.log(error + "not logout");
    }
});

module.exports = router;