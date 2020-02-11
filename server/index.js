const express = require('express');
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words');
const rateLimit = require("express-rate-limit");

const app = express();

const db = monk(process.env.MONGO_URI || 'localhost/tweet');
const tweet = db.get('tweet');
const filter = new Filter();


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'hello world'
    })
})

app.get('/tweet', (req,res) => {
    tweet
        .find()
        .then(post => {
            res.json(post)
        })
})


function isValidPost(post) {
    return post.name && post.name.toString().trim() !== '' &&
        post.content && post.content.toString().trim() !== '';
}

const limiter = rateLimit({
    windowMs: 30 * 1000, // 30 seconds
    max: 1// limit each IP to 100 requests per windowMs
  });

app.use(limiter);


app.post('/tweet', (req, res) => {
    if (isValidPost(req.body)) {
        //insert into db
        const post = {
            name: filter.clean(req.body.name.toString()),
            content: filter.clean(req.body.content.toString()),
            created: new Date()
        };
        

        tweet
            .insert(post)
            .then(post => {
                res.json({
                    post
                })
            })
    } else {
        res.status(422);
        res.json({
            message: 'name and content are required'
        })
    }

})

const port = 5000;
app.listen(port, () => {
    console.log(`Listening on port: ${port}`);

})