const express = require('express');
const mongoose = require('mongoose');

require('./db');
const session = require('express-session');
const path = require('path');
const auth = require('./auth.js');
const { isError } = require('util');

const app = express();

app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'add session secret here!',
    resave: false,
    saveUninitialized: true,
}));
const Article = mongoose.model('Article');
const User = mongoose.model('User');

// add req.session.user to every context object for templates
app.use((req, res, next) => {
    // now you can use {{user}} in your template!
    res.locals.user = req.session.user;
    next();
});

//home
app.get('/', (req, res) => {
    console.log(res.locals.user);
    if (req.session.user ===undefined){
        res.render ('index',{login:false});
    }
    else{
    Article.find({}, function(error, result, count) {
        res.render('index',{login:true,articles: result})
    })
    }
});

app.get('/article/add', (req, res) => {
    if(req.session.user===undefined){//not logged in
        res.redirect('/login');
    }
    else{
        res.render('article-add');
    }
});

app.post('/article/add', (req, res) => {
    if(req.session.user===undefined){//not logged in
        res.redirect('/login');
    }
    else{
        const newArticle= new Article({
            title:req.body.title,
            url:req.body.url,
            description: req.body.description,
            addedBy: req.session.user._id
        });
        newArticle.save(function(err, result,count){
        if (err!==null){ 
            console.log(result);
            console.log('NEW ARTICLE SAVE ERROR');
            res.render('article-add',{message:'NEW ARTICLE SAVE ERROR'});
        }
        else { //success 
            console.log(result);
            res.redirect('/');
        }
        })
    }

});

//come up with a url for /article/slug-name!
app.get('/article/:slug', (req, res) => {
    const details= req.params.slug;
    Article.findOne({slug: details},(err, article,count)=>{
        User.findOne({_id: article.addedBy},(err,user,count)=> {
            res.render('article-detail',{article:article, user:user});
        } )
    } )
});

//display the form 
app.get('/register', (req, res) => {
    res.render('register');
});

//process the form input
app.post('/register', (req, res) => {
    const input=req.body;
    console.log(input);
    auth.register(input.username, input.email, input.password, 
        (error) =>{ //error cb
        res.render('register',{message:error.message});
    },
        (user)=>{ //success callback
            auth.startAuthenticatedSession(req,user, (obj) =>{
                console.log(obj);
                res.redirect('/');
            });
        });
});

        

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    auth.login(req.body.username, req.body.password, 
        (error)=>{//error cb
            res.render('login',{message:error.message});
    }, 
        (user)=>{//success cb
            auth.startAuthenticatedSession(req,user,(obj)=>{
                req.session.user=user;
                res.redirect('/');
            });
    }
    
    );
});

//extra credit: route that shows only the articles added by a certain user
app.get('/:username',(req, res) => {
    //console.log(req.params);
    User.findOne({username:req.params.username }, (err, user,count)=>{
        Article.find({addedBy: user._id},(err, article,count)=>{
            //console.log(article);
            res.render('article-user',{article:article, user: user});
        } )
    })
});

app.listen(3000);
