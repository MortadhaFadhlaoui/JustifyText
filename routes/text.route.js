// routes/text.route.js

const express = require("express"),
    app = express(),
    textRoutes = express.Router(),
    jwt = require('jsonwebtoken'),
    config = require('../config/config'),
    middleware = require('./middleware');

// Require User model in our routes module
let User = require("../models/User");

// Store user and generate unique token for him
textRoutes.route("/token").post(function(req, res) {
    /* POST api/token */
    User.findOne({email:req.body.email}, function (err, user){
        if (user){
            let token = jwt.sign({username: user.email},
                config.secret,
                {
                    expiresIn: '24h' // expires in 24 hours
                }
            );
            res.status(200).json({
                success: true,
                message: 'Authentication successful!',
                token: token
            });
        } else {
            // create a new user from Request client (json format)
            let user = new User(req.body);

            //save user object to database
            user
                .save()
                .then(user => {
                    let token = jwt.sign({username: user.email},
                        config.secret,
                        {
                            expiresIn: '24h' // expires in 24 hours
                        }
                    );

                    res.status(200).json({
                        success: true,
                        message: 'User is added successfully!',
                        token: token
                    });
                })
                .catch(err => {
                    res.status(400).json({
                        success: false,
                        message: 'Unable to save user to database!',
                    });
                });
        }
    });
});

// Defined store route
textRoutes.route("/justify").post(middleware.checkToken, function(req, res) {
    /* POST api/justify */
    //variables
    const currentDate = new Date();
    // find user via token
    User.findOne({email:req.decoded.username}, function (err, user){
        if (user){
            let lastTextLength = user.limitWords;
            if (user.startDate){
                //difference hours between first justified text in 24 hours and now date
                let hours = Math.abs(user.startDate - currentDate) / 36e5;
                if (hours>=24){ /* reinitialise uses for this token */
                    lastTextLength = 0;
                    justifyText(lastTextLength,user,currentDate,req,res);
                }else { /* otherwise go ahead for uses for this token */
                    justifyText(lastTextLength,user,user.startDate,req,res);
                }
            }else {
                justifyText(lastTextLength,user,currentDate,req,res);
            }
        }else {
            res.status(404).json({
                success: false,
                message: 'User not found!',
            });
        }
    });
});

function justifyText(lastTextLength,user,currentDate,req,res){
    // variables
    let justifyText = "",
    paragraphs = [];

    const text = req.body,
    textLength = text.split(/[\s]+/).length;

    if (lastTextLength+textLength>80000){/* reach limit words for this token */
        res.status(402).json({
            success: false,
            message: 'Payment Required.',
        });
    }else {
        user.limitWords = lastTextLength + textLength;
        user.startDate = currentDate;
        user.save().then(user => {
            // split the text in array of paragraphs
            paragraphs = text.split(/\n\s*\n/);

            // justify all paragraph and return the text justified
            justifyText = groupParagraph(paragraphs);
            res.status(200).send(justifyText);
        })
            .catch(err => {
                res.status(400).json({
                    success: true,
                    message: 'Something wrong',
                });
            });
    }
}

function textJustification(words) {
    // variables
    const L = 80;  /* length of text lines */
    let lines = [], index = 0, text ="";

    // outer loop to loop through words
    while(index < words.length) {
        let count = words[index].length;
        let last = index + 1;

        while(last < words.length) {
            // we've reached the limit for chars in a line.
            if (words[last].length + count + 1 > L) break;

            // otherwise increase the amount of chars, and go   // to the next word
            count += words[last].length + 1;
            last++;
        }

        let line = "";
        let difference = last - index - 1;

        // if we're on the last line or the number of words in the line is
        // 1, we left justify
        if (last === words.length || difference === 0) {
            for (let i = index; i < last; i++) {
                line += words[i] + " ";
            }

            line = line.substr(0, line.length - 1);
            for (let i = line.length; i < L; i++) {
                line += " ";
            }
        } else {
            // now we need to middle justify, which is putting equal amount
            // of spaces between words
            let spaces = (L - count) / difference;
            let remainder = (L - count) % difference;

            for (let i = index; i < last; i++) {
                line += words[i];

                if( i < last - 1) {
                    let limit = spaces + ((i - index) < remainder ? 1 : 0);
                    for (let j = 0; j <= limit; j++) {
                        line += " ";
                    }
                }
            }
        }
        lines.push(line);
        index = last;
    }
    for (let i = 0; i < lines.length; i++) {
        text += lines[i] +"\n";
    }
    return text
}

// Justify paragraphs and return the test justified
function groupParagraph(paragraphs){
    let justifyText = "";
    for (let i = 0; i < paragraphs.length; i++){
          let words = paragraphs[i].split(/[\s]+/);
           justifyText += textJustification(words) ;
        }
        return justifyText;
}

module.exports = textRoutes;
